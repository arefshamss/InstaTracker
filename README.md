# 📡 InstaTracker

> A fast, secure, and privacy-focused Progressive Web App (PWA) to track Instagram follower changes (new followers & unfollowers) completely offline in your browser.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](#)
[![Version](https://img.shields.io/badge/version-1.0.3-indigo.svg)](#)
[![100% Client-Side](https://img.shields.io/badge/security-100%25%20client--side-emerald.svg)](#)

---

## ✨ Features

- 🔒 **100% Secure & Private:** Zero backend, zero server calls. All data processing and parsing happen entirely on your machine.
- 📦 **Direct ZIP & Multi-file Support:** Supports direct Instagram data export (`.zip`) as well as standalone `.html` and `.json` files.
- 📱 **Installable PWA:** Can be installed on iOS, Android, macOS, and Windows for native app experience.
- ⚡ **Offline First:** Works seamlessly without an active internet connection thanks to Service Workers.
- 🎯 **Smart Comparison:** Accurately filters system links (`/reels/`, `/p/`, etc.) and isolates new vs. lost followers with one-click copy options.

---

## 🚀 Demo & Live App

You can access and install the live app here:  
👉 **[Live Demo](https://arefshamss.github.io/InstaTracker/)**

---

## 🛠️ Built With

- **HTML5 & Vanilla JavaScript (ES6+)**
- **Tailwind CSS** (via CDN)
- **[JSZip](https://stuk.github.io/jszip/)** (Client-side ZIP extraction)
- **Service Workers & Web App Manifest** (PWA support)

---

## 📖 How to Get Your Instagram Data

1. Open Instagram and go to **Settings & Activity** → **Accounts Center**.
2. Navigate to **Your information and permissions** → **Download your information**.
3. Choose **Download or transfer information** → Select **Some of your information**.
4. Check only **Followers and following** (keeps the file tiny).
5. Select **Download to device**:
   - **Format:** `JSON` or `HTML`
   - **Date range:** `All time`
6. Click **Create files**. Once Instagram prepares the download, upload the `.zip` file directly into **InstaTracker**.

---

## 🇮🇷 راهنمای فارسی (Persian Guide)

این ابزار برای مقایسه دقیق فالوورهای اینستاگرام طراحی شده تا بدون نیاز به وارد کردن پسورد یا لاگین، بتوانید تغییرات فالوورها (افراد جدید و کسانی که آنفالو کرده‌اند) را مشاهده کنید.

### ویژگی‌های اصلی:

- **کاملاً امن و آفلاین:** هیچ داده‌ای به هیچ سروری ارسال نمی‌شود و تمام پردازش‌ها داخل مرورگر سیستم یا گوشی خودتان انجام می‌شود.
- **پشتیبانی از فایل ZIP:** نیازی به استخراج دستی فایل‌ها نیست؛ فایل دانلودی اینستاگرام را مستقیماً آپلود کنید.
- **قابلیت نصب (PWA):** می‌توانید برنامه را مثل یک اپلیکیشن بومی روی گوشی یا کامپیوتر خود نصب کنید.

---

## 👨‍💻 Author

**Aref Shamspour**

- Website: [arefshams.com](https://arefshams.com) | [aref.info](https://aref.info)
- GitHub: [@arefshamss](https://github.com/arefshamss)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
