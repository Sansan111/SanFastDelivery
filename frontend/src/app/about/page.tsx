import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <div style={{ padding: '50px', background: '#fff', minHeight: '80vh', borderRadius: '8px' }}>
      <Title level={1}>เกี่ยวกับเรา (About Us)</Title>
      
      <Paragraph style={{ fontSize: '16px' }}>
        ยินดีต้อนรับสู่ <b>SanFast Delivery</b>! <br/>
        เราคือระบบสั่งอาหารออนไลน์สุดล้ำ ที่ทำงานด้วย Next.js และ Spring Boot เพื่อประสบการณ์การใช้งานที่ลื่นไหลที่สุด!
      </Paragraph>
      
      <Paragraph style={{ fontSize: '16px' }}>
        ในหน้านี้คุณสามารถเขียนประวัติร้านอาหาร หรือเล่าที่มาของคุณได้ตามสบายเลยครับ
      </Paragraph>
    </div>
  );
}
