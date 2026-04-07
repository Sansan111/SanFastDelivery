package com.sanfast.backend.service;

import com.sanfast.backend.dto.CreateOrderRequest;
import com.sanfast.backend.entity.Order;
import com.sanfast.backend.entity.OrderItem;
import com.sanfast.backend.entity.User;
import com.sanfast.backend.repository.OrderRepository;
import com.sanfast.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.sanfast.backend.dto.OrderResponse;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private static final Set<String> DELETABLE_STATUSES = Set.of("PENDING", "PREPARING");
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${restaurant.service.base-url:http://localhost:8081}")
    private String restaurantServiceBaseUrl;

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
            
            ProductSnapshot product = fetchProductSnapshot(itemReq.getProductId()).orElse(null);

            BigDecimal price = product != null && product.price != null
                    ? product.price
                    : new BigDecimal("100.00");

            orderItem.setPriceAtPurchase(price);
            orderItem.setProductName(product != null && product.name != null ? product.name : ("Product #" + itemReq.getProductId()));
            orderItem.setProductImageUrl(product != null ? product.imageUrl : null);
            orderItem.setNote(itemReq.getNote());
            
            order.addItem(orderItem);

            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
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

    @Transactional
    public void deleteOngoingOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (userId != null && (order.getUser() == null || !order.getUser().getId().equals(userId))) {
            throw new RuntimeException("Order does not belong to user");
        }

        if (!DELETABLE_STATUSES.contains(order.getStatus())) {
            throw new RuntimeException("Only ongoing orders can be deleted");
        }

        orderRepository.delete(order);
    }

    @SuppressWarnings("rawtypes")
    private Optional<ProductSnapshot> fetchProductSnapshot(Long productId) {
        if (productId == null) return Optional.empty();
        try {
            String url = restaurantServiceBaseUrl + "/api/products/" + productId;
            ResponseEntity<Map> res = restTemplate.getForEntity(url, Map.class);
            Map<?, ?> body = res.getBody();
            if (body == null) return Optional.empty();

            String name = Objects.toString(body.get("name"), null);
            String imageUrl = Objects.toString(body.get("imageUrl"), null);
            BigDecimal price = null;
            Object priceObj = body.get("price");
            if (priceObj != null) {
                price = new BigDecimal(priceObj.toString());
            }
            return Optional.of(new ProductSnapshot(name, imageUrl, price));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private static final class ProductSnapshot {
        private final String name;
        private final String imageUrl;
        private final BigDecimal price;

        private ProductSnapshot(String name, String imageUrl, BigDecimal price) {
            this.name = name;
            this.imageUrl = imageUrl;
            this.price = price;
        }
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
