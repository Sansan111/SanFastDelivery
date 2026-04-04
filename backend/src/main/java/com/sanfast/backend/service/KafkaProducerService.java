package com.sanfast.backend.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOrderCreatedEvent(Long orderId) {
        // สร้างข้อความจำลองง่ายๆ เพื่อส่งว่าออเดอร์นี้เสร็จแล้ว
        String message = "Order Created: " + orderId;
        
        // ส่ง (Publish) เข้าไปที่ Topic ชื่อ 'order-created'
        kafkaTemplate.send("order-created", message);
        
        System.out.println("📣 Published to Kafka topic 'order-created': " + message);
    }
}
