package com.sanfast.backend.events;

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

