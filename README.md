# Java Developer Tracker

Mobile-friendly Java 0–1 year checklist with Google Sign-In and Firestore cloud sync.

## Firebase setup
1. Enable Authentication → Sign-in method → Google.
2. Create Cloud Firestore.
3. Use the rules in `firestore.rules`.
4. Add your GitHub Pages domain to Firebase Authentication → Settings → Authorized domains if Firebase asks for it.

## GitHub Pages
Upload `index.html`, `style.css`, `app.js`, and `firestore.rules` to the repository root.
Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

The `firebaseConfig` in `app.js` is already filled with the supplied Firebase Web App configuration.
