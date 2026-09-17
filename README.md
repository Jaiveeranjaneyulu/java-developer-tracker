# Java Developer 0–1 Year Tracker

Mobile-friendly checklist that can be hosted on GitHub Pages.

## Features
- Responsive/mobile-first UI
- Progress percentage
- Search and filtering
- Local persistence
- Optional Firebase cloud sync across devices

## GitHub Pages
1. Create a GitHub repository, e.g. `java-developer-tracker`.
2. Upload `index.html`, `style.css`, and `app.js`.
3. GitHub → Settings → Pages → Deploy from branch → `main` → `/root`.
4. Open the generated GitHub Pages URL.

## Firebase sync
For progress to sync between phone and laptop:
1. Create a Firebase project.
2. Add a Web App.
3. Enable Authentication → Anonymous.
4. Create Firestore Database.
5. Copy the Web App configuration into `app.js`.
6. Publish the updated files to GitHub Pages.

Recommended Firestore rules for this simple personal tracker can be configured after testing. Anonymous authentication is convenient, but if you want stronger account recovery/login, switch to Email/Google authentication.
