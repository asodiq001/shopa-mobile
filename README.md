# Shopa Mobile 🛍️📱

> **"Pocket friendly everyday tech essentials on your phone"**

The official mobile companion app for the **Shopa** e-commerce platform, built as part of the **HNG 15 Internship (AI Product Engineering Track) — Lesson 3 Individual Task**.

---

## 🌟 Key Features

- **Cross-Platform Authentication:** Sign in using the exact same credentials (email/password) as the [Shopa Web Store](https://shopa-1.vercel.app), backed by Supabase Auth with secure local session persistence.
- **⚡ Instant Bidirectional Cart Sync:** Powered by **Supabase Realtime WebSockets**:
  - Add an item on the Web Store ➔ instantly appears in your Mobile Cart.
  - Add an item in the Mobile App ➔ instantly appears in your Web Store Cart.
- **Curated Tech Catalog:** Browse 20 everyday tech accessories across categories with search and category filtering.
- **Live Cart Management:** Instant quantity increments, decrements, subtotal recalculations, and item deletions.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React Native (Expo SDK 52) with TypeScript |
| **Backend & Auth** | Supabase (PostgreSQL, Auth, and Realtime WebSockets) |
| **Storage** | `@react-native-async-storage/async-storage` |
| **Styling** | Native StyleSheet with custom Jumia-inspired palette (`#F68B1E`, `#282828`, `#F7FAFC`) |

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Expo Dev Server
```bash
npx expo start
```

### 3. Open on a Physical Phone
1. Install the free **Expo Go** app from Google Play Store or Apple App Store.
2. Scan the QR code displayed in your terminal with your phone camera (iOS) or the Expo Go app (Android).
3. The app will launch immediately with live reload!

---

## 📦 Building Standalone Android APK

To generate a standalone `.apk` for Android:

```bash
npx eas-cli build -p android --profile preview
```

---

## 📄 License
MIT License
