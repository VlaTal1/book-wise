# Book Wise - Java backend

Main REST API: users, books, classrooms, tests, reading progress, statistics.

Stack: Java 21, Spring Boot 3.4, PostgreSQL + Liquibase, MinIO, RabbitMQ, Supabase JWT.

- `/api/**` - for the mobile app (Supabase JWT)
- `/internal/**` - for the Python service (`INTERNAL_API_KEY`)

## Run

Needs JDK 21 and Docker. RabbitMQ is started from `docker-compose.yaml` in `backend-python`.

```bash
docker compose up -d     # PostgreSQL and MinIO
./gradlew bootRun        # http://localhost:8080
```

Create the bucket from `MINIO_BUCKET_NAME` in MinIO (http://localhost:9001).

`.env` in the project root:

```
SUPABASE_URL=https://<project>.supabase.co
INTERNAL_API_KEY=<same as JAVA_INTERNAL_API_KEY in python>
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

`PYTHON_BASE_URL` defaults to `http://localhost:8001`. Database login and password are set in `application.yml`.

Tests: `./gradlew test`, build: `./gradlew bootJar`.
