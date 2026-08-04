# Payment Processing System - Initial Blueprint

## Tech Stack
- Java 17
- Spring Boot 3.x
- Spring JDBC
- Spring Validation
- MySQL 8
- Lombok
- Maven
- Docker Compose

## Package Structure
```text
src/main/java/com/example/PaymentProcessingSystem/
  Controller/
  Service/
  Repository/
  model/
```

## Data Model Rules
- Money uses the **minor-unit pattern** (`Long` cents).
- Money uses the **minor-unit pattern** (`BIGINT` in SQL).
- `schema.sql` creates the database tables at startup.
- No demo rows are seeded automatically at startup.
- Unified audit is stored in `audit_log`.

## Local Run (Docker)
```bash
docker compose up --build
```

## Local Run (without Docker app container)
```bash
docker compose up -d mysql
./mvnw spring-boot:run
```

