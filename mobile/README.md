# Book Wise - mobile

Мобільний застосунок для початкової школи: діти читають книжки, проходять тести та вправи на швидкість читання, вчителі ведуть класи й дивляться статистику. Інтерфейс українською та англійською.

Стек: Expo, React Native, TypeScript, Expo Router, Tamagui, Redux Toolkit, Supabase Auth.

Застосунок використовує нативні модулі (мікрофон, PDF), тому запускається як development build, а не в Expo Go.

## Запуск

```bash
npm install
npm run android     # або npm run ios
npm start           # Metro, якщо білд уже встановлено
```

Змінні середовища в `.env.development` (для production - `.env.production`):

```
EXPO_PUBLIC_API_BASE_URL=http://<ip>:8080
EXPO_PUBLIC_PYTHON_WS_BASE_URL=ws://<ip>:8001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

На телефоні потрібен IP комп'ютера в мережі, не localhost.

Збірка через EAS:

```bash
eas build --profile preview --platform android
```

## Структура

- `app/` - екрани (Expo Router)
- `components/` - компоненти
- `api/` - запити до Java-бекенду
- `services/` - WebSocket і запис аудіо
- `store/`, `auth/`, `hooks/`, `utils/`, `types/`
- `localization/` - переклади
