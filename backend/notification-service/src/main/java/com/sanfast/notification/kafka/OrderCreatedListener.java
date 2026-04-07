package com.sanfast.notification.kafka;

import com.sanfast.notification.events.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(OrderCreatedListener.class);

    @KafkaListener(topics = "${sanfast.kafka.topic.order-created:order.created}", groupId = "${spring.kafka.consumer.group-id:notification-group}")
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("[notification] order.created received: orderId={}, userId={}, total={}, status={}",
                event.orderId(), event.userId(), event.totalAmount(), event.status());
    }
}

