'use client';

import './page.css';
import { useEffect, useState } from 'react';
import { Badge, Button, Drawer, List, message, Modal, Steps } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, StarFilled } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';

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
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8081/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Cannot connect to backend');
        return res.json();
      })
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    if (!trackingOrderId || orderStatus === 'DELIVERED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/orders/${trackingOrderId}/status`);
        if (res.ok) { const data = await res.json(); setOrderStatus(data.status); }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [trackingOrderId, orderStatus]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return message.warning('กรุณาเลือกเมนูก่อนนะครับ');
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8081/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) })
      });
      if (res.ok) {
        const savedOrder = await res.json();
        clearCart(); setCartVisible(false);
        setTrackingOrderId(savedOrder.id); setOrderStatus(savedOrder.status);
        message.success('สั่งอาหารสำเร็จแล้ว! ครัวได้รับออเดอร์แล้วครับ 🎉');
      } else { message.error('เกิดข้อผิดพลาด กรุณาลองอีกครั้งครับ'); }
    } catch { message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-wrapper">
      {/* ─── NAVBAR ─── */}
      <header className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">☕</span>
          <span className="brand-name">SanFast<br /><em>Delivery</em></span>
        </div>
        <nav className="navbar-links">
          <a href="#">หน้าแรก</a>
          <a href="#menu">เมนูอาหาร</a>
          <a href="#">เกี่ยวกับเรา</a>
        </nav>
        <Badge count={totalItems} color="#C8973B">
          <button className="cart-btn" onClick={() => setCartVisible(true)}>
            <ShoppingCartOutlined style={{ fontSize: 18 }} />
            ตะกร้า
          </button>
        </Badge>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🏆 ร้านอาหารยอดนิยม</span>
          <h1 className="hero-title">
            อร่อยสด<br />
            <span className="hero-title-accent">ส่งถึงบ้าน</span>
          </h1>
          <p className="hero-subtitle">
            รสชาติต้นตำรับ จัดส่งไวทันใจ<br />
            ออเดอร์ง่ายๆ ไม่กี่ขั้นตอน
          </p>
          <a href="#menu" className="hero-cta">สั่งอาหารเลย</a>
        </div>
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="อาหารอร่อย"
            className="hero-image"
          />
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="stats-strip">
        <div className="stat-item">
          <span className="stat-num">500+</span>
          <span className="stat-label">ออเดอร์ต่อวัน</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">4.9</span>
          <span className="stat-label">คะแนนรีวิว
            {[...Array(5)].map((_, i) => <StarFilled key={i} style={{ color: '#C8973B', fontSize: 12, marginLeft: 2 }} />)}
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">15 นาที</span>
          <span className="stat-label">เวลาจัดส่งเฉลี่ย</span>
        </div>
      </section>

      {/* ─── MENU SECTION ─── */}
      <section className="menu-section" id="menu">
        <div className="section-header">
          <p className="section-eyebrow">— เมนูแนะนำ —</p>
          <h2 className="section-title">เลือกเมนูที่คุณชื่นชอบ</h2>
          <p className="section-subtitle">ทำสดทุกจาน ส่วนผสมคัดสรรพิเศษ</p>
        </div>

        {loading ? (
          <div className="loading-state">กำลังโหลดเมนูจากครัว...</div>
        ) : (
          <div className="menu-grid">
            {products.map(product => (
              <div key={product.id} className="menu-card">
                <div className="menu-card-img-wrap">
                  <img src={product.imageUrl} alt={product.name} className="menu-card-img" />
                  <div className="menu-card-img-overlay" />
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title">{product.name}</h3>
                  <p className="menu-card-desc">{product.description}</p>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">฿{product.price}</span>
                    <button
                      className="add-btn"
                      onClick={() => {
                        addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
                        message.success({ content: `เพิ่ม ${product.name} ลงตะกร้าแล้ว! 🍽️`, style: { marginTop: '80px' } });
                      }}
                    >
                      + เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── ABOUT STRIP ─── */}
      <section className="about-strip">
        <div className="about-img-col">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80"
            alt="บรรยากาศร้าน"
            className="about-img"
          />
        </div>
        <div className="about-text-col">
          <p className="section-eyebrow">— เกี่ยวกับเรา —</p>
          <h2>ความอร่อยที่<br />ไม่ต้องเดินทาง</h2>
          <p>เราคัดสรรเฉพาะวัตถุดิบสดใหม่ ปรุงด้วยสูตรพิเศษที่ผ่านการศึกษามาอย่างดี ส่งตรงถึงหน้าบ้านคุณในเวลาที่รวดเร็ว</p>
          <div className="about-stars">
            {[...Array(5)].map((_, i) => <StarFilled key={i} style={{ color: '#C8973B', fontSize: 20 }} />)}
            <span> 4.9/5 จาก 2,300+ รีวิว</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-brand">
          <span>☕</span> SanFast Delivery
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} SanFast Delivery. สร้างด้วย Next.js & Spring Boot</p>
      </footer>

      {/* ─── CART DRAWER ─── */}
      <Drawer
        title={<span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#3D1A00' }}>🛒 ตะกร้าของคุณ</span>}
        placement="right"
        onClose={() => setCartVisible(false)}
        open={cartVisible}
        size="default"
        styles={{ body: { background: '#FAF7F0' }, header: { background: '#FAF7F0', borderBottom: '1px solid #E0D5C5' } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', background: '#FAF7F0' }}>
            <div>
              <div style={{ fontSize: 12, color: '#9B7B6C', fontFamily: 'Lato, sans-serif' }}>ยอดรวม</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>฿{getTotalPrice()}</div>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              {submitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันชำระเงิน'}
            </button>
          </div>
        }
      >
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 120, color: '#9B7B6C' }}>
            <ShoppingCartOutlined style={{ fontSize: 64, color: '#D5C9B8', marginBottom: 16 }} />
            <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 16 }}>ตะกร้าว่างอยู่ครับ<br />ลองเลือกเมนูอร่อยๆ ดูนะครับ!</p>
          </div>
        ) : (
          <List
            dataSource={items}
            renderItem={item => (
              <List.Item
                style={{ borderBottom: '1px solid #E0D5C5', padding: '16px 0' }}
                actions={[<Button key="del" danger type="text" icon={<DeleteOutlined />} onClick={() => removeFromCart(item.productId)} />]}
              >
                <List.Item.Meta
                  avatar={<img src={item.imageUrl} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: '2px solid #E0D5C5' }} />}
                  title={<span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>{item.name}</span>}
                  description={<span style={{ color: '#9B7B6C' }}>฿{item.price} × {item.quantity} จาน</span>}
                />
                <div style={{ fontWeight: 700, color: '#C8973B', fontSize: 16 }}>฿{item.price * item.quantity}</div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* ─── TRACKING MODAL ─── */}
      <Modal
        open={!!trackingOrderId}
        closable={false}
        footer={[<button key="close" className="add-btn" style={{ marginTop: 16 }} onClick={() => setTrackingOrderId(null)}>ซ่อนหน้าต่างนี้</button>]}
        styles={{ content: { background: '#FAF7F0', borderRadius: 24 }, header: { background: '#FAF7F0' } }}
        title={<span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#3D1A00' }}>🔔 ติดตามออเดอร์ #{trackingOrderId}</span>}
      >
        <div style={{ padding: '24px 0' }}>
          <Steps
            direction="vertical"
            current={orderStatus === 'PENDING' ? 0 : orderStatus === 'PREPARING' ? 1 : 2}
            items={[
              { title: <span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>รับออเดอร์เรียบร้อย</span>, description: <span style={{ color: '#9B7B6C' }}>ออเดอร์ส่งเข้าสู่ระบบแล้ว รอการยืนยันจากครัว</span> },
              { title: <span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>กำลังเตรียมอาหาร 🍳</span>, description: <span style={{ color: '#9B7B6C' }}>เชฟกำลังปรุงอาหารด้วยความตั้งใจ</span> },
              { title: <span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>จัดส่งสำเร็จ! 🛵</span>, description: <span style={{ color: '#9B7B6C' }}>ไรเดอร์ส่งอาหารถึงมือคุณแล้วครับ!</span> },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
