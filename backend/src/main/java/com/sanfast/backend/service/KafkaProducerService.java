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
        // ส่งแค่ Order ID เพื่อให้ Consumer ดึงข้อมูลต่อได้
        String message = orderId.toString();
        
        // ส่ง (Publish) เข้าไปที่ Topic ชื่อ 'order-created'
        kafkaTemplate.send("order-created", message);
        
        System.out.println("📣 Published to Kafka topic 'order-created': " + message);
    }
}
