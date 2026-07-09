# Selam English

Selam English is a voice-first English learning app for Amharic speakers. It combines a 5,000-word spoken-fluency curriculum with a separate reading-comprehension track, gradual sentence building, Amharic explanations, pronunciation playback, review practice, and Gemini Live voice conversations.

Production: [selam-english-amharic.vercel.app](https://selam-english-amharic.vercel.app)

## Product Features

- A 5,000-word speaking catalog ordered by conversational frequency.
- Word, phrase, short-sentence, and long-sentence progression.
- Amharic meaning, grammar, and pronunciation guidance.
- Gemini Live audio conversations adapted to the learner's level and current lesson.
- A separate reading path with passages, vocabulary support, read-aloud audio, and scored questions.
- Daily plans, streaks, mastery tracking, review queues, and progress reporting.
- Slow pronunciation playback for words, phrases, and sentences.
- Native daily notifications on Android and iOS, plus supported web notifications.
- Installable PWA with offline access to the curated curriculum and media.
- Capacitor projects for Android and iOS using the same responsive application.

## Stack

- React, TypeScript, and Vite
- Gemini Live and Gemini structured generation through `@google/genai`
- Vercel Functions for protected Gemini credentials
- Capacitor for Android and iOS
- Vitest for curriculum and progress-state tests
- `vite-plugin-pwa` for installability and offline caching

## Local Development

Requirements: Node.js 24.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in the deployment environment. Vite's local server does not run the Vercel Functions in `api/`; use `vercel dev` when testing live Gemini endpoints locally.

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

## Deployment

Deploy the repository to Vercel and add `GEMINI_API_KEY` as a production environment variable. The browser receives only short-lived, single-use Gemini Live credentials. Long-lived credentials never enter the client bundle.

Security headers, native-origin CORS, request validation, rate limiting, and cache policies are defined in `vercel.json` and `api/`.

## Android And iOS

For native builds, set the production API origin before syncing so the bundled WebView can reach the Vercel Functions:

```bash
set VITE_API_BASE_URL=https://selam-english-amharic.vercel.app
npm run cap:sync
```

Open `android/` in Android Studio. Open `ios/App/App.xcworkspace` on macOS with Xcode. iOS compilation and App Store signing require macOS and an Apple Developer account.

The native projects include branded icons and splash screens, microphone permissions, and scheduled local-notification support.

## Data And Privacy

Learning progress is stored on the learner's device. Microphone audio streams to Gemini only during an active voice session and stops when the session ends.

The spoken-word frequency seed is derived from the MIT-licensed [FrequencyWords](https://github.com/hermitdave/FrequencyWords) English corpus. Curated lessons, reading passages, Amharic teaching content, and visual mappings are maintained in this repository.
