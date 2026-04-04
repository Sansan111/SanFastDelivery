package com.sanfast.backend.controller;

import com.sanfast.backend.entity.Product;
import com.sanfast.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // อนุญาตให้ Frontend ยิงข้อมูลเข้าได้
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllActiveProducts() {
        // ดึงมาจาก Database เฉพาะสินค้าที่ is_active เป็น true
        List<Product> products = productRepository.findByIsActiveTrue();
        return ResponseEntity.ok(products);
    }
}
