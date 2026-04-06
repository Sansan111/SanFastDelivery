package com.sanfast.backend.controller;

import com.sanfast.backend.dto.CreateOrderRequest;
import com.sanfast.backend.entity.Order;
import com.sanfast.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // อนุญาตให้ Frontend (Next.js) ยิงเข้าได้
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
}
