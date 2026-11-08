// NooXGFree Popup Script - Developed by NooXRii

const translations = {
  tr: {
    open_all: "Tümünü aç",
    loading: "Oyunlar aranıyor...",
    empty: "Şu an bedava içerik yok",
    empty_hint: "Yenile düğmesiyle tekrar kontrol edebilirsin.",
    last_check: "Son kontrol:",
    settings: "Ayarlar",
    refresh: "Yenile",
    lang: "Dil",
    close: "Kapat",
    days_left: "gün kaldı",
    hours_left: "saat kaldı",
    limited: "Sınırlı süre",
    new_label: "Yeni",
    claim: "Aldım olarak işaretle",
    unclaim: "İşareti kaldır",
    webhook_label: "Discord Webhook URL",
    webhook_hint: "Yeni bedava oyunlar bu Discord kanalına gönderilir.",
    webhook_save: "Kaydet",
    webhook_test: "Test mesajı gönder",
    webhook_saved: "Kaydedildi",
    webhook_invalid: "Geçerli bir Discord webhook adresi gir.",
    webhook_missing: "Önce bir webhook adresi gir.",
    webhook_ok: "Test mesajı gönderildi",
    webhook_fail: "Gönderilemedi. Adresi kontrol et.",
    claim_captcha: "Epic güvenlik doğrulaması istiyor. Açılan sekmede tamamla.",
    claim_unsafe: "Epic sayfası ücretsiz doğrulanamadı, hiçbir şeye basılmadı. Sekmeyi kontrol et.",
    claim_limit: "Epic şu an yeni ücretsiz oyuna izin vermiyor. 24 saat sonra dene.",
    claim_manual: "Epic'te işlem tamamlanamadı. Açılan sekmeden devam et.",
    claim_library: "Kütüphaneye ekle",
    claim_library_hint: "Bu kategorideki alınmamış içerikleri hesabına ekler.",
    claim_done: "{n} içerik kütüphaneye eklendi",
    claim_partial: "{ok} eklendi, {fail} eklenemedi",
    claim_failed: "Eklenemedi, mağaza sayfasından dene.",
    claim_login: "Önce açılan sekmede giriş yap, sonra tekrar dene.",
    claim_terms: "Fab, içerik eklemeden önce Fab Son Kullanıcı Lisans Sözleşmesini onaylamanı istiyor.",
    terms_read: "Sözleşmeyi oku",
    terms_accept: "Okudum, onaylıyorum",
    terms_failed: "Sözleşme onaylanamadı. Fab'da oturumunu kontrol et.",
    claim_blocked: "Mağaza isteği engelledi. Açılan sekmeyi kontrol et.",
    claim_nothing: "Alınacak içerik kalmadı",
    needs_base: "Ana oyun gerekli",
    needs_base_full: "Alınamadı: ana oyun ({base}) hesabında yok.",
    claim_needs_base_one: "{title} alınamadı: ana oyun ({base}) hesabında yok. İşaretlendi.",
    claim_needs_base_many: "{n} içerik alınamadı: ana oyunları hesabında yok. İşaretlendi."
  },
  en: {
    open_all: "Open all",
    loading: "Searching games...",
    empty: "No free content right now",
    empty_hint: "Use the refresh button to check again.",
    last_check: "Last check:",
    settings: "Settings",
    refresh: "Refresh",
    lang: "Language",
    close: "Close",
    days_left: "days left",
    hours_left: "hours left",
    limited: "Limited time",
    new_label: "New",
    claim: "Mark as claimed",
    unclaim: "Remove mark",
    webhook_label: "Discord Webhook URL",
    webhook_hint: "New free games are posted to this Discord channel.",
    webhook_save: "Save",
    webhook_test: "Send test message",
    webhook_saved: "Saved",
    webhook_invalid: "Enter a valid Discord webhook URL.",
    webhook_missing: "Enter a webhook URL first.",
    webhook_ok: "Test message sent",
    webhook_fail: "Couldn't send. Check the URL.",
    claim_captcha: "Epic asks for a security check. Complete it on the opened tab.",
    claim_unsafe: "Couldn't confirm the Epic page is free, nothing was clicked. Check the tab.",
    claim_limit: "Epic isn't allowing more free games now. Try again in 24 hours.",
    claim_manual: "Couldn't finish on Epic. Continue on the opened tab.",
    claim_library: "Add to library",
    claim_library_hint: "Adds the unclaimed items in this category to your account.",
    claim_done: "{n} items added to library",
    claim_partial: "{ok} added, {fail} failed",
    claim_failed: "Couldn't add. Try from the store page.",
    claim_login: "Sign in on the opened tab, then try again.",
    claim_terms: "Fab requires you to accept the Fab End User License Agreement before adding items.",
    terms_read: "Read the agreement",
    terms_accept: "I have read it, I accept",
    terms_failed: "Couldn't accept the agreement. Check your Fab sign-in.",
    claim_blocked: "The store blocked the request. Check the opened tab.",
    claim_nothing: "Nothing left to claim",
    needs_base: "Base game required",
    needs_base_full: "Not claimed: you don't own the base game ({base}).",
    claim_needs_base_one: "{title} not claimed: you don't own the base game ({base}). Marked.",
    claim_needs_base_many: "{n} items not claimed: you don't own their base games. Marked."
  },
  de: {
    open_all: "Alle öffnen",
    loading: "Suche nach Spielen...",
    empty: "Derzeit keine kostenlosen Inhalte",
    empty_hint: "Mit der Aktualisieren-Taste erneut prüfen.",
    last_check: "Letzte Prüfung:",
    settings: "Einstellungen",
    refresh: "Aktualisieren",
    lang: "Sprache",
    close: "Schließen",
    days_left: "Tage übrig",
    hours_left: "Stunden übrig",
    limited: "Begrenzte Zeit",
    new_label: "Neu",
    claim: "Als eingelöst markieren",
    unclaim: "Markierung entfernen",
    webhook_label: "Discord-Webhook-URL",
    webhook_hint: "Neue Gratisspiele werden in diesem Discord-Kanal gepostet.",
    webhook_save: "Speichern",
    webhook_test: "Testnachricht senden",
    webhook_saved: "Gespeichert",
    webhook_invalid: "Gib eine gültige Discord-Webhook-URL ein.",
    webhook_missing: "Gib zuerst eine Webhook-URL ein.",
    webhook_ok: "Testnachricht gesendet",
    webhook_fail: "Senden fehlgeschlagen. URL prüfen.",
    claim_captcha: "Epic verlangt eine Sicherheitsprüfung. Schließe sie im geöffneten Tab ab.",
    claim_unsafe: "Epic-Seite nicht als kostenlos bestätigt, nichts wurde geklickt. Prüfe den Tab.",
    claim_limit: "Epic erlaubt gerade keine weiteren Gratisspiele. Versuche es in 24 Stunden.",
    claim_manual: "Auf Epic nicht abgeschlossen. Mach im geöffneten Tab weiter.",
    claim_library: "Zur Bibliothek",
    claim_library_hint: "Fügt die offenen Inhalte dieser Kategorie deinem Konto hinzu.",
    claim_done: "{n} Inhalte hinzugefügt",
    claim_partial: "{ok} hinzugefügt, {fail} fehlgeschlagen",
    claim_failed: "Hinzufügen fehlgeschlagen. Versuche es im Store.",
    claim_login: "Melde dich im geöffneten Tab an und versuche es erneut.",
    claim_terms: "Fab verlangt, dass du die Fab-Endbenutzer-Lizenzvereinbarung akzeptierst, bevor Inhalte hinzugefügt werden.",
    terms_read: "Vereinbarung lesen",
    terms_accept: "Gelesen, ich akzeptiere",
    terms_failed: "Vereinbarung konnte nicht akzeptiert werden. Prüfe deine Fab-Anmeldung.",
    claim_blocked: "Der Store hat die Anfrage blockiert. Prüfe den geöffneten Tab.",
    claim_nothing: "Nichts mehr zu holen",
    needs_base: "Hauptspiel nötig",
    needs_base_full: "Nicht erhalten: Hauptspiel ({base}) fehlt im Konto.",
    claim_needs_base_one: "{title} nicht erhalten: Hauptspiel ({base}) fehlt im Konto. Markiert.",
    claim_needs_base_many: "{n} Inhalte nicht erhalten: Hauptspiele fehlen im Konto. Markiert."
  }
};

