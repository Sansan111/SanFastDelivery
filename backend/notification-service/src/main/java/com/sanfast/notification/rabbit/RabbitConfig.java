package com.sanfast.notification.rabbit;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public DirectExchange orderEventsExchange(@Value("${sanfast.rabbitmq.exchange:order.events}") String exchange) {
        return new DirectExchange(exchange, true, false);
    }

    @Bean
    public Queue orderCreatedQueue(@Value("${sanfast.rabbitmq.queue.order-created:notification.order-created}") String queue) {
        return new Queue(queue, true);
    }

    @Bean
    public Binding orderCreatedBinding(
            DirectExchange orderEventsExchange,
            Queue orderCreatedQueue,
            @Value("${sanfast.rabbitmq.routing-key.order-created:order.created}") String routingKey
    ) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderEventsExchange).with(routingKey);
    }

    @Bean
    public MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

