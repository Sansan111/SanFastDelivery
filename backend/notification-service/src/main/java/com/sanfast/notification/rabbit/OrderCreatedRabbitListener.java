package com.sanfast.notification.rabbit;

import com.sanfast.notification.events.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedRabbitListener {

    private static final Logger log = LoggerFactory.getLogger(OrderCreatedRabbitListener.class);

    @RabbitListener(queues = "${sanfast.rabbitmq.queue.order-created:notification.order-created}")
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("[notification][rabbitmq] order.created received: orderId={}, userId={}, total={}, status={}",
                event.orderId(), event.userId(), event.totalAmount(), event.status());
    }
}

