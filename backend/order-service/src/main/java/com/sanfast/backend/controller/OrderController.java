package com.sanfast.backend.controller;

import com.sanfast.backend.dto.CreateOrderRequest;
import com.sanfast.backend.entity.Order;
import com.sanfast.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping // ต้องยิงข้อมูล post มาเท่านั้น get ไม่ได้
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<java.util.Map<String, String>> getOrderStatus(@PathVariable Long id) {
        try {
            String status = orderService.getOrderStatus(id);
            return ResponseEntity.ok(java.util.Map.of("status", status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<com.sanfast.backend.dto.OrderResponse>> getOrdersByUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOngoingOrder(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        try {
            orderService.deleteOngoingOrder(id, userId);
            return ResponseEntity.ok(java.util.Map.of("deleted", true, "orderId", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("deleted", false, "error", e.getMessage()));
        }
    }
}
