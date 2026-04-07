## SanFastDelivery Backend (Dev mode A)

### English

This repo is set up to run **infrastructure in Docker** (Postgres/Redis/RabbitMQ/Kafka/Zookeeper) and run **application services locally**:

- **Gateway**: `8080`
- **Restaurant Service**: `8081`
- **Order Service**: `8082`

#### Prerequisites

- Docker Desktop (running)
- Java 17+
- Maven (or use the provided `./mvnw` wrapper)

#### Start everything (recommended)

From the repo root:

```bash
chmod +x backend/dev-up.sh backend/dev-down.sh
./backend/dev-up.sh
```

This will:

1. `docker compose up -d` (infra)
2. Start `gateway-service`, `restaurant-service`, `order-service` locally (background)
3. Write logs to:
   - `backend/gateway.log`
   - `backend/restaurant.log`
   - `backend/order.log`

#### Verify

```bash
curl -sS http://localhost:8080/actuator/health
curl -sS http://localhost:8081/actuator/health
curl -sS http://localhost:8082/actuator/health
```

Gateway routes:

```bash
curl -sS http://localhost:8080/api/products | head
curl -sS http://localhost:8080/api/orders/user/1 | head
```

#### Stop everything

```bash
./backend/dev-down.sh
docker compose down
```

---

### ไทย (TH)

โปรเจกต์นี้แนะนำให้รันแบบ **A** คือให้ **infra อยู่ใน Docker** และให้ **service ของแอปรันบนเครื่อง**:

- **Gateway**: `8080`
- **Restaurant Service**: `8081`
- **Order Service**: `8082`

#### สิ่งที่ต้องมี

- Docker Desktop เปิดอยู่
- Java 17+
- Maven (หรือใช้ `./mvnw` ได้)

#### สตาร์ททั้งหมด (แนะนำ)

ที่โฟลเดอร์ root ของโปรเจกต์:

```bash
chmod +x backend/dev-up.sh backend/dev-down.sh
./backend/dev-up.sh
```

สคริปต์จะทำ:

1. `docker compose up -d` (infra)
2. รัน `gateway-service`, `restaurant-service`, `order-service` บนเครื่อง (แบบ background)
3. เก็บ log ไว้ที่:
   - `backend/gateway.log`
   - `backend/restaurant.log`
   - `backend/order.log`

#### เช็คว่า service ขึ้นครบ

```bash
curl -sS http://localhost:8080/actuator/health
curl -sS http://localhost:8081/actuator/health
curl -sS http://localhost:8082/actuator/health
```

#### ปิด service

```bash
./backend/dev-down.sh
docker compose down
```

