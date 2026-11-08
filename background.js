// NooXGFree Background Service Worker - Developed by NooXRii

const EPIC_FREE_GAMES_URL = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=tr&country=TR&allowCountries=TR';
const EPIC_PURCHASE_URL = 'https://store.epicgames.com/purchase';
const STEAM_SPECIALS_URL = 'https://store.steampowered.com/search/?maxprice=free&specials=1';
const STEAM_LICENSES_URL = 'https://store.steampowered.com/account/licenses/';
const FAB_LIMITED_TIME_FREE_URL_TR = 'https://www.fab.com/tr/limited-time-free';

chrome.runtime.onInstalled.addListener(() => {
  ensureAlarm();
  fetchFreeGames();
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  fetchFreeGames();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkGames') fetchFreeGames();
});

// Alarmlar tarayıcı yeniden başlayınca silinebilir; yoksa yeniden oluştur
function ensureAlarm() {
  chrome.alarms.get('checkGames', (alarm) => {
    if (!alarm) chrome.alarms.create('checkGames', { periodInMinutes: 120 });
  });
}
ensureAlarm();

// Aynı anda tek tarama: kurulum + popup aynı anda tetiklerse Discord'a çift mesaj gitmesin
let scanPromise = null;
function fetchFreeGames() {
  if (!scanPromise) scanPromise = runScan().finally(() => { scanPromise = null; });
  return scanPromise;
}

// Uzun süre yanıt vermeyen istekler service worker'ı askıda bırakmasın
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const isStillActive = (g) => typeof g?.endDate !== 'number' || g.endDate > Date.now();