const PLATFORM_LABELS = { epic: 'Epic', steam: 'Steam', fab: 'Fab' };
const CLAIM_FIELD = { epic: 'offerId', steam: 'subId', fab: 'listingId' };
const WEBHOOK_RE = /^https:\/\/((ptb|canary)\.)?discord(app)?\.com\/api\/(v\d+\/)?webhooks\/\d+\/[\w-]+\/?(\?.*)?$/;
const MAX_TILT = 14; // derece

document.addEventListener('DOMContentLoaded', async () => {
  chrome.action.setBadgeText({ text: '' });

  const $ = (id) => document.getElementById(id);
  const els = {
    refreshBtn: $('refreshBtn'),
    settingsBtn: $('settingsBtn'),
    openAllBtn: $('openAllBtn'),
    settingsPanel: $('settingsPanel'),
    mainContent: $('mainContent'),
    langSelect: $('langSelect'),
    closeSettings: $('closeSettings'),
    epicGames: $('epicGames'),
    steamGames: $('steamGames'),
    fabGames: $('fabGames'),
    epicCount: $('epicCount'),
    steamCount: $('steamCount'),
    fabCount: $('fabCount'),
    epicSection: $('epicSection'),
    steamSection: $('steamSection'),
    fabSection: $('fabSection'),
    lastUpdate: $('lastUpdate'),
    loading: $('loading'),
    emptyState: $('emptyState'),
    webhookInput: $('webhookInput'),
    saveSettingsBtn: $('saveSettingsBtn'),
    testWebhookBtn: $('testWebhookBtn'),
    saveStatus: $('saveStatus'),
    claimStatus: $('claimStatus'),
    fabTerms: $('fabTerms'),
    acceptTermsBtn: $('acceptTermsBtn'),
    claimEpic: $('claimEpic'),
    claimSteam: $('claimSteam'),
    claimFab: $('claimFab')
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let currentLang = 'tr';
  let activeUrls = [];   // listedeki tüm aktif oyunlar
  let claimedMap = {};   // { url: alınma zamanı }
  let claimNotes = {};   // { url: { baseName } } ana oyun gerektiği için alınamayanlar
  let lastUpdateTs = null;
  let cardRefs = new Map(); // url -> [{ slot, btn }] (arayüzü senkron tutmak için)
  let activeLists = {};     // platform -> aktif oyunlar (kategori düğmeleri için)
  const newUrls = new Set(); // bu oturumda "Yeni" etiketi gösterilecekler (dil değişince kaybolmasın)

  // 1. Ayarları yükle (tema artık sabit: dark)
  const stored = await chrome.storage.local.get(['lang', 'discordWebhookUrl', 'claimedGames', 'claimNotes']);
  chrome.storage.local.remove('theme');

  // "Aldım" işaretleri: 60 günden eski kayıtlar temizlenir
  if (stored.claimedGames && typeof stored.claimedGames === 'object') {
    const limit = Date.now() - 60 * 86400000;
    let pruned = false;
    for (const [url, ts] of Object.entries(stored.claimedGames)) {
      if (typeof ts === 'number' && ts > limit) claimedMap[url] = ts;
      else pruned = true;
    }
    if (pruned) chrome.storage.local.set({ claimedGames: claimedMap });
  }

  // İşareti kalkmış kayıtların notu da gider
  for (const [url, note] of Object.entries(stored.claimNotes || {})) {
    if (claimedMap[url]) claimNotes[url] = note;
  }

  if (stored.lang && translations[stored.lang]) {
    currentLang = stored.lang;
    els.langSelect.value = currentLang;
  }
  if (stored.discordWebhookUrl) {
    els.webhookInput.value = stored.discordWebhookUrl;
  }

  applyTranslations();
  await loadGames();

  // Kütüphanede olanlar arka planda işaretlenir, kartlar kayıt değişince güncellenir
  chrome.runtime.sendMessage({ action: 'syncOwned' }, () => { void chrome.runtime.lastError; });

  // 2. Yenileme
  els.refreshBtn.addEventListener('click', () => {
    if (els.refreshBtn.classList.contains('rotating')) return;

    els.refreshBtn.classList.add('rotating');
    els.refreshBtn.disabled = true;

    chrome.runtime.sendMessage({ action: 'refreshGames' }, async () => {
      void chrome.runtime.lastError;
      await loadGames(false);
      setTimeout(() => {
        els.refreshBtn.classList.remove('rotating');
        els.refreshBtn.disabled = false;
      }, 600);
    });
  });

  // 3. Ayarlar paneli (açıkken oyun listesi gizlenir, popup yüksekliği taşmaz)
  function setSettingsOpen(open) {
    els.settingsPanel.hidden = !open;
    els.mainContent.hidden = open;
    els.settingsBtn.classList.toggle('is-active', open);
    els.settingsBtn.setAttribute('aria-expanded', String(open));
  }

  els.settingsBtn.addEventListener('click', () => setSettingsOpen(els.settingsPanel.hidden));
  els.closeSettings.addEventListener('click', () => setSettingsOpen(false));

  els.langSelect.addEventListener('change', async (e) => {
    currentLang = e.target.value;
    await chrome.storage.local.set({ lang: currentLang });
    applyTranslations();
    await loadGames(false);
  });

  // Alınmış (işaretli) oyunlar "Tümünü aç" dışında kalır
  function getOpenableUrls() {
    return [...new Set(activeUrls)].filter(url => !claimedMap[url]);
  }

  function refreshOpenAll() {
    els.openAllBtn.disabled = getOpenableUrls().length === 0;
    refreshClaimButtons();
  }

  // Kategori düğmesi: sadece alınabilir bilgisi olan ve işaretlenmemiş içerikler sayılır
  function claimButton(key) {
    return els[`claim${PLATFORM_LABELS[key]}`];
  }

  function claimableCount(key) {
    return (activeLists[key] || []).filter(g => g[CLAIM_FIELD[key]] && !claimedMap[g.url]).length;
  }

  function refreshClaimButtons() {
    const t = translations[currentLang];
    for (const key of Object.keys(CLAIM_FIELD)) {
      const btn = claimButton(key);
      const count = claimableCount(key);
      btn.hidden = count === 0;
      btn.textContent = `${t.claim_library} (${count})`;
      btn.title = t.claim_library_hint;
    }
  }

  function showClaimResult(res) {
    const t = translations[currentLang];
    const owned = (res?.claimed?.length || 0) + (res?.already?.length || 0);
    const failed = res?.failed?.length || 0;
    const needsBase = res?.needsBase || [];
    const fill = (text) => text.replace('{n}', owned).replace('{ok}', owned).replace('{fail}', failed);

    let text = t.claim_blocked;
    let type = 'error';
    if (res?.reason === 'login') text = t.claim_login;
    else if (res?.reason === 'terms') {
      // Onay kullanıcıya ait: metin ve düğme gösterilir, kendiliğinden onaylanmaz
      els.claimStatus.hidden = true;
      els.fabTerms.hidden = false;
      return;
    }
    else if (res?.reason === 'nothing') { text = t.claim_nothing; type = 'ok'; }
    else if (res?.reason === 'captcha') text = t.claim_captcha;
    else if (res?.reason === 'unsafe') text = t.claim_unsafe;
    else if (res?.reason === 'limit') text = t.claim_limit;
    else if (res?.reason === 'manual') text = t.claim_manual;
    else if (res && !res.reason) {
      if (failed === 0) { text = owned > 0 || needsBase.length === 0 ? fill(t.claim_done) : ''; type = 'ok'; }
      else text = owned > 0 ? fill(t.claim_partial) : t.claim_failed;

      if (needsBase.length > 0) {
        const reason = needsBase.length === 1
          ? t.claim_needs_base_one.replace('{title}', needsBase[0].title).replace('{base}', needsBase[0].baseName)
          : t.claim_needs_base_many.replace('{n}', needsBase.length);
        text = text ? `${text}. ${reason}` : reason;
        type = 'error';
      }
    }
    showStatus(els.claimStatus, text, type, needsBase.length > 0 ? 9000 : 5000);
  }

  function runClaim(key) {
    const btn = claimButton(key);
    btn.disabled = true;
    chrome.runtime.sendMessage({ action: 'claimPlatform', platform: key }, (res) => {
      void chrome.runtime.lastError;
      btn.disabled = false;
      showClaimResult(res);
      refreshClaimButtons();
    });
  }

  for (const key of Object.keys(CLAIM_FIELD)) {
    claimButton(key).addEventListener('click', () => runClaim(key));
  }

  // Fab sözleşmesi yalnızca bu düğmeyle onaylanır; ardından Fab alımı yeniden denenir
  els.acceptTermsBtn.addEventListener('click', () => {
    els.acceptTermsBtn.disabled = true;
    chrome.runtime.sendMessage({ action: 'acceptFabTerms' }, (res) => {
      void chrome.runtime.lastError;
      els.acceptTermsBtn.disabled = false;
      if (res?.ok) {
        els.fabTerms.hidden = true;
        runClaim('fab');
      } else {
        const t = translations[currentLang];
        showStatus(els.claimStatus, res?.reason === 'login' ? t.claim_login : t.terms_failed, 'error', 6000);
      }
    });
  });

  // Arka plan alma işlemini bitirince kartlar burada güncellenir
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.claimedGames) return;
    claimedMap = changes.claimedGames.newValue || {};
    if (changes.claimNotes) claimNotes = changes.claimNotes.newValue || {};
    cardRefs.forEach((_, url) => syncCards(url));
    refreshOpenAll();
  });

  els.openAllBtn.addEventListener('click', () => {
    const urls = getOpenableUrls();
    urls.forEach(url => chrome.tabs.create({ url, active: false }));
    markClaimed(urls); // işaretli olmayanları işaretle
  });

  function applyClaimedState(slot, btn, url) {
    const on = Boolean(claimedMap[url]);
    const t = translations[currentLang];
    slot.classList.toggle('is-claimed', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.title = on ? t.unclaim : t.claim;
    btn.setAttribute('aria-label', btn.title);

    // Ana oyun gerektiği için alınamadıysa neden kartta yazar
    const note = on ? claimNotes[url] : null;
    const noteEl = slot.querySelector('.claim-note');
    const link = slot.querySelector('.card-link');
    slot.classList.toggle('has-note', Boolean(note));
    noteEl.textContent = note ? t.needs_base : '';
    link.title = note ? `${link.dataset.title} - ${t.needs_base_full.replace('{base}', note.baseName)}` : link.dataset.title;
  }

  function syncCards(url) {
    (cardRefs.get(url) || []).forEach(({ slot, btn }) => applyClaimedState(slot, btn, url));
  }

  function toggleClaimed(url) {
    if (claimedMap[url]) {
      delete claimedMap[url];
      delete claimNotes[url];
    } else {
      claimedMap[url] = Date.now();
    }
    syncCards(url);
    chrome.storage.local.set({ claimedGames: claimedMap, claimNotes });
    refreshOpenAll();
  }

  // Birden fazla oyunu tek seferde işaretle (zaten işaretli olanlara dokunmaz)
  function markClaimed(urls) {
    let changed = false;
    for (const url of urls) {
      if (!url || claimedMap[url]) continue;
      claimedMap[url] = Date.now();
      syncCards(url);
      changed = true;
    }
    if (changed) chrome.storage.local.set({ claimedGames: claimedMap });
    refreshOpenAll();
  }

  // 4. Discord webhook
  let statusTimer;
  function showStatus(target, text, type, ms = 2500) {
    target.textContent = text;
    target.classList.remove('ok', 'error');
    target.classList.add(type);
    target.hidden = false;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { target.hidden = true; }, ms);
  }
  const showWebhookStatus = (key, type) => showStatus(els.saveStatus, translations[currentLang][key], type);

  els.saveSettingsBtn.addEventListener('click', async () => {
    const url = els.webhookInput.value.trim();
    if (url && !WEBHOOK_RE.test(url)) {
      showWebhookStatus('webhook_invalid', 'error');
      return;
    }
    await chrome.storage.local.set({ discordWebhookUrl: url });
    showWebhookStatus('webhook_saved', 'ok');
  });

  els.testWebhookBtn.addEventListener('click', async () => {
    let url = els.webhookInput.value.trim();
    if (!url) {
      const data = await chrome.storage.local.get(['discordWebhookUrl']);
      url = data.discordWebhookUrl || '';
    }
    if (!url) {
      showWebhookStatus('webhook_missing', 'error');
      return;
    }
    if (!WEBHOOK_RE.test(url)) {
      showWebhookStatus('webhook_invalid', 'error');
      return;
    }

    els.testWebhookBtn.disabled = true;
    chrome.runtime.sendMessage({ action: 'testWebhook', url }, (response) => {
      const ok = !chrome.runtime.lastError && response && response.success;
      showWebhookStatus(ok ? 'webhook_ok' : 'webhook_fail', ok ? 'ok' : 'error');
      els.testWebhookBtn.disabled = false;
    });
  });

  // ---------- Veri ----------
  async function loadGames(allowAutoRefresh = true) {
    const result = await chrome.storage.local.get(['games']);
    if (result.games) {
      renderGames(result.games);
      clearNewFlags(result.games);
      return;
    }
    if (allowAutoRefresh) {
      // İlk açılış: henüz tarama bitmemiş olabilir
      els.loading.hidden = false;
      chrome.runtime.sendMessage({ action: 'refreshGames' }, () => {
        void chrome.runtime.lastError;
        loadGames(false);
      });
    } else {
      renderGames({});
    }
  }

  // Popup görüldü: etiket bu oturumda kalır, kayıttan ve rozetten silinir
  function clearNewFlags(games) {
    const clear = (list) => (list || []).map(g => g.isNew ? { ...g, isNew: false } : g);
    const hasNew = ['epic', 'steam', 'fab'].some(k => (games[k] || []).some(g => g.isNew));
    chrome.action.setBadgeText({ text: '' });
    if (hasNew) {
      chrome.storage.local.set({ games: { ...games, epic: clear(games.epic), steam: clear(games.steam), fab: clear(games.fab) } });
    }
  }

  function applyTranslations() {
    const t = translations[currentLang];
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(node => {
      const text = t[node.dataset.i18n];
      if (text) node.textContent = text;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(node => {
      const text = t[node.dataset.i18nTitle];
      if (text) {
        node.title = text;
        node.setAttribute('aria-label', text);
      }
    });
    renderLastUpdate();
    refreshClaimButtons();
  }

  function renderLastUpdate() {
    if (!lastUpdateTs) return;
    const t = translations[currentLang];
    const time = new Date(lastUpdateTs).toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit' });
    els.lastUpdate.textContent = `${t.last_check} ${time}`;
  }

  function renderGames(games) {
    els.loading.hidden = true;
    els.epicGames.replaceChildren();
    els.steamGames.replaceChildren();
    els.fabGames.replaceChildren();
    activeUrls = [];
    cardRefs.clear();

    const isActive = (g) => typeof g.endDate !== 'number' || g.endDate > Date.now();
    const lists = {
      epic: (games.epic || []).filter(isActive),
      steam: (games.steam || []).filter(isActive),
      fab: (games.fab || []).filter(isActive)
    };

    activeLists = lists;

    for (const key of Object.keys(lists)) {
      lists[key].forEach((game, i) => {
        if (game.isNew) newUrls.add(game.url);
        els[`${key}Games`].appendChild(createGameCard(game, key, i));
        activeUrls.push(game.url);
      });
      els[`${key}Count`].textContent = lists[key].length;
      els[`${key}Section`].hidden = lists[key].length === 0;
    }

    refreshOpenAll();
    els.emptyState.hidden = activeUrls.length !== 0;

    if (games.lastUpdate) {
      lastUpdateTs = games.lastUpdate;
      renderLastUpdate();
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createGameCard(game, key, index) {
    const t = translations[currentLang];

    // Süre metni
    let dateText = t.limited;
    let urgent = false;
    if (typeof game.endDate === 'number') {
      const diff = game.endDate - Date.now();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      if (days > 0) dateText = `${days} ${t.days_left}`;
      else if (hours > 0) dateText = `${hours} ${t.hours_left}`;
      else dateText = `<1 ${t.hours_left}`;
      urgent = days < 1;
    }

    // slot: sabit, perspektifi taşır ve olayları dinler (kenarda titreme olmaz)
    const slot = el('div', 'card-slot');
    slot.dataset.platform = key;

    const wrapper = el('div', 'game-card-wrapper');
    wrapper.dataset.platform = key;

    // Kartın tamamını kaplayan bağlantı
    const link = el('a', 'card-link');
    link.href = game.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.title = game.title || '';
    link.title = link.dataset.title;
    link.draggable = false;
    // Yeni sekmede aç ama geçme: popup açık kalır ("Tümünü aç" ile aynı davranış)
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (!game.url) return;
      chrome.tabs.create({ url: game.url, active: false });
      markClaimed([game.url]); // karta tıklayınca da işaretle
    });

    // "Aldım" işareti
    const claimBtn = el('button', 'claim-btn', '✓');
    claimBtn.type = 'button';
    claimBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleClaimed(game.url);
    });

    if (!cardRefs.has(game.url)) cardRefs.set(game.url, []);
    cardRefs.get(game.url).push({ slot, btn: claimBtn });

    wrapper.style.setProperty('--i', Math.min(index, 8));
    wrapper.style.setProperty('--c', `var(--${key})`);

    const card = el('div', 'game-card');
    const img = el('img', 'game-thumbnail');
    img.alt = '';
    img.loading = 'lazy';
    img.draggable = false;
    const fallbackIcon = 'icons/icon128.png';
    img.addEventListener('error', () => {
      if (!img.src.endsWith(fallbackIcon)) img.src = fallbackIcon;
    });
    img.src = game.thumbnail || fallbackIcon;
    card.appendChild(img);

    const badges = el('div', 'badge-container');
    if (newUrls.has(game.url)) badges.appendChild(el('span', 'platform-badge new-badge', t.new_label));
    badges.appendChild(el('span', 'platform-badge', PLATFORM_LABELS[key]));

    // Dış kaynaklı metinler textContent ile yazılır
    const info = el('div', 'game-info-overlay');
    info.appendChild(el('div', 'game-title', game.title || ''));
    info.appendChild(el('div', `game-end-date${urgent ? ' urgent' : ''}`, dateText));
    info.appendChild(el('div', 'claim-note'));

    wrapper.append(card, badges, info, link, claimBtn);
    slot.appendChild(wrapper);
    applyClaimedState(slot, claimBtn, game.url);
    attachTilt(slot, wrapper);
    return slot;
  }

  // 3D eğim efekti (korundu): pointer konumuna göre döner, parlama imleci izler
  function attachTilt(slot, card) {
    let raf = null;

    slot.addEventListener('pointermove', (e) => {
      if (reducedMotion.matches || e.pointerType === 'touch') return;
      const rect = slot.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.classList.add('is-tilting');
        card.style.setProperty('--rx', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
    });

    slot.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
});
