package com.sanfast.backend.service;

import com.sanfast.backend.dto.CreateOrderRequest;
import com.sanfast.backend.entity.Order;
import com.sanfast.backend.entity.OrderItem;
import com.sanfast.backend.entity.User;
import com.sanfast.backend.repository.OrderRepository;
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

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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

        // 3. วนลูปสร้าง Item (ในลำดับถัดไปควรจะดึงข้อมูลสินค้าจาก Restaurant Service)
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(itemReq.getProductId());
            orderItem.setQuantity(itemReq.getQuantity());
            
            // หมายเหตุ: ในระบบจริงควรดึงราคาและชื่อจาก Restaurant Service ผ่าน REST/gRPC
            // เพื่อความรวดเร็วในการ Demo เราจะใช้ราคาจำลองไปก่อน 
            BigDecimal mockPrice = new BigDecimal("100.00"); 
            orderItem.setPriceAtPurchase(mockPrice);
            orderItem.setProductName("Product #" + itemReq.getProductId());
            orderItem.setNote(itemReq.getNote());
            
            order.addItem(orderItem);

            BigDecimal itemTotal = mockPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
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
            itemRes.setProductId(item.getProductId());
            itemRes.setProductName(item.getProductName());
            itemRes.setProductImageUrl(item.getProductImageUrl());
            itemRes.setQuantity(item.getQuantity());
            itemRes.setPriceAtPurchase(item.getPriceAtPurchase());
            itemRes.setNote(item.getNote());
            return itemRes;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}
