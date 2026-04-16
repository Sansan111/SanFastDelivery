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

#### Deploy to AWS (EC2 + Docker Compose)

All services run on a single **EC2 instance** using **Docker Compose**, provisioned by **Terraform**.

##### Architecture

```
Internet
  │
  ├── :80  → Next.js (frontend)
  └── :8080 → Spring Cloud Gateway → restaurant / order / notification services
                                       │
                          ┌─────────────┼─────────────┐
                       Postgres      Kafka       RabbitMQ
```

##### Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform CLI installed
- SSH key pair at `~/.ssh/sanfast-key` (or generate one)

##### Quick deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Provision AWS resources via Terraform (VPC, EC2 `t3.micro`, Security Group, Elastic IP)
2. Upload source code to EC2 via `rsync`
3. Build and start all services with `docker-compose.prod.yml` on EC2

##### Manual deploy (step by step)

```bash
cd infra/terraform
terraform init
terraform apply -var="ssh_public_key=$(cat ~/.ssh/sanfast-key.pub)"

# After EC2 is ready:
export SERVER_IP=$(terraform output -raw public_ip)
rsync -avz --exclude '.git' --exclude 'node_modules' --exclude '.terraform' \
  ../../ ec2-user@$SERVER_IP:~/app/

ssh ec2-user@$SERVER_IP "cd ~/app && PUBLIC_IP=$SERVER_IP docker compose -f docker-compose.prod.yml up -d --build"
```

##### Shut down (stop AWS charges)

```bash
cd infra/terraform
terraform destroy -var="ssh_public_key=$(cat ~/.ssh/sanfast-key.pub)"
```

##### Key files

| File | Purpose |
|------|---------|
| `deploy.sh` | One-command automated deploy script |
| `docker-compose.prod.yml` | Production Docker Compose (all services) |
| `frontend/Dockerfile` | Next.js standalone production build |
| `backend/*-service/Dockerfile` | Spring Boot service builds |
| `infra/terraform/main.tf` | Terraform: VPC, EC2, Security Group, EIP |
| `infra/terraform/variables.tf` | Configurable variables (region, instance type, etc.) |
| `infra/terraform/user-data.sh` | EC2 bootstrap: Docker, swap, env vars |

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

#### Deploy AWS (EC2 + Docker Compose)

ทุก service รันบน **EC2 instance** เครื่องเดียว ผ่าน **Docker Compose** โดยใช้ **Terraform** สร้าง infrastructure

##### สถาปัตยกรรม

```
Internet
  │
  ├── :80  → Next.js (frontend)
  └── :8080 → Spring Cloud Gateway → restaurant / order / notification services
                                       │
                          ┌─────────────┼─────────────┐
                       Postgres      Kafka       RabbitMQ
```

##### สิ่งที่ต้องมี

- AWS CLI ตั้งค่าแล้ว (`aws configure`)
- Terraform CLI
- SSH key pair ที่ `~/.ssh/sanfast-key` (หรือสร้างใหม่)

##### Deploy แบบเร็ว

```bash
chmod +x deploy.sh
./deploy.sh
```

สคริปต์จะทำให้อัตโนมัติ:
1. สร้าง AWS resources ผ่าน Terraform (VPC, EC2 `t3.micro`, Security Group, Elastic IP)
2. อัพโหลดโค้ดไป EC2 ด้วย `rsync`
3. Build และ start ทุก service ด้วย `docker-compose.prod.yml` บน EC2

##### Deploy แบบ manual (ทีละขั้น)

```bash
cd infra/terraform
terraform init
terraform apply -var="ssh_public_key=$(cat ~/.ssh/sanfast-key.pub)"

# หลัง EC2 พร้อมแล้ว:
export SERVER_IP=$(terraform output -raw public_ip)
rsync -avz --exclude '.git' --exclude 'node_modules' --exclude '.terraform' \
  ../../ ec2-user@$SERVER_IP:~/app/

ssh ec2-user@$SERVER_IP "cd ~/app && PUBLIC_IP=$SERVER_IP docker compose -f docker-compose.prod.yml up -d --build"
```

##### ปิดระบบ (หยุดค่าใช้จ่าย AWS)

```bash
cd infra/terraform
terraform destroy -var="ssh_public_key=$(cat ~/.ssh/sanfast-key.pub)"
```

##### ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|------|---------|
| `deploy.sh` | สคริปต์ deploy อัตโนมัติ |
| `docker-compose.prod.yml` | Docker Compose สำหรับ production (ทุก service) |
| `frontend/Dockerfile` | Next.js standalone production build |
| `backend/*-service/Dockerfile` | Build Spring Boot services |
| `infra/terraform/main.tf` | Terraform: VPC, EC2, Security Group, EIP |
| `infra/terraform/variables.tf` | ตัวแปรที่ปรับได้ (region, instance type ฯลฯ) |
| `infra/terraform/user-data.sh` | EC2 bootstrap: ติดตั้ง Docker, swap, env vars |

