package com.sanfast.backend.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final OrderService orderService;

    public KafkaConsumerService(OrderService orderService) {
        this.orderService = orderService;
    }

    @KafkaListener(topics = "order-created", groupId = "restaurant-group")
    public void consumeOrderCreatedEvent(String message) {
        try {
            Long orderId = Long.parseLong(message);
            System.out.println("\n👨‍🍳 [Kafka Consumer] หัวหน้าพ่อครัวได้รับออเดอร์หมายเลข: " + orderId + "!");

            // 1. จำลองการทำอาหาร (Cooking)
            Thread.sleep(5000); // 5 วินาที
            orderService.updateOrderStatus(orderId, "PREPARING");
            System.out.println("🥘 [Kafka Consumer] ออเดอร์ " + orderId + " เริ่มผัดลงกระทะแล้ว (PREPARING)");

            // 2. จำลองการเรียกไรเดอร์มารับ (Delivery)
            Thread.sleep(5000); // อีก 5 วินาที
            orderService.updateOrderStatus(orderId, "DELIVERED");
            System.out.println("🛵 [Kafka Consumer] ออเดอร์ " + orderId + " ไรเดอร์รับอาหารไปส่งแล้ว! (DELIVERED)\n");

        } catch (InterruptedException e) {
            System.err.println("กระบวนการทำอาหารติดขัด");
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            System.err.println("ไม่สามารถประมวลผลออเดอร์ได้: " + e.getMessage());
        }
    }
}
