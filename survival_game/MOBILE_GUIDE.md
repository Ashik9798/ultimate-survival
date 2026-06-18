# 📱 Mobile-Only Publishing Guide (Free)

This guide is for users who **do not have a computer** and want to build/publish the game using only a mobile phone.

---

## ⚠️ Important Truth

- **Code editing** on mobile: ✅ Free and easy
- **APK building** on mobile directly: ❌ Very difficult
- **APK building via free cloud (GitHub Actions)**: ✅ Possible
- **Play Store upload** on mobile: ⚠️ Possible but difficult; ideally use a computer or desktop-mode browser

---

## 📲 Apps You Need (All Free)

1. **Termux** — Terminal for Android (Node.js, Git, npm)
2. **Acode** or **Spck Editor** — Code editor
3. **GitHub** — For code backup and GitHub Actions
4. **Google Chrome** — For desktop-mode Play Console
5. **Files** — File manager

---

## 🔧 Step 1: Install Tools on Mobile

### Install Termux
1. Download from F-Droid or GitHub (not Play Store, older version)
2. Open Termux and run:
```bash
pkg update
pkg install nodejs git nano
```

### Install Acode or Spck Editor
Search on Google Play Store and install.

---

## 📂 Step 2: Put Project on Mobile

### Option A: Copy from this workspace
If someone shared the project with you, copy `survival_game` folder to:
```
/storage/emulated/0/Documents/survival_game/
```

### Option B: Download from GitHub
If the project is on GitHub, use Termux:
```bash
cd /storage/emulated/0/Documents
git clone https://github.com/YOUR_USERNAME/ultimate-survival.git
```

---

## ✏️ Step 3: Edit Code on Mobile

### Using Acode
1. Open Acode
2. Tap **Open Folder**
3. Select `Documents/survival_game`
4. Edit any file and save

### Using Termux + nano
```bash
cd /storage/emulated/0/Documents/survival_game
nano assets/js/levels.js
```

---

## ☁️ Step 4: Build APK Using Free Cloud (GitHub Actions)

### Step 4.1: Create GitHub Account
- Go to https://github.com/signup
- Create free account

### Step 4.2: Create New Repository
- Open GitHub mobile app
- Tap **+** → New Repository
- Name: `ultimate-survival`
- Make it **Public** (free Actions)
- Tap **Create**

### Step 4.3: Upload Your Project Files
- In GitHub app or browser, go to your repo
- Tap **Add file** → **Upload files**
- Upload all files from `survival_game` folder
- Commit with message: "Initial version"

### Step 4.4: GitHub Actions Will Auto-Build APK

I have already included `.github/workflows/android.yml` in the project. Once you upload the project, GitHub will automatically build the APK.

To check build status:
1. Go to your GitHub repo in Chrome
2. Tap **Actions** tab
3. You will see the workflow running
4. Wait 5-10 minutes

### Step 4.5: Download the APK

After the build succeeds:
1. Tap the completed workflow
2. Scroll down to **Artifacts**
3. Download `Ultimate-Survival-APK`
4. The downloaded file is a ZIP — extract it on mobile
5. You will get `app-debug.apk`
6. Tap it to install (allow unknown sources if asked)

---

## 🚀 Step 5: Publish on Play Store (From Mobile)

### Method A: Using Chrome Desktop Mode
1. Open Chrome
2. Go to https://play.google.com/console
3. Tap **⋮** → **Desktop site** (enable desktop mode)
4. Login with your developer account
5. Create app and upload your AAB/APK

### Method B: Ask for 1 Hour Computer Access
The easiest way:
- Use a friend's laptop, internet cafe, or school computer
- Just upload the AAB file from your Google Drive/Email
- You do not need to install anything

---

## 💰 Step 6: Earn Money

### Add AdMob Ads (Requires Code Edit)
1. Go to https://admob.google.com
2. Create account
3. Create ad units
4. Get AdMob App ID
5. Add to `capacitor.config.json` or via Capacitor AdMob plugin
6. Push to GitHub → GitHub Actions rebuilds APK

### In-App Purchase
- Use `@capacitor-community/in-app-purchase` or `cordova-plugin-purchase`
- Requires Google Play Merchant account

### Paid App
- In Play Console, set price for your app

---

## 🔄 How to Update Later

1. Edit files in Acode/Termux
2. Push to GitHub using Termux:
```bash
cd /storage/emulated/0/Documents/survival_game
git add .
git commit -m "update version 1.1"
git push origin main
```
3. GitHub Actions will build new APK automatically
4. Download and upload to Play Store

---

## 🆘 Common Mobile Problems

| Problem | Solution |
|---------|----------|
| Termux not installing | Use F-Droid version |
| GitHub Actions fails | Check the error log in Actions tab |
| APK not installing | Enable **Install unknown apps** for Files |
| Play Console not loading | Use Chrome Desktop mode |
| Build takes too long | Wait 10-15 minutes; GitHub servers are free |

---

## ✅ Summary

| Task | How on Mobile |
|------|---------------|
| Code editing | Acode or Termux |
| Code backup | GitHub app/Termux |
| Build APK | GitHub Actions (free cloud) |
| Install APK | Download from GitHub Actions |
| Play Store upload | Chrome Desktop mode or borrow PC |
| Updates | Push to GitHub → auto rebuild |

---

Good luck! You can do most of it with just a phone. 🔥
