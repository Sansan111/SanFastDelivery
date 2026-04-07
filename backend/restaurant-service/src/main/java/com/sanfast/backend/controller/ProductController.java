package com.sanfast.backend.controller;

import com.sanfast.backend.entity.Product;
import com.sanfast.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllActiveProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return ResponseEntity.ok(products);
    }
}
