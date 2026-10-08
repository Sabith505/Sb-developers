# SB Developers - Storefront Documentation

Welcome to your custom **SB Developers** Storefront! Tailored to your **SB Developers** brand in Cyan & Electric Blue.

---

## 📁 Project Structure

```text
Storefornt/
│
├── index.html                 # Main storefront website (100% Mobile & Desktop Responsive)
├── sb_logo.png                # SB Developers official logo
├── start-server.bat           # 1-click preview launcher
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Cyber Cyan & Blue styles + mobile media queries
│   │   └── tebex-theme.css    # Direct-paste stylesheet for Tebex Creator Panel
│   │
│   ├── js/
│   │   ├── app.js             # Cart, modal previews, video player & mobile drawer
│   │   └── products.js        # Product list (SB TDM), USD pricing, video URLs
│   │
│   └── images/
│       ├── sb_tdm.jpg         # SB TDM high-res banner
│       └── logo.png           # Logo backup
│
└── tebex-instructions.md      # This guide
```

---

## 📱 Mobile Compatibility Features

- **Slide-out Mobile Navigation**: A sleek hamburger menu on mobile screens that smoothly slides in with quick jump links to Home, Store, Features, Reviews, FAQ, and Discord.
- **Dynamic Viewport Scaling**: Titles, buttons, cards, and modal previews automatically adapt to iPhone, Android, tablets, and desktop displays.
- **Touch-Friendly Buttons**: Cart, reviews, and checkout buttons are optimized for one-tap mobile usability.
- **Clean Discord Buttons**: Shows clean text (`Join Discord`) with your direct invitation link (`https://discord.gg/JPfmWeqMMC`) without showing raw URLs in prose.

---

## 🎬 How to Add YouTube Videos to Any Product

In [`assets/js/products.js`](file:///c:/Users/nizam/Downloads/CITY/Storefornt/assets/js/products.js), every product supports a `videoUrl` parameter:

```javascript
const STORE_CONFIG = {
  storeName: "SB Developers",
  discordUrl: "https://discord.gg/JPfmWeqMMC",
  tebexStoreUrl: "https://sb-developer.tebex.store",
  supportEmail: "support@sbdevelopers.net"
};
```

### Active Package Links
- **SB TDM Package URL**: `https://sb-developer.tebex.store/package/7723283`

When a `videoUrl` is provided:
- A **"Watch Video"** indicator automatically appears on the product card.
- In the details modal, customers can toggle between the **📷 Poster View** and **🎬 Video Preview** to watch your gameplay showcase in full 1080p right on your website!

---

## 💵 Price Settings

Current active pricing for **SB TDM**:
- **Price**: `$13.99 USD`
- **Original Price (Crossed Out)**: `$15.00 USD`

---

## ⭐ Customer Review System

- **Dynamic Review Panel**: Customers or server owners can click **"Leave a Review"**.
- Reviews include:
  - Customer / Nickname
  - Server / Community name
  - Star rating (1 to 5 stars)
  - Review feedback
- Submitted reviews are stored and immediately appear live in the **Customer Reviews** section.
