# 🎮 NooXGFree — Free Games Tracker

Epic Games + Steam + **Fab (Limited-Time Free / Unreal Engine)** içeriklerini tek yerden takip etmek için hafif, modern bir tarayıcı eklentisi.

---

## 🎮 Support Development

This project is developed independently.  
If you'd like to support future updates and new features:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-orange?style=for-the-badge&logo=buymeacoffee)](https://buymeacoffee.com/nooxrii)

Your support helps keep development going 🚀

---

## 📥 Download Latest Version

> Bu repo şu an “unpacked/klasör olarak yükleme” şeklinde kullanıma uygundur.  
> Eğer GitHub Releases kullanıyorsan aşağıdaki linki kendi repo adresinle güncelleyebilirsin.

[![Download Latest](https://img.shields.io/badge/Download-Latest-orange?style=for-the-badge)](https://github.com/)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏷️ **Epic Free Games** | Epic Games Store haftalık ücretsiz oyunları listeler |
| 🏷️ **Steam Free Deals** | Steam’de ücretsiz / %100 indirimli içerikleri listeler |
| 🧩 **Fab (Limited-Time Free)** | `fab.com/tr/limited-time-free` sayfasındaki limited içerikleri listeler (Unreal Engine freebies) |
| ⏳ **Countdown / End Date** | Epic, Steam ve Fab için promosyon bitiş zamanına göre kalan süre |
| 🆕 **NEW Highlight** | Popup son açıldığından beri eklenen içerikler kartlarda **Yeni** olarak işaretlenir |
| 🧮 **Badge Count** | Henüz görmediğin yeni içerik sayısını eklenti badge’i olarak gösterir |
| 🖼️ **Modern UI + Thumbnails** | Kapak görseli, sade kart tasarımı |
| 🛒 **Kategori Bazlı Alma** | Epic, Steam ve Fab: tek tıkla kütüphaneye eklenir (mağazada oturum açık olmalı). Epic'te sayfa ücretsiz olduğunu doğrulamazsa hiçbir şeye basılmaz; güvenlik doğrulaması çıkarsa onu sen tamamlarsın. Ana oyunu hesabında olmayan Steam DLC'leri işaretlenir ve nedeni kartta yazar |
| ✅ **Kütüphane Kontrolü** | Hesabında zaten olan içerikler otomatik işaretlenir ve toplu almaya dahil edilmez |
| 💬 **Discord Webhook** | Yeni içerikleri Discord kanalına gönderir, başarısız gönderimleri sonraki taramada tekrar dener |
| 🌍 **Language** | TR/EN/DE arayüz dili |
| 🔄 **Auto Refresh** | 2 saatte bir otomatik güncelleme + manuel yenileme |
| 🧷 **Open All** | Tek tıkla tüm listeyi sekmelerde açar |

---

## 🚀 Installation (Chrome / Edge / Brave)

1. Bu klasörü bilgisayarına indir
2. Tarayıcıda `chrome://extensions` (veya `edge://extensions`) sayfasına gir
3. Sağ üstten **Developer mode / Geliştirici modu**’nu aç
4. **Load unpacked / Paketlenmemiş öğe yükle**’ye tıkla
5. Bu proje klasörünü seç (`NooXGFree`)
6. Bitti

---

## 📖 Usage

1. Sağ üstteki **NooXGFree** ikonuna tıkla
2. Platformlara göre listelenen içerikleri gör
3. Kartlara tıklayıp sayfaya git veya **TÜMÜNÜ AÇ** ile hepsini aç
4. Manuel güncelleme için yenileme ikonuna bas

---

## 🔧 Technical Notes

- **Manifest**: v3
- **Tech**: Vanilla JavaScript + CSS
- **Data sources**:
  - Epic Games: `freeGamesPromotions` API
  - Steam: Store arama + appdetails
  - Fab: `limited-time-free` sayfasındaki gömülü JSON (site değişirse güncelleme gerekebilir)
- **Update interval**: 2 hours (Chrome alarms)
- **Storage**: `chrome.storage.local`

---

## 🐛 Bug Reports / Suggestions

Bir hata bulursan veya önerin varsa yazabilirsin.

---

*Developed by NooXRii*