async function runScan() {
  try {
    const prev = await chrome.storage.local.get(['games', 'seenUrls', 'pendingDiscord']);
    const prevGames = prev?.games || {};
    const prevList = [...(prevGames.epic || []), ...(prevGames.steam || []), ...(prevGames.fab || [])];
    const prevUrls = new Set(prevList.map(g => g?.url).filter(Boolean));
    // Popup açılana kadar "Yeni" etiketi korunur; yoksa bir sonraki taramada kullanıcı görmeden kaybolur
    const unseenUrls = new Set(prevList.filter(g => g?.isNew).map(g => g.url));
    // Kalıcı "görülmüş" listesi: bir platform geçici olarak hata verirse aynı oyunlar tekrar "yeni" sayılıp Discord'a tekrar gitmesin
    const seenUrls = new Set([...(prev?.seenUrls || []), ...prevUrls]);

    const [epicGames, steamGames, fabGames] = await Promise.all([
      fetchEpicGames(),
      fetchSteamGames(),
      fetchFabLimitedTimeFree()
    ]);

    // Sadece bu taramada başarıyla çekilen ve daha önce görülmemiş oyunlar
    const newlyFoundGames = [epicGames, steamGames, fabGames]
      .flatMap(list => list === null ? [] : list.filter(g => !seenUrls.has(g.url)));

    // null = o platformun çekimi başarısız oldu → eski veriyi koru (listeyi boşaltma)
    const markNew = (list) => list.map(g => ({ ...g, isNew: !seenUrls.has(g.url) || unseenUrls.has(g.url) }));
    const epicMarked = epicGames === null ? (prevGames.epic || []) : markNew(epicGames);
    const steamMarked = steamGames === null ? (prevGames.steam || []) : markNew(steamGames);
    const fabMarked = fabGames === null ? (prevGames.fab || []) : markNew(fabGames);

    const allGames = { epic: epicMarked, steam: steamMarked, fab: fabMarked, lastUpdate: Date.now() };

    [...epicMarked, ...steamMarked, ...fabMarked].forEach(g => { if (g?.url) seenUrls.add(g.url); });
    await chrome.storage.local.set({ games: allGames, seenUrls: Array.from(seenUrls).slice(-300) });

    console.log(`[SİSTEM] Tarama bitti. ${newlyFoundGames.length} adet yeni oyun bulundu.`);

    // Önceki taramada gönderilemeyenler + yeni oyunlar
    const pendingUrls = new Set(newlyFoundGames.map(g => g.url));
    const toSend = [
      ...(prev?.pendingDiscord || []).filter(g => isStillActive(g) && !pendingUrls.has(g.url)),
      ...newlyFoundGames
    ];

    // Eğer cidden yeni oyun varsa Discord'a yolla
    if (toSend.length > 0) {
        const data = await chrome.storage.local.get(['discordWebhookUrl']);
        if (data.discordWebhookUrl) {
            console.log("[SİSTEM] Webhook bulundu, Discord'a gönderim başlatılıyor...");
            // Gönderilemeyenler saklanır, bir sonraki taramada tekrar denenir
            const failed = await sendToDiscord(data.discordWebhookUrl, toSend);
            await chrome.storage.local.set({ pendingDiscord: failed });
        } else {
            console.warn("[UYARI] Yeni oyun var ama Webhook URL'si kaydedilmemiş!");
            await chrome.storage.local.set({ pendingDiscord: [] });
        }
    }

    await syncOwned();

    // Rozet, popup açılana kadar görülmemiş oyunların toplamını gösterir
    const unseenCount = [...epicMarked, ...steamMarked, ...fabMarked].filter(g => g.isNew).length;
    chrome.action.setBadgeText({ text: unseenCount > 0 ? unseenCount.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#00D964' });

    return allGames;
  } catch (err) {
    console.error("[HATA] fetchFreeGames içinde bir sorun oluştu:", err);
  }
}

async function fetchEpicGames() {
  try {
    const res = await fetchWithTimeout(EPIC_FREE_GAMES_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    
    const games = [];
    const elements = json.data?.Catalog?.searchStore?.elements || [];
    
    elements.forEach(game => {
      // Aktif promosyon var mı kontrolü
      const activePromo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
      const isFree = game.price?.totalPrice?.discountPrice === 0;

      if (activePromo && isFree) {
        
        // 1. DOĞRU RESMİ BULMA (Dikey resim öncelikli)
        const imgTypes = ['OfferImageTall', 'Thumbnail', 'OfferImageWide', 'DieselStoreFrontWide', 'VaultClosed'];
        let imgUrl = '';
        for (let type of imgTypes) {
            let imgObj = game.keyImages?.find(i => i.type === type);
            if (imgObj && imgObj.url) {
                imgUrl = imgObj.url;
                break;
            }
        }
        
        if (!imgUrl && game.keyImages?.length > 0) {
            imgUrl = game.keyImages[0].url;
        }

        // 2. DOĞRU OYUN LİNKİNİ (SLUG) BULMA
        let customSlugObj = game.customAttributes?.find(attr => attr.key === "com.epicgames.app.productSlug");
        let customSlug = customSlugObj ? customSlugObj.value : null;
        
        // offerMappings önce: eklentilerde catalogNs ana oyunun sayfasını gösterir
        let slug = game.offerMappings?.[0]?.pageSlug || game.catalogNs?.mappings?.[0]?.pageSlug || game.productSlug || customSlug || game.urlSlug;
        // Sayfası bilinmeyen oyunlar birbirine karışmasın diye adrese teklif kimliği eklenir
        let gameUrl = `https://store.epicgames.com/tr/free-games#${game.id}`;
        const isMystery = !slug || slug === "[]" || slug.includes("mysterygame") || game.title.includes("Mystery Game");

        if (!isMystery) {
            slug = slug.replace("/home", "");
            const pathType = game.offerType === 'BUNDLE' ? 'bundles' : 'p';
            gameUrl = `https://store.epicgames.com/tr/${pathType}/${slug}`;
        }

        // 3. İSİM DÜZELTMESİ
        let displayTitle = game.title;
        if (displayTitle.includes("Mystery Game") || displayTitle === "[]") {
            displayTitle = "Gizemli Oyun (Kasa)";
        }

        // Listeye Eklerken HEM image HEM thumbnail olarak gönderiyoruz
        games.push({
          title: displayTitle,
          url: gameUrl,
          image: imgUrl,           // Güvenlik amaçlı
          thumbnail: imgUrl,       // Arayüzünün asıl okuduğu anahtar
          endDate: new Date(activePromo.endDate).getTime(),
          platform: 'Epic Games',
          // Toplu ödeme sayfası için (gizemli oyunların gerçek teklifi henüz yok)
          ...(isMystery ? {} : { offerId: game.id, namespace: game.namespace })
        });
      }
    });
    
    return games;
  } catch (error) {
    console.error("Epic Games verisi çekilirken hata oluştu:", error);
    return null;
  }
}

async function fetchSteamGames() {
  try {
    const res = await fetchWithTimeout(STEAM_SPECIALS_URL, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,tr-TR,tr;q=0.8'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const freeGames = [];
    const appIds = [...new Set(html.match(/data-ds-appid="(\d+)"/g)?.map(m => m.match(/\d+/)[0]) || [])].slice(0, 15);

    for (const appId of appIds) {
      try {
        const dRes = await fetchWithTimeout(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=turkish`);
        const dData = await dRes.json();
        if (dData[appId] && dData[appId].success) {
          const g = dData[appId].data;
          // Yalnızca "ücretsiz sahip ol" promosyonları: ücretsiz lisans paketi + %100 indirim (F2P oyunlar elenir)
          const freeSub = (g.package_groups || []).flatMap(pg => pg.subs || []).find(s => s.is_free_license);
          if (freeSub && g.price_overview?.discount_percent === 100) {
            const sRes = await fetchWithTimeout(`https://store.steampowered.com/app/${appId}/?l=turkish`);
            const sHtml = await sRes.text();
            const endTs = parseSteamEndDateFromHtml(sHtml);

            freeGames.push({
              title: g.name,
              thumbnail: g.header_image,
              url: `https://store.steampowered.com/app/${appId}`,
              endDate: endTs,
              platform: 'Steam',
              subId: freeSub.packageid,
              // DLC ise: ana oyun olmadan alınamaz
              ...(g.fullgame?.appid ? { baseAppId: Number(g.fullgame.appid), baseName: g.fullgame.name } : {})
            });
          }
        }
      } catch (e) { console.warn('[Steam API] appId doğrulama hatası', e); }
    }

    // İsim bazlı dedupe
    const seen = new Set();
    const deduped = [];
    for (const it of freeGames) {
      const key = (it.title || '').toLowerCase().replace(/[\s\-–—_:;,.!"'\/\\]+/g, ' ').trim();
      if (!seen.has(key)) { seen.add(key); deduped.push(it); }
    }

    return deduped;
  } catch (err) { console.error('[Steam] fetchSteamGames hata:', err); return null; }
}

function parseSteamEndDateFromHtml(sHtml) {
  if (!sHtml || typeof sHtml !== 'string') return null;

  // Sayfadaki kesin bitiş zamanı (saat dilimi sorunu yok); yoksa görünen metne düş
  const exact = sHtml.match(/free_to_keep_ends(?:&quot;|")\s*:\s*(\d{9,})/);
  if (exact) return Number(exact[1]) * 1000;

  const re = /(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]{3,})\s*@\s*(\d{1,2}):(\d{2})/g;
  let last = null;
  let m;
  while ((m = re.exec(sHtml)) !== null) last = m;
  if (!last) return null;

  const day = Number(last[1]);
  const mon = (last[2] || '').toLowerCase();
  const hour = Number(last[3]);
  const minute = Number(last[4]);

  const months = {
    'oca': 0, 'ocak': 0,
    'şub': 1, 'sub': 1, 'şubat': 1, 'subat': 1,
    'mar': 2, 'mart': 2,
    'nis': 3, 'nisan': 3,
    'may': 4, 'mayıs': 4, 'mayis': 4,
    'haz': 5, 'haziran': 5,
    'tem': 6, 'temmuz': 6,
    'ağu': 7, 'agu': 7, 'ağustos': 7, 'agustos': 7,
    'eyl': 8, 'eylül': 8, 'eylul': 8,
    'eki': 9, 'ekim': 9,
    'kas': 10, 'kasım': 10, 'kasim': 10,
    'ara': 11, 'aralık': 11, 'aralik': 11,
  };

  const mon3 = mon.slice(0, 3);
  const month = months[mon] ?? months[mon3];
  if (month === undefined) return null;

  const now = new Date();
  const year = now.getFullYear();
  let dt = new Date(year, month, day, hour, minute, 0, 0);
  if (dt.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    dt = new Date(year + 1, month, day, hour, minute, 0, 0);
  }
  return dt.getTime();
}

function parseTurkishDateToTimestamp(day, monthName, hour, minute) {
  const months = {
    'ocak': 0, 'şubat': 1, 'subat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'mayis': 4, 'haziran': 5,
    'temmuz': 6, 'ağustos': 7, 'agustos': 7, 'eylül': 8, 'eylul': 8, 'ekim': 9, 'kasım': 10, 'kasim': 10, 'aralık': 11, 'aralik': 11
  };
  const m = months[(monthName || '').toLowerCase()] ?? null;
  if (m === null) return null;

  const now = new Date();
  let year = now.getFullYear();

  const d = Number(day);
  const h = Number(hour);
  const min = Number(minute);
  if (!Number.isFinite(d) || !Number.isFinite(h) || !Number.isFinite(min)) return null;

  let dt = new Date(year, m, d, h, min, 0, 0);
  if (dt.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    dt = new Date(year + 1, m, d, h, min, 0, 0);
  }
  return dt.getTime();
}

function extractFabEndDateFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  
  // Fab'ın kullanabileceği farklı tarih formatları (Örn: "15 Mayıs 18:00", "(15 Mayıs 18:00 TSİ)", "Bitiş: 15 Mayıs 18.00")
  const regexes = [
    /\(\s*(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)[^\d]*(\d{1,2})[.:](\d{2})\s*(?:TSİ|UTC|GMT)?\s*\)/i,
    /(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(?:saat|günü|'e kadar)?[^\d]*(\d{1,2})[.:](\d{2})/i,
    /bitiş[^\d]*(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{1,2})[.:](\d{2})/i
  ];

  for (let re of regexes) {
    // İlk eşleşme tarih olmayabilir ("12 öğe 10:30" gibi); geçerli olana kadar devam et
    for (const m of html.matchAll(new RegExp(re.source, 'gi'))) {
      const ts = parseTurkishDateToTimestamp(m[1], m[2], m[3], m[4]);
      if (ts) return ts; // Geçerli bir tarih bulursa hemen döndür
    }
  }
  return null;
}

// Kapak için çok küçük olmayan ilk önizleme
function pickFabThumbnail(listing) {
  const images = listing?.thumbnails?.[0]?.images || [];
  const sized = [...images].sort((a, b) => (a.width || 0) - (b.width || 0));
  return (sized.find(i => i.width >= 320) || sized[sized.length - 1])?.url || null;
}

// Bir listelemenin ücretsiz lisansı: profesyonel ücretsizse o, değilse kişisel
function pickFabFreeLicense(listing) {
  const free = (listing?.licenses || []).filter(l => l.offerId && l.priceTier?.discountedPrice === 0);
  return free.find(l => l.slug === 'professional') || free.find(l => l.slug === 'personal') || free[0] || null;
}

function parseFabLimitedTimeFree(html) {
  const jsonMatch = html.match(/<script[^>]*id="js-json-data-prefetched-data"[^>]*>([\s\S]*?)<\/script>/i);
  if (!jsonMatch) return null;
  const jsonData = JSON.parse(jsonMatch[1]);
  const tiles = jsonData['/i/blades/free_content_blade']?.tiles;
  if (!Array.isArray(tiles)) return null;

  const pageEndDate = extractFabEndDateFromHtml(html);
  const games = [];
  for (const { listing } of tiles) {
    const license = pickFabFreeLicense(listing);
    if (!listing?.uid || !license) continue;

    const ts = new Date(license.priceTier.discountEndDate).getTime();
    games.push({
      title: listing.title || "Fab Ücretsiz İçerik",
      url: `https://www.fab.com/listings/${listing.uid}`,
      thumbnail: pickFabThumbnail(listing),
      endDate: Number.isFinite(ts) ? ts : (pageEndDate || "Sınırlı Süre"),
      platform: 'Fab',
      listingId: listing.uid,
      offerId: license.offerId
    });
  }
  return games;
}

async function fetchFabLimitedTimeFree() {
  try {
    const res = await fetchWithTimeout(FAB_LIMITED_TIME_FREE_URL_TR, {
      headers: {
        'Accept': 'text/html,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
      }
    });
    if (!res.ok) return null;
    return parseFabLimitedTimeFree(await res.text());
  } catch (err) {
    console.error('[Fab] ❌ Fetch Error:', err);
    return null;
  }
}

// ---------- Kütüphane kontrolü ----------

// Her mağaza kendi oturumunla sorgulanır. Giriş yoksa veya sorgu başarısızsa o mağaza atlanır (hiçbir şey işaretlenmez).
async function findOwnedSteam(games) {
  if (games.length === 0) return [];
  const res = await fetchWithTimeout(`https://store.steampowered.com/dynamicstore/userdata/?t=${Date.now()}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await res.json();
  const packages = new Set(data.rgOwnedPackages || []);
  const apps = new Set(data.rgOwnedApps || []);
  return games.filter((g) => {
    const appId = Number(g.url.match(/\/app\/(\d+)/)?.[1]);
    return packages.has(g.subId) || apps.has(appId);
  });
}

async function findOwnedFab(games) {
  const owned = [];
  for (const game of games.filter(g => g.listingId)) {
    const res = await fetchWithTimeout(`https://www.fab.com/i/users/me/listings-states/${game.listingId}`, { credentials: 'include' });
    if (res.ok && (await res.json()).acquired === true) owned.push(game);
  }
  return owned;
}

const EPIC_OWNERSHIP_QUERY = 'query getEntitledOfferItems($namespace:String!,$offerId:String!){Launcher{entitledOfferItems(namespace:$namespace,offerId:$offerId){entitledToAllItemsInOffer entitledToAnyItemInOffer}}}';

async function findOwnedEpic(games) {
  const owned = [];
  for (const game of games.filter(g => g.offerId && g.namespace)) {
    const res = await fetchWithTimeout('https://store.epicgames.com/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: EPIC_OWNERSHIP_QUERY, variables: { namespace: game.namespace, offerId: game.offerId } })
    });
    if (!res.ok) continue;
    const items = (await res.json()).data?.Launcher?.entitledOfferItems;
    if (items?.entitledToAllItemsInOffer && items?.entitledToAnyItemInOffer) owned.push(game);
  }
  return owned;
}

// Kütüphanede olanları işaretler. Aynı anda tek kontrol çalışır.
let ownedSyncPromise = null;
function syncOwned() {
  if (!ownedSyncPromise) ownedSyncPromise = runOwnedSync().finally(() => { ownedSyncPromise = null; });
  return ownedSyncPromise;
}

async function runOwnedSync() {
  const data = await chrome.storage.local.get(['games', 'claimedGames']);
  const unclaimed = (list) => (list || []).filter(g => g?.url && isStillActive(g) && !data.claimedGames?.[g.url]);

  const results = await Promise.allSettled([
    findOwnedEpic(unclaimed(data.games?.epic)),
    findOwnedSteam(unclaimed(data.games?.steam)),
    findOwnedFab(unclaimed(data.games?.fab))
  ]);
  const owned = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  results.filter(r => r.status === 'rejected').forEach(r => console.warn('[Kütüphane] Kontrol başarısız:', r.reason));
  if (owned.length === 0) return 0;

  // Kontrol sürerken değişmiş olabilir, en güncel kayda eklenir
  const fresh = await chrome.storage.local.get(['claimedGames', 'claimNotes']);
  const merged = { ...(fresh.claimedGames || {}) };
  const notes = { ...(fresh.claimNotes || {}) };
  owned.forEach((g) => { merged[g.url] = merged[g.url] || Date.now(); delete notes[g.url]; });
  await chrome.storage.local.set({ claimedGames: merged, claimNotes: notes });
  return owned.length;
}

// ---------- Kategori bazlı toplu alma ----------

// Mağaza sayfası içinde çalışır (arka planda değil): site kendi isteği gibi görür.
// executeScript ile enjekte edildiği için dışarıdaki hiçbir değişkene erişemez.
async function steamClaimInPage(items) {
  if (location.pathname.startsWith('/login')) return { reason: 'login' };
  const sessionid = document.cookie.match(/(?:^|;\s*)sessionid=([^;]+)/)?.[1];
  if (!sessionid) return { reason: 'login' };

  const readOwned = async () => {
    const res = await fetch(`/dynamicstore/userdata/?t=${Date.now()}`);
    if (!res.ok) throw new Error('userdata ' + res.status);
    const data = await res.json();
    return { packages: new Set(data.rgOwnedPackages || []), apps: new Set(data.rgOwnedApps || []) };
  };
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const before = await readOwned();
  const already = items.filter(i => before.packages.has(i.subId));
  const todo = items.filter(i => !before.packages.has(i.subId));

  for (const item of todo) {
    const body = new FormData();
    body.append('action', 'add_to_cart');
    body.append('sessionid', sessionid);
    body.append('subid', String(item.subId));
    await fetch('/freelicense/addfreelicense/', { method: 'POST', body }).catch(() => {});
    await wait(1000);
  }

  // Yanıta değil, hesabın gerçekten sahip olduğu paketlere bakılır
  const after = todo.length ? await readOwned() : before;
  const missing = todo.filter(i => !after.packages.has(i.subId));
  // Eklenemeyen DLC'nin ana oyunu hesapta yoksa neden budur
  const blocked = missing.filter(i => i.baseAppId && !after.apps.has(i.baseAppId));
  return {
    claimed: todo.filter(i => after.packages.has(i.subId)).map(i => i.url),
    already: already.map(i => i.url),
    needsBase: blocked.map(i => ({ url: i.url, title: i.title, baseName: i.baseName })),
    failed: missing.filter(i => !blocked.includes(i)).map(i => i.url)
  };
}

// Fab sayfasında çalışır: oturum ve sözleşmeyi kontrol eder, her içeriğin o anki ücretsiz lisansını bulur.
// Kalıcı ücretsizler doğrudan eklenir; süreli indirimle ücretsiz olanlar Epic ödeme sayfasına bırakılır.
async function fabPrepareInPage(items) {
  const meRes = await fetch('/i/users/me');
  if (!meRes.ok) return { reason: 'blocked' };
  const me = await meRes.json();
  if (me.isAnonymous) return { reason: 'login' };
  // Fab sözleşmesi onaylanmadıysa kullanıcı adına onaylanmaz.
  // Değer metin olarak gelir ("not_accepted" gibi); açıkça onaylı görünmüyorsa durulur.
  const tos = me.hasAcceptedBuyerTos;
  const tosAccepted = tos === true || (typeof tos === 'string' && /^accepted/i.test(tos));
  if (!tosAccepted) return { reason: 'terms' };

  const readCsrf = () => document.cookie.match(/(?:^|;\s*)fab_csrftoken=([^;]+)/)?.[1];
  const isAcquired = async (id) => {
    const res = await fetch(`/i/users/me/listings-states/${id}`);
    return res.ok && (await res.json()).acquired === true;
  };

  const result = { claimed: [], already: [], failed: [], checkout: [] };
  for (const item of items) {
    try {
      if (await isAcquired(item.listingId)) { result.already.push(item.url); continue; }

      // Lisanslar o an yeniden okunur: profesyonel ücretsizse o, değilse kişisel
      const listing = await (await fetch(`/i/listings/${item.listingId}`)).json();
      const free = (listing.licenses || []).filter(l => l.offerId && l.priceTier?.discountedPrice === 0);
      const license = free.find(l => l.slug === 'professional') || free.find(l => l.slug === 'personal') || free[0];
      if (!license) { result.failed.push(item.url); continue; }

      if (listing.isFree === true) {
        if (!readCsrf()) await fetch('/i/csrf').catch(() => {});
        const body = new FormData();
        body.append('offer_id', license.offerId);
        await fetch(`/i/listings/${item.listingId}/add-to-library`, {
          method: 'POST',
          headers: { 'X-CsrfToken': readCsrf() || '', 'X-Requested-With': 'XMLHttpRequest' },
          body
        });
        (await isAcquired(item.listingId) ? result.claimed : result.failed).push(item.url);
      } else {
        result.checkout.push({ url: item.url, listingId: item.listingId, offerId: license.offerId });
      }
    } catch (_) {
      result.failed.push(item.url);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return result;
}

// Epic ödeme sayfasında çalışır (Epic mağazası veya Fab'ın içindeki aynı ödeme sayfası). Yalnızca sayfa ücretsiz olduğunu her yönden doğrularsa "Kütüphaneye ekle"ye basar.
// Doğrulama sayfanın kendi dil metinleriyle yapılır, Epic'in dili ne olursa olsun çalışır.
// Güvenlik doğrulaması (captcha) çıkarsa çözülmez: kullanıcıya bırakılır.
async function epicClaimInPage(expectedOfferIds, opts) {
  const { readyMs = 20000, doneMs = 30000, stepMs = 300, resumeOnly = false } = opts || {};
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const root = () => document.getElementById('purchase-app');
  const messages = () => window.i18n?.messageProperties;

  // true: tıklanabilir, string: durma nedeni, null: sayfa henüz hazır değil
  const checkFree = () => {
    const data = window.__epic_web_purchase_dataPreload;
    const m = messages();
    const onEpic = location.hostname === 'store.epicgames.com' && location.pathname.startsWith('/purchase');
    const onFab = location.hostname === 'www.fab.com' && location.pathname.startsWith('/payment/web/purchase');
    if (!onEpic && !onFab) return 'unsafe';
    if (!data?.identityId || !m) return 'login';

    // 1) Sayfadaki ürünler tam olarak bizim istediklerimiz mi
    const ids = (data.lineOffers || []).map(o => o.offerId);
    if (ids.length !== expectedOfferIds.length || !expectedOfferIds.every(id => ids.includes(id))) return 'unsafe';

    const app = root();
    if (!app) return null;

    // 2) Ödeme düğmesi varsa kesinlikle dokunma
    const buttons = [...app.querySelectorAll('button')].map(b => ({ node: b, text: b.textContent.trim() }));
    const paidLabels = ['pay.now', 'subscribe.now', 'extend.subscription', 'add.funds'].map(k => m[k]).filter(Boolean);
    if (buttons.some(b => paidLabels.includes(b.text))) return 'unsafe';

    // 3) Görünen tüm fiyatlar sıfır olmalı
    // Fiyat sembolle (₺) ya da para birimi koduyla (TRY 0.00) yazılabilir
    const symbol = (data.currencies || []).find(c => c.code === data.currency)?.symbol;
    if (!symbol || !data.currency) return 'unsafe';
    const prices = [...app.querySelectorAll('*')]
      .filter(n => n.children.length === 0 && (n.textContent.includes(symbol) || n.textContent.includes(data.currency)) && /\d/.test(n.textContent))
      .map(n => n.textContent);
    if (prices.some(p => /[1-9]/.test(p))) return 'unsafe';

    // 4) "Bu ücretsizdir" metni ve tek bir "Kütüphaneye ekle" düğmesi
    const addLabel = m['add.to.library'];
    const freeText = m['free.checkout.desc'];
    if (!addLabel || !freeText) return 'unsafe';
    const addButtons = buttons.filter(b => b.text === addLabel);
    if (prices.length === 0 || addButtons.length !== 1 || addButtons[0].node.disabled) return null;
    if (!app.innerText.includes(freeText)) return null;
    return addButtons[0].node;
  };

  const challengeVisible = () => {
    const box = document.querySelector('[id^="talon_container_"]');
    if (!box) return false;
    const style = getComputedStyle(box);
    return style.visibility === 'visible' && Number(style.opacity) > 0;
  };

  const readOutcome = () => {
    const m = messages() || {};
    const text = document.body.innerText;
    const shows = (keys) => keys.some(k => m[k] && text.includes(m[k]));
    if (shows(['order.confirmed', 'all.yours', 'payment.complete'])) return { status: 'claimed' };
    if (shows(['errors.com.epicgames.ecommerce.orderprocessor.offer_already_owned', 'errors.com.epicgames.ecommerce.orderprocessor.purchase_limit_error'])) return { status: 'already' };
    if (shows(['errors.com.epicgames.common.throttled.orderprocessor.freeorder', 'errors.com.epicgames.purchase.purchase.captcha.decline'])) return { reason: 'limit' };
    return null;
  };

  if (!resumeOnly) {
    let target = null;
    for (let waited = 0; !target; waited += stepMs) {
      const check = checkFree();
      if (typeof check === 'string') return { reason: check };
      if (check) target = check;
      else if (waited >= readyMs) return { reason: 'manual' };
      else await sleep(stepMs);
    }
    target.click();
  }

  for (let waited = 0; waited < doneMs; waited += stepMs) {
    const outcome = readOutcome();
    if (outcome) return outcome;
    if (!resumeOnly && challengeVisible()) return { reason: 'captcha' };
    await sleep(stepMs);
  }
  return { reason: resumeOnly ? 'captcha' : 'manual' };
}

// Ödeme sayfasında epicClaimInPage'i çalıştırır. Güvenlik doğrulaması çıkarsa sekme öne gelir, kullanıcı 3 dakika beklenir.
async function runCheckoutInTab(tabId, ids) {
  const runInPage = async (opts) => {
    // Sayfanın kendi verisini okumak için sayfa dünyasında çalışır
    const [injected] = await chrome.scripting.executeScript({
      target: { tabId }, world: 'MAIN', func: epicClaimInPage, args: [ids, opts]
    });
    return injected?.result || { reason: 'manual' };
  };
  try {
    const result = await runInPage({});
    if (result.reason !== 'captcha') return result;
    await chrome.tabs.update(tabId, { active: true }).catch(() => {});
    return await runInPage({ resumeOnly: true, doneMs: 180000 });
  } catch (err) {
    console.error('[Alma] Ödeme sayfası hatası:', err);
    return { reason: 'manual' };
  }
}

async function claimEpic(pending) {
  // Listedeki bilgi eski olabilir: Epic'e o an yeniden sorulur, ücretsiz olmayan elenir
  const fresh = await fetchEpicGames();
  if (fresh === null) return { reason: 'blocked' };
  const freeNow = new Set(fresh.map(g => g.offerId).filter(Boolean));
  const offers = pending.filter(g => g.offerId && g.namespace && freeNow.has(g.offerId));
  if (offers.length === 0) return { reason: 'nothing' };

  const query = offers.map(g => `offers=1-${g.namespace}-${g.offerId}`).join('&');
  const ids = offers.map(g => g.offerId);
  const tab = await chrome.tabs.create({ url: `${EPIC_PURCHASE_URL}?${query}`, active: false });
  await waitForTabLoad(tab.id);
  const result = await runCheckoutInTab(tab.id, ids);

  if (result.reason) {
    await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
    return { reason: result.reason };
  }
  await chrome.tabs.remove(tab.id).catch(() => {});
  const urls = offers.map(g => g.url);
  // Birden çok üründe hangisinin sahip olunduğu bilinemez; yanlış işaretlememek için kullanıcıya bırakılır
  if (result.status === 'already' && offers.length > 1) return { reason: 'manual' };
  return result.status === 'already' ? { claimed: [], already: urls, failed: [] } : { claimed: urls, already: [], failed: [] };
}

// Fab sözleşmesini onaylar. Yalnızca kullanıcı popup'taki onay düğmesine basınca çağrılır.
async function fabAcceptTermsInPage() {
  const meRes = await fetch('/i/users/me');
  if (!meRes.ok) return { reason: 'blocked' };
  const me = await meRes.json();
  if (me.isAnonymous) return { reason: 'login' };
  if (me.hasAcceptedBuyerTos === 'accepted') return { ok: true };

  const readCsrf = () => document.cookie.match(/(?:^|;\s*)fab_csrftoken=([^;]+)/)?.[1];
  if (!readCsrf()) await fetch('/i/csrf').catch(() => {});
  const csrf = readCsrf();
  if (!csrf) return { reason: 'blocked' };

  // Onaylanan sürüm, Fab'ın o an gösterdiği sözleşmenin sürümüdür
  const eulaRes = await fetch('/i/eula/fab_eula');
  const version = eulaRes.ok ? (await eulaRes.json()).version : null;
  if (version === null || version === undefined) return { reason: 'blocked' };

  const body = new FormData();
  body.append('version', String(version));
  await fetch('/i/eula/fab_eula/accept', {
    method: 'POST',
    headers: { 'X-CsrfToken': csrf, 'X-Requested-With': 'XMLHttpRequest' },
    body
  });

  const after = await (await fetch('/i/users/me')).json();
  return after.hasAcceptedBuyerTos === 'accepted' ? { ok: true } : { reason: 'blocked' };
}

function waitForTabLoad(tabId, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    };
    const onUpdated = (id, info) => { if (id === tabId && info.status === 'complete') done(); };
    const timer = setTimeout(done, timeoutMs);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.get(tabId).then(t => { if (t.status === 'complete') done(); }).catch(done);
  });
}

// Arka plan sekmesinde işlemi yapar. Kullanıcı gereken bir durumda (giriş, sözleşme) sekme öne gelir ve açık kalır.
async function claimInTab(url, func, items) {
  const tab = await chrome.tabs.create({ url, active: false });
  await waitForTabLoad(tab.id);

  let result;
  try {
    const [injected] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func, args: [items] });
    result = injected?.result || { reason: 'blocked' };
  } catch (err) {
    console.error('[Alma] Sayfa içi işlem hatası:', err);
    result = { reason: 'blocked' };
  }

  // Sözleşme popup'tan onaylanır, sekmeyi açık bırakmaya gerek yok
  if (result.reason && result.reason !== 'terms') await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  else await chrome.tabs.remove(tab.id).catch(() => {});
  return result;
}

// Fab'daki tüm içerikler aynı Epic ad alanındadır (Unreal Marketplace)
const FAB_OFFER_NAMESPACE = '89efe5924d3d467c839449ab6ab52e7f';

function fabCheckoutUrl(offerId) {
  return 'https://www.fab.com/payment/web/purchase?' + new URLSearchParams({
    offers: `1-${FAB_OFFER_NAMESPACE}-${offerId}--`,
    merchantGroup: 'UE_MKT',
    salesChannel: 'Windows-Store-FabWeb',
    lang: 'tr',
    highlightColor: '26bbff',
    showNavigation: 'false'
  });
}

async function claimFab(pending) {
  const items = pending.filter(g => g.listingId).map(g => ({ url: g.url, listingId: g.listingId }));
  if (items.length === 0) return { reason: 'nothing' };

  const tab = await chrome.tabs.create({ url: FAB_LIMITED_TIME_FREE_URL_TR, active: false });
  await waitForTabLoad(tab.id);
  const keepTab = async (reason) => {
    // Sözleşme popup'tan onaylanır; diğer durumlarda kullanıcı sekmede bakabilsin
    if (reason === 'terms') await chrome.tabs.remove(tab.id).catch(() => {});
    else await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
    return { reason };
  };

  let prep;
  try {
    const [injected] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: fabPrepareInPage, args: [items] });
    prep = injected?.result || { reason: 'blocked' };
  } catch (err) {
    console.error('[Alma] Fab hazırlık hatası:', err);
    prep = { reason: 'blocked' };
  }
  if (prep.reason) return keepTab(prep.reason);

  const result = { claimed: prep.claimed, already: prep.already, failed: prep.failed };
  for (const item of prep.checkout) {
    await chrome.tabs.update(tab.id, { url: fabCheckoutUrl(item.offerId) });
    await new Promise(resolve => setTimeout(resolve, 500));
    await waitForTabLoad(tab.id);
    const outcome = await runCheckoutInTab(tab.id, [item.offerId]);

    // Ödeme sayfasının sonuç metnine güvenmek yerine Fab'a sorulur
    const owned = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (id) => {
        if (location.hostname !== 'www.fab.com') return false;
        const res = await fetch(`/i/users/me/listings-states/${id}`);
        return res.ok && (await res.json()).acquired === true;
      },
      args: [item.listingId]
    }).then(([r]) => r?.result === true).catch(() => false);
    if (owned) { (outcome.status === 'already' ? result.already : result.claimed).push(item.url); continue; }
    // Kullanıcı gereken durumda (giriş, doğrulama, güvenlik) kalanlar denenmez, sekme açık kalır
    if (['login', 'captcha', 'unsafe', 'limit'].includes(outcome.reason)) {
      await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
      return result.claimed.length + result.already.length > 0 ? { ...result, failed: [...result.failed, item.url] } : { reason: outcome.reason };
    }
    result.failed.push(item.url);
  }

  if (result.failed.length > 0) await chrome.tabs.update(tab.id, { active: true }).catch(() => {});
  else await chrome.tabs.remove(tab.id).catch(() => {});
  return result;
}

