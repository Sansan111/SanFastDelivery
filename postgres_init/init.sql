CREATE TABLE users ( 
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- ชื่อลูกค้า

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- สินค้าที่ขาย

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- ตารางใบเสร็จรับเงิน

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    note VARCHAR(1000)
); -- รายละเอียดใบเสร็จรับเงิน

-- Mock Data for Testing
INSERT INTO users (username, email) VALUES 
('customer_1', 'customer1@example.com'),
('customer_2', 'customer2@example.com');

INSERT INTO products (name, description, price, image_url) VALUES 
('ข้าวมันไก่ต้ม', 'ข้าวมันไก่ต้มสูตรพิเศษ น้ำจิ้มรสเด็ด', 50.00, 'https://source.unsplash.com/featured/?matcha,cafe'),
('ข้าวหมูแดง', 'ข้าวหมูแดงหมูกรอบ ไข่ต้มครึ่งซีก', 60.00, 'https://source.unsplash.com/featured/?matcha,cafe'),
('กะเพราหมูสับไข่ดาว', 'กะเพราหมูสับแบบไม่ใส่ถั่วฝักยาว', 70.00, 'https://source.unsplash.com/featured/?matcha,cafe');
