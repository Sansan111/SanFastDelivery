package com.sanfast.backend.repository;

import com.sanfast.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.id IN :ids")
    List<Product> findByIsActiveTrueAndIdIn(@Param("ids") List<Long> ids);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.calories <= :maxCalories")
    List<Product> findByIsActiveTrueAndCaloriesLessThanEqual(@Param("maxCalories") int maxCalories);
}
