package com.sanfast.backend.controller;

import com.sanfast.backend.entity.Product;
import com.sanfast.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiSearchController {

    private final ProductRepository productRepository;
    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public AiSearchController(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/recommend")
    public ResponseEntity<?> recommend(@RequestBody Map<String, String> body) {
        String query = body.getOrDefault("query", "").trim();
        if (query.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "กรุณาระบุคำค้นหา"));
        }

        try {
            // ดึงเมนูทั้งหมดจาก Database
            List<Product> allProducts = productRepository.findByIsActiveTrue();

            // สร้าง context ส่งให้ Gemini
            String productList = allProducts.stream()
                .map(p -> String.format("ID:%d | %s | tags:%s | calories:%d | หมวด:%s | ราคา:%.0f บาท",
                    p.getId(), p.getName(),
                    p.getTags() != null ? p.getTags() : "",
                    p.getCalories() != null ? p.getCalories() : 0,
                    p.getCategory() != null ? p.getCategory() : "",
                    p.getPrice()))
                .collect(Collectors.joining("\n"));

            String prompt = String.format("""
                คุณเป็น AI แนะนำอาหาร ผู้ใช้ต้องการ: "%s"
                
                รายการเมนูที่มีในระบบ:
                %s
                
                กรุณาเลือก ID ของเมนูที่เหมาะสมที่สุด 5-8 รายการ
                ตอบได้แค่ตัวเลข ID คั่นด้วยเครื่องหมายจุลภาค เช่น: 1,5,12,23
                ห้ามมีข้อความอื่นใด ตอบแค่ตัวเลขเท่านั้น
                """, query, productList);

            // เรียก Gemini API
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            // Parse response จาก Gemini
            String geminiText = extractGeminiText(response.getBody());
            List<Long> recommendedIds = parseIds(geminiText);

            // ดึงข้อมูลเมนูตาม IDs ที่ Gemini แนะนำ
            List<Product> recommended = recommendedIds.isEmpty()
                ? List.of()
                : productRepository.findByIsActiveTrueAndIdIn(recommendedIds);

            // เรียงตาม order ที่ Gemini แนะนำ
            Map<Long, Integer> orderMap = new HashMap<>();
            for (int i = 0; i < recommendedIds.size(); i++) {
                orderMap.put(recommendedIds.get(i), i);
            }
            recommended.sort(Comparator.comparingInt(p -> orderMap.getOrDefault(p.getId(), 99)));

            return ResponseEntity.ok(Map.of(
                "query", query,
                "products", recommended,
                "total", recommended.size()
            ));

        } catch (Exception e) {
            // Fallback: keyword matching ถ้า Gemini ล้มเหลว
            return ResponseEntity.ok(Map.of(
                "query", query,
                "products", fallbackSearch(query),
                "total", fallbackSearch(query).size(),
                "mode", "fallback"
            ));
        }
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map responseBody) {
        try {
            List<Map> candidates = (List<Map>) responseBody.get("candidates");
            Map content = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "";
        }
    }

    private List<Long> parseIds(String text) {
        List<Long> ids = new ArrayList<>();
        if (text == null || text.isBlank()) return ids;
        String[] parts = text.trim().replaceAll("[^0-9,]", "").split(",");
        for (String part : parts) {
            try {
                long id = Long.parseLong(part.trim());
                if (id > 0) ids.add(id);
            } catch (NumberFormatException ignored) {}
        }
        return ids;
    }

    // Fallback: ค้นหาด้วย keyword matching เองถ้า Gemini ล้มเหลว
    private List<Product> fallbackSearch(String query) {
        String q = query.toLowerCase()
            .replace("ๆ", "")
            .replace("ๆ", "")
            .trim();

        List<Product> all = productRepository.findByIsActiveTrue();

        // ตรวจสอบแคลอรี่ก่อนเลย (รองรับทั้ง "แคล" และ "เเคล" ที่พิมพ์ผิด)
        if (q.contains("แคล") || q.contains("เเคล") || q.contains("calorie") || q.contains("แคลน้อย") || q.contains("แคลต่ำ")) {
            int maxCal = 350; // ค่าเริ่มต้น
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+").matcher(q);
                if (m.find()) {
                    maxCal = Integer.parseInt(m.group());
                }
            } catch (Exception ignored) {}
            
            // เรียงตามแคลอรี่จากน้อยไปมาก
            return productRepository.findByIsActiveTrueAndCaloriesLessThanEqual(maxCal).stream()
                .sorted(Comparator.comparingInt(p -> p.getCalories() != null ? p.getCalories() : 0))
                .limit(8)
                .collect(Collectors.toList());
        }

        // Category mapping — ครอบคลุมคำที่ผู้ใช้พิมพ์ภาษาไทยและอังกฤษ
        Map<String, String> categoryKeywords = new java.util.LinkedHashMap<>();
        categoryKeywords.put("ของหวาน", "ของหวาน");
        categoryKeywords.put("หวาน", "ของหวาน");
        categoryKeywords.put("ไอติม", "ของหวาน");
        categoryKeywords.put("ไอศครีม", "ของหวาน");
        categoryKeywords.put("เค้ก", "ของหวาน");
        categoryKeywords.put("คุกกี้", "ของหวาน");
        categoryKeywords.put("บิงซู", "ของหวาน");
        categoryKeywords.put("เครื่องดื่ม", "เครื่องดื่ม");
        categoryKeywords.put("กาแฟ", "เครื่องดื่ม");
        categoryKeywords.put("ชา", "เครื่องดื่ม");
        categoryKeywords.put("น้ำ", "เครื่องดื่ม");
        categoryKeywords.put("สมูทตี้", "เครื่องดื่ม");
        categoryKeywords.put("ก๋วยเตี๋ยว", "ก๋วยเตี๋ยว");
        categoryKeywords.put("เส้น", "ก๋วยเตี๋ยว");
        categoryKeywords.put("ราเมง", "ก๋วยเตี๋ยว");
        categoryKeywords.put("ผัดไทย", "ก๋วยเตี๋ยว");
        categoryKeywords.put("สุขภาพ", "อาหารสุขภาพ");
        categoryKeywords.put("คลีน", "อาหารสุขภาพ");
        categoryKeywords.put("สลัด", "อาหารสุขภาพ");
        categoryKeywords.put("healthy", "อาหารสุขภาพ");
        categoryKeywords.put("healty", "อาหารสุขภาพ");
        categoryKeywords.put("ฟาสต์ฟู้ด", "ฟาสต์ฟู้ด");
        categoryKeywords.put("เบอร์เกอร์", "ฟาสต์ฟู้ด");
        categoryKeywords.put("พิซซ่า", "ฟาสต์ฟู้ด");
        categoryKeywords.put("พาสต้า", "ฟาสต์ฟู้ด");
        categoryKeywords.put("ทะเล", "อาหารทะเล");
        categoryKeywords.put("ซีฟู้ด", "อาหารทะเล");
        categoryKeywords.put("กุ้ง", "อาหารทะเล");
        categoryKeywords.put("ปลา", "อาหารทะเล");
        categoryKeywords.put("อาหารเหนือ", "อาหารเหนือ");
        categoryKeywords.put("ญี่ปุ่น", "อาหารญี่ปุ่น");
        categoryKeywords.put("ซูชิ", "อาหารญี่ปุ่น");
        categoryKeywords.put("เกาหลี", "อาหารเกาหลี");

        // ค้นหาตาม category ก่อน
        for (Map.Entry<String, String> entry : categoryKeywords.entrySet()) {
            if (q.contains(entry.getKey())) {
                String targetCategory = entry.getValue();
                List<Product> byCat = all.stream()
                    .filter(p -> targetCategory.equals(p.getCategory()))
                    .limit(8)
                    .collect(java.util.stream.Collectors.toList());
                if (!byCat.isEmpty()) return byCat;
            }
        }

        // Tag-based fallback ที่ฉลาดขึ้นครอบคลุม Feeling/Attribute
        Map<String, List<String>> tagMap = new java.util.LinkedHashMap<>();
        tagMap.put("แซ่บ", List.of("spicy", "hot", "sour", "yum"));
        tagMap.put("เผ็ด", List.of("spicy", "hot"));
        tagMap.put("เย็น", List.of("cold", "refreshing", "ice", "dessert"));
        tagMap.put("ร้อน", List.of("hot", "warm", "soup"));
        tagMap.put("หมู", List.of("pork"));
        tagMap.put("ไก่", List.of("chicken"));
        tagMap.put("เนื้อ", List.of("beef"));
        tagMap.put("ทอด", List.of("fried", "crispy"));
        tagMap.put("พรีเมียม", List.of("premium"));
        tagMap.put("อ้วน", List.of("fried", "cheese", "sweet", "dessert", "fastfood"));
        tagMap.put("แคลสูง", List.of("fried", "cheese", "sweet", "fastfood"));
        tagMap.put("ข้าว", List.of("rice"));
        tagMap.put("ผัก", List.of("healthy", "salad", "vegetarian", "vegan"));
        tagMap.put("หิว", List.of("rice", "noodle", "fried")); // เดาใจคนหิว

        List<String> targetTags = new java.util.ArrayList<>();
        tagMap.forEach((keyword, tags) -> {
            if (q.contains(keyword)) targetTags.addAll(tags);
        });

        if (!targetTags.isEmpty()) {
            return all.stream()
                .filter(p -> {
                    String tags = p.getTags() != null ? p.getTags().toLowerCase() : "";
                    String cat = p.getCategory() != null ? p.getCategory().toLowerCase() : "";
                    return targetTags.stream().anyMatch(t -> tags.contains(t) || cat.contains(t));
                })
                .limit(8)
                .collect(java.util.stream.Collectors.toList());
        }

        // Free-text Search (ถ้าไม่ตรงเงื่อนไขอะไรเลย ให้ลองหาในชื่อและคำอธิบาย)
        List<Product> textMatch = all.stream()
            .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q)) || 
                         (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
            .limit(8)
            .collect(java.util.stream.Collectors.toList());
        if (!textMatch.isEmpty()) return textMatch;

        return all.subList(0, Math.min(8, all.size()));
    }
}
