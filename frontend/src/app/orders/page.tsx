'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Steps, Button } from 'antd';
import { ShoppingOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './page.css';
import '../page.css';

function OrdersContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderStatus, setOrderStatus] = useState<string>('PENDING');

  useEffect(() => {
    if (!orderId || orderStatus === 'DELIVERED') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/orders/${orderId}/status`);
        if (res.ok) {
          const data = await res.json();
          setOrderStatus(data.status);
        }
      } catch { }
    }, 2000);
    return () => clearInterval(interval);
  }, [orderId, orderStatus]);

  if (!orderId) {
    return (
      <div className="orders-wrapper">
        <div className="orders-container">
          <h2>ไม่พบข้อมูลออเดอร์</h2>
        </div>
      </div>
    );
  }

  const currentStep = orderStatus === 'PENDING' ? 0 : orderStatus === 'PREPARING' ? 1 : 2;

  return (
    <div className="orders-wrapper">
      <div className="orders-container">
        <h2>ติดตามออเดอร์ #{orderId}</h2>
        <div className="orders-steps">
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
        </div>
        <div className="orders-action">
          <Button type="primary" size="large" href="/" style={{ background: '#C8973B', borderColor: '#C8973B' }}>
            กลับสู่หน้าหลัก
          </Button>
        </div>
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
