package com.sanfast.notification.events;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderCreatedEvent(
        Long orderId,
        Long userId,
        BigDecimal totalAmount,
        String status,
        Instant createdAt
) {
}