async function claimPlatform(platform) {
  // Kütüphanede olanlar önce işaretlenir, böylece alınacaklara girmez
  await syncOwned();

  const data = await chrome.storage.local.get(['games', 'claimedGames']);
  const claimedGames = data.claimedGames || {};
  const pending = (data.games?.[platform] || []).filter(g => isStillActive(g) && !claimedGames[g.url]);

  let result;
  if (platform === 'epic') {
    result = await claimEpic(pending);
  } else if (platform === 'steam') {
    const items = pending.filter(g => g.subId).map(g => ({ url: g.url, subId: g.subId, title: g.title, baseAppId: g.baseAppId, baseName: g.baseName }));
    if (items.length === 0) return { reason: 'nothing' };
    result = await claimInTab(STEAM_LICENSES_URL, steamClaimInPage, items);
  } else if (platform === 'fab') {
    result = await claimFab(pending);
  } else {
    return { reason: 'nothing' };
  }

  // Popup kapanmış olsa bile sonuç kaybolmasın
  const owned = [...(result.claimed || []), ...(result.already || [])];
  const needsBase = result.needsBase || [];
  if (owned.length > 0 || needsBase.length > 0) {
    const fresh = await chrome.storage.local.get(['claimedGames', 'claimNotes']);
    const merged = { ...(fresh.claimedGames || {}) };
    const notes = { ...(fresh.claimNotes || {}) };
    owned.forEach(url => { merged[url] = merged[url] || Date.now(); delete notes[url]; });
    // Tekrar tekrar denenmesin diye işaretlenir, neden kartta yazar
    needsBase.forEach(({ url, baseName }) => { merged[url] = merged[url] || Date.now(); notes[url] = { baseName: baseName || '' }; });
    await chrome.storage.local.set({ claimedGames: merged, claimNotes: notes });
  }
  return result;
}

