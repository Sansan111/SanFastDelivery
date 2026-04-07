package com.sanfast.backend.service;

import com.sanfast.backend.entity.Order;
import com.sanfast.backend.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderStatusAutoProgressor {

    private final OrderRepository orderRepository;

    public OrderStatusAutoProgressor(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Dev/demo behavior:
     * - PENDING (older than ~4s)    -> PREPARING
     * - PREPARING (older than ~8s)  -> DELIVERED
     *
     * The frontend already polls orders every 3s, so status will appear to change automatically.
     */
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void progressStatuses() {
        List<Order> all = orderRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Order order : all) {
            if (order.getCreatedAt() == null) continue;
            long ageSeconds = java.time.Duration.between(order.getCreatedAt(), now).toSeconds();

            if ("PENDING".equals(order.getStatus()) && ageSeconds >= 4) {
                order.setStatus("PREPARING");
            } else if ("PREPARING".equals(order.getStatus()) && ageSeconds >= 8) {
                order.setStatus("DELIVERED");
            }
        }
    }
}

