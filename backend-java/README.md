# Book Wise - Java backend

Основний REST API: користувачі, книжки, класи, тести, прогрес читання, статистика.

Стек: Java 21, Spring Boot 3.4, PostgreSQL + Liquibase, MinIO, RabbitMQ, Supabase JWT.

- `/api/**` - для мобільного застосунку (Supabase JWT)
- `/internal/**` - для Python-сервісу (ключ `INTERNAL_API_KEY`)

## Запуск

Потрібні JDK 21 і Docker. RabbitMQ піднімається з `docker-compose.yaml` в `backend-python`.

```bash
docker compose up -d     # PostgreSQL і MinIO
./gradlew bootRun        # http://localhost:8080
```

У MinIO (http://localhost:9001) треба створити бакет з `MINIO_BUCKET_NAME`.

Файл `.env` в корені:

```
SUPABASE_URL=https://<project>.supabase.co
INTERNAL_API_KEY=<ключ, такий самий як JAVA_INTERNAL_API_KEY у python>
MINIO_ENDPOINT=http://localhost:9002
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=books
POSTGRES_URL=jdbc:postgresql://localhost:5432/reader-ai
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VIRTUAL_HOST=/
```

`PYTHON_BASE_URL` за замовчуванням `http://localhost:8001`. Логін/пароль до бази задані в `application.yml`.

Тести: `./gradlew test`, збірка: `./gradlew bootJar`.
