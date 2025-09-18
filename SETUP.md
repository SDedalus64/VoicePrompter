# Voice Prompt Project — Quick Setup Guide

This is a lightweight onboarding doc for developers who clone the repo.  
For full context and roadmap, see the main `README.md`.

---

## Requirements
- Node.js (>= 18)
- React Native CLI installed globally
- Xcode (for iOS) or Android Studio (for Android)

---

## Install & Run

```bash
# install dependencies
npm install

# start Metro bundler
npm start

# run on iOS simulator
npm run ios

# run on Android emulator
npm run android
```

---

## Native Integration

### iOS
1. Open the project in Xcode (`ios/YourProject.xcworkspace`).
2. Add the `app/ios/AudioCoach/` folder to your Xcode target.
3. Enable Background Modes → Audio under Signing & Capabilities.

### Android
1. Copy the `app/android/audiocoach/` folder under `android/app/src/main/java/com/yourproject/`.
2. Register `new AudioCoachPackage()` in `MainApplication.java`.

---

## Project Structure
- `src/screens` — main app screens (Composer, Planner, Runner)
- `src/lib/audio` — React Native → Native bridge
- `src/data` — sample session JSON
- `ios/AudioCoach` — Swift native module
- `android/audiocoach` — Kotlin native module

---

## First Test
1. Launch the app.
2. Go to **Session Runner**.
3. Press **Start** → should see `engine_started` status and a test cue after ~2s.

---

## Git Workflow
```bash
git init
git add .
git commit -m "Initial scaffold for Voice Prompt Project"
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Next Steps
- Replace naive cue timer with VAD/silence detection.
- Add Azure Neural TTS.
- Add streaming ASR and LLM-powered segues.