// Discord'a tek POST; 429 (rate limit) gelirse bir kez bekleyip tekrar dener. Başarılıysa true döner.
async function postToDiscord(webhookUrl, payload) {
    for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status === 429 && attempt === 0) {
            let waitMs = 1500;
            try {
                const j = await res.json();
                if (j.retry_after) waitMs = Math.ceil(j.retry_after * 1000) + 200;
            } catch (_) {}
            await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 10000)));
            continue;
        }
        if (!res.ok) {
            console.error("Discord Webhook HTTP hatası:", res.status);
            return false;
        }
        return true;
    }
    return false;
}

// DİSCORD WEBHOOK: Platformlara Göre Gruplayarak Şık Mesaj Gönderir (hepsi başarılıysa true döner)
// Gönderilemeyen oyunların listesini döner (boş liste = hepsi gitti)
async function sendToDiscord(webhookUrl, games) {
    if (!webhookUrl || !games || games.length === 0) return games || [];

    // Oyunları platformlarına göre ayır
    const platforms = {
        'Epic Games': games.filter(g => g.platform && g.platform.includes('Epic')),
        'Steam': games.filter(g => g.platform && g.platform.includes('Steam')),
        'Fab (Unreal Engine)': games.filter(g => g.platform && g.platform.includes('Fab'))
    };

    const failed = [];

    for (const [platformName, platformGames] of Object.entries(platforms)) {
        if (platformGames.length === 0) continue;

        let embedColor = 55648; 
        let platformEmoji = "🎮"; 

        if (platformName === 'Steam') { embedColor = 1752220; platformEmoji = "🕹️"; }
        if (platformName === 'Epic Games') { embedColor = 0; platformEmoji = "🛒"; }
        if (platformName === 'Fab (Unreal Engine)') { embedColor = 3447003; platformEmoji = "🎨"; }

        const embeds = platformGames.map(game => {
            // Buton alternatifi çok şık bir link
            let desc = `> **[ ✨ BURAYA TIKLAYARAK SAYFAYA GİT ](${game.url})**`;
            
            // Eğer bitiş tarihi milisaniye cinsinden bir sayıysa (Gerçek tarihse) Discord canlı sayacını ekle
            if (game.endDate && typeof game.endDate === 'number') {
                const unixSeconds = Math.floor(game.endDate / 1000);
                desc += `\n> ⏳ **Bitiş:** <t:${unixSeconds}:R>`; // Discord'un canlı sayan Markdown formatı
            } 
            // Sayı değil de "Sınırlı Süre" gibi bir metinse düz yaz
            else if (game.endDate && typeof game.endDate === 'string') {
                desc += `\n> ⏳ **Bitiş:** ${game.endDate}`;
            }

            return {
                title: `${platformEmoji} ${game.title}`,
                url: game.url,
                description: desc,
                color: embedColor,
                // Boş image.url Discord'un tüm isteği 400 ile reddetmesine yol açar; sadece varsa ekle
                ...(game.thumbnail ? { image: { url: game.thumbnail } } : {}),
                footer: { text: "NooXGFree Otomasyonu" }
            };
        });

        // Discord mesaj başına en fazla 10 embed kabul eder → parçalara böl
        for (let i = 0; i < embeds.length; i += 10) {
            try {
                const ok = await postToDiscord(webhookUrl, {
                    content: i === 0 ? `### 🚨 Yeni **${platformName}** Fırsatları!` : undefined,
                    embeds: embeds.slice(i, i + 10)
                });
                if (!ok) failed.push(...platformGames.slice(i, i + 10));
            } catch (error) {
                console.error("Discord Webhook gönderim hatası:", error);
                failed.push(...platformGames.slice(i, i + 10));
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    return failed;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshGames') {
    fetchFreeGames().then(sendResponse);
    return true;
  }

  if (request.action === 'syncOwned') {
    syncOwned().then(sendResponse, () => sendResponse(0));
    return true;
  }

  if (request.action === 'acceptFabTerms') {
    claimInTab(FAB_LIMITED_TIME_FREE_URL_TR, fabAcceptTermsInPage, null)
      .then(sendResponse)
      .catch(() => sendResponse({ reason: 'blocked' }));
    return true;
  }

  if (request.action === 'claimPlatform') {
    claimPlatform(request.platform)
      .then(sendResponse)
      .catch((err) => {
        console.error('[Alma] Hata:', err);
        sendResponse({ reason: 'blocked' });
      });
    return true;
  }
  
  // EKLENEN GERÇEK VERİLİ TEST KISMI
  if (request.action === 'testWebhook') {
    // Eklentinin hafızasındaki o anki GÜNCEL listeyi çekiyoruz
    chrome.storage.local.get(['games'], (data) => {
        const currentGames = data.games || {};
        
        // Epic, Steam ve Fab'da bulduğu gerçek oyunları tek bir havuzda birleştir
        const realGames = [
            ...(currentGames.epic || []),
            ...(currentGames.steam || []),
            ...(currentGames.fab || [])
        ];

        if (realGames.length === 0) {
            // Eğer o an eklentinin listesi tamamen boşsa sahte uyarı at
            realGames.push({
                 platform: 'Epic Games', 
                 title: 'Şu an listede bedava oyun yok ama sistem çalışıyor!', 
                 url: 'https://store.epicgames.com/'
            });
        }

        // Gerçek listeyi Discord'a yolla; sonucu (başarılı/başarısız) popup'a bildir
        sendToDiscord(request.url, realGames)
          .then((failed) => {
            const ok = failed.length === 0;
            console.log("[SİSTEM] Test webhook sonucu:", ok ? "başarılı" : "başarısız");
            sendResponse({ success: ok });
          })
          .catch(() => sendResponse({ success: false }));
    });
    return true; // Asenkron yanıt için
  }
});
