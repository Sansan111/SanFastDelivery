package com.sanfast.backend.controller;

import com.sanfast.backend.entity.Product;
import com.sanfast.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/products")
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

    @GetMapping("/{id}")
    public ResponseEntity<Product> getActiveProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isEmpty() || !Boolean.TRUE.equals(product.get().getIsActive())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product.get());
    }
}
