# 🔥 Ultimate Survival: 10 Levels

A mobile-optimized HTML5 survival game with **10 levels** of increasing difficulty. The final level is designed to be **nearly impossible** to complete.

---

## 🎮 Features

- **10 Levels** — each harder than the last
- **Level 10 = HELL** — mathematically impossible to survive
- **Realistic image-based sprites**: Player, 6 enemy types, boss
- **Different enemy types**: Walker, Runner, Tank, Shooter, Invisible, Exploder, Blackhole
- **Boss fights** on levels 7, 8, 9, and 10
- **Hazards**: Poison, Ice, Fire, Hellfire, Darkness
- **Power-ups**: Health, Bomb, Speed, Rapid Fire
- **Realistic synthesized sound effects** (gunshots, explosions, impacts, boss roar)
- **Mobile joystick + action buttons**
- **Anti-cheat / Anti-tamper protection** included
- **Obfuscated production build** script
- **Ready to wrap as Android APK/AAB** using Capacitor

---

## 🚀 How to Run Locally

Open `index.html` in any modern browser, or run a local server:

```bash
npx http-server -p 8080
```

Then visit `http://localhost:8080`.

---

## 🔧 Build for Production (Obfuscation)

```bash
npm install
npm run build
```

This creates a `dist/` folder with minified JS and anti-tamper checks.

---

## 📱 Convert to Android App for Play Store

### 1. Install Capacitor dependencies
```bash
cd dist
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Initialize Capacitor
```bash
npx cap init "Ultimate Survival" com.yourcompany.ultimatesurvival
```

### 3. Add Android platform
```bash
npx cap add android
```

### 4. Open in Android Studio
```bash
npx cap open android
```

### 5. Build signed App Bundle (AAB) for Play Store
In Android Studio:
- Go to **Build → Generate Signed App Bundle / APK...**
- Create/upload your **keystore**
- Select **Android App Bundle (.aab)**
- Upload the generated `.aab` file to **Google Play Console**

---

## 🔒 Anti-Cheat / Anti-Copyright Protection Included

1. **Anti-Debugger**: `debugger` statement + timing detection
2. **DevTools detection**: Blocks console tampering attempts
3. **Save data encryption + hash**: localStorage progress is encoded and hashed
4. **Save tampering detection**: Invalid save data is auto-deleted
5. **Ban mechanism**: Repeated cheating resets progress and bans the device
6. **Code obfuscation**: Terser minifies/mangles all JS in production build
7. **Level checksum validation**: Level data is validated against hashes
8. **Right-click / F12 / Ctrl+S disabled** during gameplay

**Note**: No anti-cheat is 100% unhackable. For stronger protection, consider:
- Server-side save storage (Firebase / Play Games Services)
- Google Play Integrity API
- ProGuard / R8 in Android
- Native code via WebAssembly or Android native modules

---

## 📂 Project Structure

```
survival_game/
├── index.html          # Main game page
├── assets/
│   ├── css/style.css   # Game UI styles
│   ├── images/         # Realistic game sprites and icon
│   └── js/
│       ├── antiCheat.js   # Security module
│       ├── levels.js        # 10 level definitions
│       └── game.js          # Main game engine
├── build/
│   ├── build.js        # Production build/obfuscation script
│   └── icons.js        # Android icon generator
├── android/            # Android project (auto-generated)
├── android-icons/      # Launcher icon sizes
├── package.json        # Node dependencies & scripts
└── README.md           # This file
```

---

## 📝 Customization

- Edit `assets/js/levels.js` to change difficulty, enemy types, timers, bosses
- Edit `assets/css/style.css` for colors, fonts, UI layout
- Edit `assets/js/game.js` for new weapons, enemies, or mechanics

---

## ⚠️ Legal / Copyright Advice

- Register your own **app/game name** before publishing
- Add your own **icon, screenshots, and description**
- Add a **privacy policy** if using ads or analytics
- Consider trademarking your game name in your target countries
- Use **Google Play App Signing** to protect your APK/AAB
- Use **ProGuard** in Android Studio to further obfuscate Java code

---

## 🛠️ Made With

- HTML5 Canvas
- JavaScript (ES6)
- Capacitor (for Android wrapper)
- Terser (for JS obfuscation)

---

## বাংলা নির্দেশনা

এটি একটি পূর্ণাঙ্গ HTML5 সারভাইভাল গেম। আপনি এটিকে Android APK/AAB বানিয়ে Google Play Store-এ পাবলিশ করতে পারবেন।

### প্রকাশনার ধাপ:
1. `npm install && npm run build` চালান — এতে কোড অবফাসকেট হবে
2. `dist/` ফোল্ডারে Capacitor দিয়ে Android অ্যাপ বানান
3. Android Studio-তে `.aab` (App Bundle) জেনারেট করুন
4. Google Play Console-এ আপলোড করুন

### নিরাপত্তা:
- সেভ ডেটা হ্যাশ করা থাকে, হ্যাক করলে অটো ডিলিট হবে
- ৩ বার চিটিং করলে ডিভাইস ব্যান হবে
- DevTools / Console খুললে সতর্কতা ও রিসেট হবে

---

Enjoy the game! 🔥
