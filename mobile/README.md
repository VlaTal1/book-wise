# Book Wise - mobile

Mobile app for primary school: kids read books and take tests and reading speed exercises, teachers manage classes and look at statistics. The UI is in Ukrainian and English.

Stack: Expo, React Native, TypeScript, Expo Router, Tamagui, Redux Toolkit, Supabase Auth.

The app uses native modules (microphone, PDF), so it runs as a development build, not in Expo Go.

## Run

```bash
npm install
npm run android     # or npm run ios
npm start           # Metro, if the build is already installed
```

Environment variables go in `.env.development` (`.env.production` for production):

```
EXPO_PUBLIC_API_BASE_URL=http://<ip>:8080
EXPO_PUBLIC_PYTHON_WS_BASE_URL=ws://<ip>:8001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

On a phone use your computer's LAN IP, not localhost.

EAS build:

```bash
eas build --profile preview --platform android
```

## Structure

- `app/` - screens (Expo Router)
- `components/` - UI components
- `api/` - requests to the Java backend
- `services/` - WebSocket and audio recording
- `store/`, `auth/`, `hooks/`, `utils/`, `types/`
- `localization/` - translations
