# Book Wise - Python service

Сервіс розпізнавання мови та генерації тестів.

- швидкість читання по WebSocket: Vosk з граматикою з еталонного тексту, слова порівнюються з текстом наживо
- перевірка підстановок (Vosk + Moonshine) після закінчення сесії
- перевірка наголосів (Montreal Forced Aligner + класифікатор), працює у фоні
- питання до прочитаного і тести до книжок через Gemini (запити приходять з RabbitMQ)

Стек: Python 3.11+, FastAPI, Vosk, PyTorch, scikit-learn, aio-pika, MinIO.

## Запуск

Потрібні Docker, запущені MinIO та Java-бекенд, ключ Gemini.

```bash
docker compose up -d                          # RabbitMQ
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install --no-deps -r requirements-stress.txt
./scripts/download_vosk_model.sh              # модель lgraph, ~325 МБ
python main.py                                # http://localhost:8001
```

Необов'язково: `requirements-hybrid.txt` (перевірка підстановок, потрібен torch) і MFA через conda для наголосів. Без них сервіс працює, ці перевірки просто пропускаються.

Файл `.env` (решта змінних зі значеннями за замовчуванням у `core/config.py`):

```
SUPABASE_URL=https://<project>.supabase.co
JAVA_BASE_URL=http://localhost:8080
JAVA_INTERNAL_API_KEY=<як INTERNAL_API_KEY у java>
GEMINI_API_KEY=<ключ>
MINIO_ENDPOINT=localhost:9002
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=books
VOSK_MODEL_PATH=vosk_models/vosk-model-uk-v3-lgraph
MFA_BIN_DIR=<bin оточення conda з mfa>
```

## Ендпоінти

- `GET /api/status`
- `WS /ws/reading-speed?token=...&participant_id=...` - клієнт шле PCM 16 кГц mono, у відповідь отримує статуси слів; `stop` завершує сесію
- `POST /internal/book-paragraphs` - для Java

## Структура

- `api/routes/` - маршрути
- `services/` - розпізнавання, вирівнювання, стрес, тести, клієнти Java/MinIO/RabbitMQ
- `resources/` - еталонні тексти, модель наголосів
- `scripts/` - завантаження моделі та перевірки на записах
