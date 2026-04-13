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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(255),
    tags VARCHAR(255),
    calories INT
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

INSERT INTO products (name, description, price, image_url, category, tags, calories) VALUES 
('ข้าวมันไก่ต้ม', 'ข้าวมันไก่ต้มสูตรพิเศษ น้ำจิ้มรสเด็ด', 50.00, 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400', 'อาหารจานเดียว', 'อาหารจานเดียว', 400),
('ข้าวหมูแดง', 'ข้าวหมูแดงหมูกรอบ ไข่ต้มครึ่งซีก', 60.00, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', 'อาหารจานเดียว', 'อาหารจานเดียว', 450),
('กะเพราหมูสับไข่ดาว', 'กะเพราหมูสับแบบไม่ใส่ถั่วฝักยาว', 70.00, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', 'อาหารจานเดียว', 'อาหารจานเดียว', 500),
('ส้มตำไทย', 'ส้มตำรสเด็ด เปรี้ยว หวาน เค็ม เผ็ด ครบรส', 45.00, 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400', 'อาหารเเซ่บๆ', 'อาหารเเซ่บๆ', 120),
('ลาบหมู', 'ลาบหมูรสจัดจ้าน สมุนไพรสดใหม่', 65.00, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', 'อาหารเเซ่บๆ', 'อาหารเเซ่บๆ', 180),
('น้ำแข็งไส', 'น้ำแข็งไสราดน้ำหวาน ท็อปปิ้งหลากชนิด', 35.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'ของหวานเย็นๆ', 'ของหวานเย็นๆ', 200),
('ไอศกรีมกะทิ', 'ไอศกรีมกะทิโบราณ หอมมัน', 40.00, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', 'ของหวานเย็นๆ', 'ของหวานเย็นๆ', 250),
('สลัดอกไก่', 'สลัดอกไก่ย่าง ผักสด น้ำสลัดซีซาร์', 85.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'อาหารแคลต่ำ', 'อาหารแคลต่ำ', 250),
('ข้าวกล้องอกไก่', 'ข้าวกล้องอกไก่นึ่ง ผักลวก', 75.00, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 'อาหารแคลต่ำ', 'อาหารแคลต่ำ', 300),
('ปลาทอดน้ำปลา', 'ปลากะพงทอดกรอบ ราดน้ำปลาหวาน', 120.00, 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400', 'อาหารทะเล', 'อาหารทะเล', 350),
('กุ้งอบวุ้นเส้น', 'กุ้งสดอบวุ้นเส้น หอมเครื่องเทศ', 150.00, 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400', 'อาหารทะเล', 'อาหารทะเล', 280),
('ชาไทย', 'ชาไทยเย็นหวานมัน', 35.00, 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', 'เครื่องดื่ม', 'เครื่องดื่ม', 150),
('กาแฟโบราณ', 'กาแฟโบราณเย็น หอมกลมกล่อม', 40.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'เครื่องดื่ม', 'เครื่องดื่ม', 120),
('ก๋วยเตี๋ยวต้มยำ', 'ก๋วยเตี๋ยวต้มยำน้ำข้น รสเด็ด', 55.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 'ก๋วยเตี๋ยว', 'ก๋วยเตี๋ยว', 380),
('ก๋วยเตี๋ยวเรือ', 'ก๋วยเตี๋ยวเรือน้ำตก เข้มข้น', 50.00, 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', 'ก๋วยเตี๋ยว', 'ก๋วยเตี๋ยว', 350),
('สเต็กเนื้อวากิว', 'เนื้อวากิว A5 ย่างระดับมีเดียมแรร์', 450.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 'อาหารระดับพรีเมียม', 'อาหารระดับพรีเมียม', 500),
('ข้าวผัดปูจานยักษ์', 'ข้าวผัดเนื้อปูจัดเต็ม ไข่ปู', 250.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', 'อาหารระดับพรีเมียม', 'อาหารระดับพรีเมียม', 450);
