## SanFastDelivery

### English

SanFastDelivery is a **microservices-based food ordering demo**.

You can:
- Browse menu items
- Use AI-assisted menu recommendations (Gemini with fallback)
- Register/Login (JWT)
- Place orders and track status
- Receive order events via Kafka and RabbitMQ (notification service logs events)

#### Services

- **Frontend (Next.js)**: `frontend/` (default `http://localhost:3000`)
- **Gateway Service (Spring Cloud Gateway)**: `backend/gateway-service` (default `:8080`)
- **Restaurant Service (Spring Boot)**: `backend/restaurant-service` (default `:8081`)
- **Order Service (Spring Boot)**: `backend/order-service` (default `:8082`)
- **Notification Service (Spring Boot)**: `backend/notification-service` (default `:8083`)

#### Tech stack

- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Cloud Gateway, JPA/Hibernate
- **Frontend**: Next.js (React), TypeScript, Ant Design, Zustand
- **Data**: PostgreSQL
- **Messaging**: Kafka, RabbitMQ
- **Caching (optional)**: Redis
- **Infra (dev)**: Docker Compose

#### Run locally (recommended dev mode A)

##### Prerequisites

- Docker Desktop
- Java 17+
- Node.js 18+

##### Start (infra + backend)

From repo root:

```bash
docker compose up -d

cd backend
chmod +x dev-up.sh dev-down.sh
./dev-up.sh
```

##### Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open:
- `http://localhost:3000` (frontend)
- `http://localhost:3000/login` (register/login)

##### Health checks

```bash
curl -sS http://localhost:8080/actuator/health
curl -sS http://localhost:8081/actuator/health
curl -sS http://localhost:8082/actuator/health
curl -sS http://localhost:8083/actuator/health
```

##### Stop

```bash
cd backend
./dev-down.sh

cd ..
docker compose down
```

#### Deploy to AWS

AWS path (high-level):
- Push images to **ECR**
- Run services on **ECS Fargate**
- Put **ALB** in front of gateway
- Use **RDS Postgres** for database
- Use **MSK (Kafka)** / **Amazon MQ (RabbitMQ)** / **ElastiCache (Redis)** as needed

Docs/code to look at:
- Dockerfiles: `backend/*-service/Dockerfile`
- Terraform scaffold: `infra/terraform/`

---

### ไทย (TH)

SanFastDelivery คือ **เดโม่ระบบสั่งอาหารแบบ microservices**

สามารถทำได้:
- ดูเมนูอาหาร
- ใช้ AI แนะนำเมนู (Gemini พร้อม fallback)
- สมัคร/ล็อกอิน (JWT)
- สั่งอาหารและติดตามสถานะ
- ส่ง/รับ event ของออเดอร์ผ่าน Kafka และ RabbitMQ (notification-service จะ log event)

#### Services

- **Frontend (Next.js)**: `frontend/` (ปกติ `http://localhost:3000`)
- **Gateway Service (Spring Cloud Gateway)**: `backend/gateway-service` (ปกติ `:8080`)
- **Restaurant Service (Spring Boot)**: `backend/restaurant-service` (ปกติ `:8081`)
- **Order Service (Spring Boot)**: `backend/order-service` (ปกติ `:8082`)
- **Notification Service (Spring Boot)**: `backend/notification-service` (ปกติ `:8083`)

#### Tech stack

- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Cloud Gateway, JPA/Hibernate
- **Frontend**: Next.js (React), TypeScript, Ant Design, Zustand
- **Data**: PostgreSQL
- **Messaging**: Kafka, RabbitMQ
- **Caching (optional)**: Redis
- **Infra (dev)**: Docker Compose

#### รันบนเครื่อง (แนะนำ: dev mode A)

##### สิ่งที่ต้องมี

- Docker Desktop
- Java 17+
- Node.js 18+

##### เริ่มรัน (infra + backend)

ที่โฟลเดอร์ root:

```bash
docker compose up -d

cd backend
chmod +x dev-up.sh dev-down.sh
./dev-up.sh
```

##### รัน frontend

```bash
cd frontend
npm install
npm run dev
```

เปิด:
- `http://localhost:3000`
- `http://localhost:3000/login` (สมัคร/ล็อกอิน)

##### เช็ค health

```bash
curl -sS http://localhost:8080/actuator/health
curl -sS http://localhost:8081/actuator/health
curl -sS http://localhost:8082/actuator/health
curl -sS http://localhost:8083/actuator/health
```

##### ปิดระบบ

```bash
cd backend
./dev-down.sh

cd ..
docker compose down
```

#### Deploy AWS

- push image ไป **ECR**
- รันบน **ECS Fargate**
- ใช้ **ALB** วางหน้า gateway
- ใช้ **RDS Postgres**
- ใช้ **MSK (Kafka)** / **Amazon MQ (RabbitMQ)** / **ElastiCache (Redis)** ตามความจำเป็น

ไฟล์ที่เกี่ยวข้อง:
- Dockerfile: `backend/*-service/Dockerfile`
- Terraform โครง: `infra/terraform/`

