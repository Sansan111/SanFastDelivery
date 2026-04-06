package com.sanfast.backend.service;

import com.sanfast.backend.dto.CreateOrderRequest;
import com.sanfast.backend.entity.Order;
import com.sanfast.backend.entity.OrderItem;
import com.sanfast.backend.entity.Product;
import com.sanfast.backend.entity.User;
import com.sanfast.backend.repository.OrderRepository;
import com.sanfast.backend.repository.ProductRepository;
import com.sanfast.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.sanfast.backend.dto.OrderResponse;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final KafkaProducerService kafkaProducerService;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository, KafkaProducerService kafkaProducerService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. หา User
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        // 2. สร้าง Order ใหม่
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. วนลูปจับคู่ Product และคำนวณราคารวม
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItem.setNote(itemReq.getNote());
            
            order.addItem(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);

        // 4. บันทึกลง Database
        Order savedOrder = orderRepository.save(order);

        // 5. ส่ง Event "Order Created" เข้าหา Kafka Topic เพื่อให้ระบบอื่นรู้
        kafkaProducerService.sendOrderCreatedEvent(savedOrder.getId());

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public String getOrderStatus(Long orderId) {
        return orderRepository.findById(orderId)
                .map(Order::getStatus)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderResponse.OrderItemResponse itemRes = new OrderResponse.OrderItemResponse();
            itemRes.setId(item.getId());
            itemRes.setProductId(item.getProduct().getId());
            itemRes.setProductName(item.getProduct().getName());
            itemRes.setProductImageUrl(item.getProduct().getImageUrl());
            itemRes.setQuantity(item.getQuantity());
            itemRes.setPriceAtPurchase(item.getPriceAtPurchase());
            itemRes.setNote(item.getNote());
            return itemRes;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}
