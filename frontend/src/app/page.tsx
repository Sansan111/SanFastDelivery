'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Button, Badge, Card, Row, Col, Drawer, List, message } from 'antd';
import { ShoppingCartOutlined, ShopOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Meta } = Card;

// จำลองโครงสร้างข้อมูลที่มาจาก Spring Boot Database
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Home() {
  const { items, addToCart, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartVisible, setCartVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // เอฟเฟกต์สำหรับดึงข้อมูลทันทีที่เปิดเว็บ
  useEffect(() => {
    fetch('http://localhost:8081/api/products') // ยิงไปหา Backend พอร์ต 8081
      .then(res => {
        if (!res.ok) throw new Error('Cannot connect to backend');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        message.warning('เชื่อมต่อหลังบ้านไม่ได้ (ลืมเปิด Spring Boot หรือเปล่าครับ?)');
      });
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // ฟังก์ชันกดสั่งซื้อ
  const handleCheckout = async () => {
    if (items.length === 0) return message.warning('ตะกร้าว่างเปล่า!');
    
    setSubmitting(true);
    try {
      // โครงสร้างกล่องพัสดุเดียวกับ CreateOrderRequest ฝั่ง Java
      const orderPayload = {
        userId: 1, // ระบบเรายังไม่มีหน้า Login เลยจำลองไว้ว่าเป็นลูกค้าไอดี 1 ก่อน (มีในฐานข้อมูลแล้ว)
        items: items.map(item => ({
          productId: item.productId, // ไอดีเมนู
          quantity: item.quantity    // จำนวนจาน
        }))
      };

      const res = await fetch('http://localhost:8081/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        message.success('สั่งอาหารสำเร็จ! ระบบได้ส่งข้อมูลแจ้งเตือนไรเดอร์แล้ว 🎉');
        clearCart();
        setCartVisible(false);
      } else {
        message.error('เกิดข้อผิดพลาดในการสั่งอาหาร');
      }
    } catch (error) {
      message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px #f0f1f2', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShopOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>SanFast Delivery</Title>
        </div>
        
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={[{ key: '1', label: 'หน้าแรก' }, { key: '2', label: 'ออเดอร์ของฉัน' }]}
          style={{ flex: 1, borderBottom: 'none', marginLeft: '24px' }}
        />

        <Badge count={totalItems} showZero>
          <Button type="primary" shape="round" icon={<ShoppingCartOutlined />} size="large" onClick={() => setCartVisible(true)}>
            ตะกร้าสินค้า
          </Button>
        </Badge>
      </Header>

      <Content style={{ padding: '40px 50px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Title level={2} style={{ marginBottom: '32px' }}>เมนูอร่อยแนะนำ</Title>
        
        <Row gutter={[24, 24]}>
          {loading ? (
            <Col span={24}><p style={{color: '#888'}}>กำลังโหลดเมนูอาหารจากหลังบ้าน...</p></Col>
          ) : (
            products.map(product => (
              <Col xs={24} sm={12} md={8} key={product.id}>
                {/* การ์ดแสดงรายการอาหาร */}
                <Card
                  hoverable
                  cover={<img alt={product.name} src={product.imageUrl} style={{ height: 220, objectFit: 'cover' }} />}
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => {
                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          imageUrl: product.imageUrl
                        });
                        message.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว!`);
                      }}
                    >
                      เพิ่มลงตะกร้า
                    </Button>
                  ]}
                >
                  <Meta 
                    title={<span style={{fontSize: '18px'}}>{product.name}</span>} 
                    description={
                      <>
                        <p style={{ height: '44px', overflow: 'hidden', textOverflow: 'ellipsis', color: '#888', marginTop: '8px', marginBottom: '8px' }}>
                          {product.description}
                        </p>
                        <Title level={3} style={{ color: '#1677ff', margin: 0 }}>฿{product.price}</Title>
                      </>
                    } 
                  />
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Content>

      {/* ลิ้นชัก (Drawer) เลื่อนมาจากขวาเวลาตะกร้าสินค้าถูกกด */}
      <Drawer
        title={<div style={{fontSize: '20px'}}>🛒 ตะกร้าสินค้าของคุณ</div>}
        placement="right"
        onClose={() => setCartVisible(false)}
        open={cartVisible}
        size="default"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>รวมทั้งสิ้น: ฿{getTotalPrice()}</Title>
            <Button type="primary" size="large" onClick={handleCheckout} loading={submitting}>
              ยืนยันชำระเงิน
            </Button>
          </div>
        }
      >
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
            <ShoppingCartOutlined style={{ fontSize: '64px', marginBottom: '16px', color: '#ddd' }} />
            <p style={{fontSize: '16px'}}>ตะกร้ายืดเยื้อยังว่างเปล่า <br/> ลองเลือกเมนูอร่อยๆ ดูสิครับ!</p>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeFromCart(item.productId)} />
                ]}
              >
                <List.Item.Meta
                  avatar={<img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
                  title={<span style={{fontSize: '16px'}}>{item.name}</span>}
                  description={`ราคา: ฿${item.price} x ${item.quantity} จาน`}
                />
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>฿{item.price * item.quantity}</div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      <Footer style={{ textAlign: 'center', background: '#fafafa', marginTop: '40px' }}>
        SanFast Delivery ©{new Date().getFullYear()} by Next.js & Spring Boot
      </Footer>
    </Layout>
  );
}
