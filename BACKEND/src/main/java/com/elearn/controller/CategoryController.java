package com.elearn.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elearn.model.Category;
import com.elearn.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:4200", "https://edulearn-lms.netlify.app", "https://www.edulearn-lms.netlify.app"})
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Category>> getActiveCategories() {
        List<Category> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Integer id) {
        Optional<Category> categoryOpt = categoryService.getCategoryById(id);
        
        if (categoryOpt.isPresent()) {
            return ResponseEntity.ok(categoryOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            // Ensure required fields are present
            if (category.getName() == null || category.getName().trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Category name is required");
                return ResponseEntity.status(400).body(response);
            }
            
            // Make sure Active is set, default to true if not provided
            if (category.getActive() == null) {
                category.setActive(true);
            }
            
            // Log the category details
            System.out.println("Creating category: " + category.getName() + ", active: " + category.getActive());
            
            // Save the category to the database
            Category savedCategory = categoryService.saveCategory(category);
            
            // Log the saved category ID
            System.out.println("Category created with ID: " + savedCategory.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Integer id, @RequestBody Category category) {
        try {
            // Ensure the ID in the path matches the category object
            category.setId(id);
            
            Category updatedCategory = categoryService.saveCategory(category);
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCategoryStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> statusData) {
        try {
            Boolean active = statusData.get("active");
            if (active == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Active status is required");
                return ResponseEntity.status(400).body(response);
            }
            
            Category updatedCategory = categoryService.updateCategoryStatus(id, active);
            
            if (updatedCategory != null) {
                return ResponseEntity.ok(updatedCategory);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Category not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
        try {
            categoryService.deleteCategory(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 