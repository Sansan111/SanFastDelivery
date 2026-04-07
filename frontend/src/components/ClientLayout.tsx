'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge, Drawer, List, Button, message } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { items, removeFromCart, getTotalPrice, clearCart } = useCartStore();
  const [cartVisible, setCartVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return message.warning('กรุณาเลือกเมนูก่อนนะครับ');
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            note: i.note
          }))
        })
      });
      if (res.ok) {
        const savedOrder = await res.json();
        clearCart();
        setCartVisible(false);
        message.success('สั่งอาหารสำเร็จแล้ว! ครัวได้รับออเดอร์แล้วครับ 🎉');
        router.push(`/orders?orderId=${savedOrder.id}`);
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
          <Link href="/" style={{ color: pathname === '/' ? '#C8973B' : undefined }}>หน้าแรก</Link>
          <Link href="/#menu">เมนูอาหาร</Link>
          <Link href="/orders" style={{ color: pathname === '/orders' ? '#C8973B' : undefined }}>ออเดอร์ของฉัน</Link>
        </nav>
        <Badge count={totalItems} color="#C8973B">
          <button className="cart-btn" onClick={() => setCartVisible(true)}>
            <ShoppingCartOutlined style={{ fontSize: 18 }} />
            ตะกร้า
          </button>
        </Badge>
      </header>

      {children}

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
                actions={[<Button key="del" danger type="text" icon={<DeleteOutlined />} onClick={() => removeFromCart(item.cartItemId)} />]}
              >
                <List.Item.Meta
                  avatar={<img src={item.imageUrl} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: '2px solid #E0D5C5' }} />}
                  title={<span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>{item.name}</span>}
                  description={
                    <div style={{ color: '#9B7B6C' }}>
                      <p style={{ margin: 0 }}>฿{item.price} × {item.quantity} จาน</p>
                      {item.note && <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: '#C8973B', fontSize: 12 }}>Note: {item.note}</p>}
                    </div>
                  }
                />
                <div style={{ fontWeight: 700, color: '#C8973B', fontSize: 16 }}>฿{item.price * item.quantity}</div>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
}
