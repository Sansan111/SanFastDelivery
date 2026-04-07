'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, Steps, Button, List, Badge, message } from 'antd';
import { ShoppingOutlined, FireOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCartStore } from '@/store/useCartStore';
import { apiFetch } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import './page.css';
import '../page.css';

interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  priceAtPurchase: number;
  note: string;
}

interface OrderResponse {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const { addToCart } = useCartStore();

  const fetchOrders = async () => {
    try {
      if (!isLoggedIn()) {
        setOrders([]);
        return;
      }
      const res = await apiFetch('/api/orders/me');
      if (res.ok) {
        const data = await res.json();
        // เรียงจากใหม่ไปเก่า (สมมติว่า id เรียงตามเวลา)
        data.sort((a: OrderResponse, b: OrderResponse) => b.id - a.id);
        setOrders(data);
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      // ดึงข้อมูลใหม่ทุกๆ 3 วินาที เพื่ออัปเดตสถานะอัตโนมัติ
      fetchOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ongoingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING');
  const historyOrders = orders.filter(o => o.status === 'DELIVERED');

  const handleDeleteOngoing = async (orderId: number) => {
    const ok = window.confirm('ต้องการยกเลิก/ลบออเดอร์นี้ใช่ไหม?');
    if (!ok) return;
    try {
      const res = await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        message.error(data?.error || 'ลบออเดอร์ไม่สำเร็จ');
        return;
      }
      message.success('ยกเลิกออเดอร์เรียบร้อยแล้ว');
      fetchOrders();
    } catch {
      message.error('ลบออเดอร์ไม่สำเร็จ');
    }
  };

  const handleReorder = (order: OrderResponse) => {
    order.items.forEach(item => {
      addToCart({
        productId: item.productId,
        name: item.productName,
        price: item.priceAtPurchase,
        quantity: item.quantity,
        imageUrl: item.productImageUrl,
        note: item.note
      });
    });
    message.success('เพิ่มรายการลงตะกร้าแล้ว! ไปที่ตะกร้าเพื่อชำระเงินได้เลยครับ');
    router.push('/');
  };

  const renderSteps = (status: string) => {
    const currentStep = status === 'PENDING' ? 0 : status === 'PREPARING' ? 1 : 2;
    return (
      <Steps
        direction="vertical"
        current={currentStep}
        items={[
          {
            title: <span>รับออเดอร์เรียบร้อย</span>,
            description: <span>ออเดอร์ส่งเข้าสู่ระบบแล้ว รอการยืนยันจากครัว</span>,
            icon: <ShoppingOutlined />,
          },
          {
            title: <span>กำลังเตรียมอาหาร</span>,
            description: <span>เชฟกำลังปรุงอาหารด้วยความตั้งใจ พร้อมเสิร์ฟความอร่อย</span>,
            icon: <FireOutlined />,
          },
          {
            title: <span>จัดส่งสำเร็จ!</span>,
            description: <span>ไรเดอร์จัดส่งอาหารถึงมือคุณแล้ว ขอให้อร่อยกับมื้อนี้นะครับ</span>,
            icon: <CheckCircleOutlined />,
          },
        ]}
      />
    );
  };

  const renderOrderCard = (order: OrderResponse, isHistory: boolean) => (
    <div key={order.id} className="order-card">
      <div className="order-card-header">
        <h3>ออเดอร์ #{order.id}</h3>
        <span className="order-date">{new Date(order.createdAt).toLocaleString('th-TH')}</span>
      </div>
      
      {!isHistory && (
        <div className="orders-steps" style={{ marginTop: 20, marginBottom: 20 }}>
          {renderSteps(order.status)}
        </div>
      )}

      <div className="order-items">
        <List
          dataSource={order.items}
          renderItem={item => (
            <List.Item style={{ borderBottom: '1px solid #E0D5C5', padding: '12px 0' }}>
              <List.Item.Meta
                avatar={
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                    alt={item.productName}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                  />
                }
                title={<span style={{ fontFamily: 'Playfair Display, serif', color: '#3D1A00' }}>{item.productName}</span>}
                description={
                  <div style={{ color: '#9B7B6C', fontSize: 12 }}>
                    <p style={{ margin: 0 }}>฿{item.priceAtPurchase} × {item.quantity} จาน</p>
                    {item.note && <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: '#C8973B' }}>Note: {item.note}</p>}
                  </div>
                }
              />
              <div style={{ fontWeight: 700, color: '#C8973B' }}>฿{item.priceAtPurchase * item.quantity}</div>
            </List.Item>
          )}
        />
      </div>

      <div className="order-card-footer">
        <div className="order-total">
          ยอดรวม: <span>฿{order.totalAmount}</span>
        </div>
        {!isHistory && (
          <Button
            danger
            onClick={() => handleDeleteOngoing(order.id)}
            style={{ fontFamily: 'Lato' }}
          >
            ยกเลิกออเดอร์
          </Button>
        )}
        {isHistory && (
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => handleReorder(order)}
            style={{ background: '#C8973B', borderColor: '#C8973B', fontFamily: 'Lato' }}
          >
            สั่งอีกครั้ง
          </Button>
        )}
      </div>
    </div>
  );

  const tabItems = [
    {
      key: '1',
      label: <span style={{ fontFamily: 'Playfair Display', fontSize: 16 }}>กำลังดำเนินการ <Badge count={ongoingOrders.length} style={{ backgroundColor: '#C8973B' }}/></span>,
      children: ongoingOrders.length > 0 
        ? ongoingOrders.map(o => renderOrderCard(o, false))
        : <div className="empty-state">ไม่มีออเดอร์ที่กำลังดำเนินการครับ</div>
    },
    {
      key: '2',
      label: <span style={{ fontFamily: 'Playfair Display', fontSize: 16 }}>ประวัติการสั่งซื้อ</span>,
      children: historyOrders.length > 0
        ? historyOrders.map(o => renderOrderCard(o, true))
        : <div className="empty-state">ยังไม่มีประวัติการสั่งซื้อครับ</div>
    }
  ];

  return (
    <div className="orders-wrapper">
      <div className="orders-container">
        <h2>ออเดอร์ของฉัน</h2>
        {loading ? (
          <div className="empty-state">กำลังโหลดข้อมูล...</div>
        ) : (
          !isLoggedIn() ? (
            <div className="empty-state">กรุณา Login เพื่อดูออเดอร์ของคุณ</div>
          ) : (
          <Tabs defaultActiveKey="1" items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
          )
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 100 }}>กำลังโหลด...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
