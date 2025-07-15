# Drobe 👗🛒  
**Drobe** is a mobile fashion marketplace app built using React Native and Firebase. It allows users to browse, wishlist, and buy fashion items — while sellers can upload their own products. Designed as a full-stack app for real-world experience.

---

## 🚀 Features

- 🏠 Home Screen with gender and image-based category filtering
- 🔍 Product Detail screen with wishlist/cart buttons
- ❤️ Wishlist and 🛒 Cart saved per user
- ⬆️ Upload products (only for registered sellers)
- 🛍️ Seller Dashboard for managing uploaded items
- 💳 Razorpay payment integration
- 🔐 Firebase Auth for sign-in and protected access

---

## 🛠️ Tech Stack

| Layer         | Tool                  |
|---------------|------------------------|
| Frontend      | React Native (Expo)    |
| Backend       | Firebase Firestore     |
| Image Storage | Firebase Storage       |
| Auth          | Firebase Auth          |
| Payments      | Razorpay (test mode)   |
| Versioning    | Git & GitHub           |

---

## 🗂️ Folder Structure (Simplified)

```bash
/screens            # Main screens (Home, Upload, Wishlist, etc.)
/components         # ProductCard, BannerCarousel, etc.
/context            # CartContext, AuthContext
firebaseConfig.js   # Firebase setup
App.js              # Entry point
