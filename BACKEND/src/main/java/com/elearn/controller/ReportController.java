package com.elearn.controller;

import java.math.BigDecimal;
// import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elearn.model.Category;
import com.elearn.model.Courses;
import com.elearn.model.Enrollment;
import com.elearn.model.User;
import com.elearn.service.CategoryService;
import com.elearn.service.CourseService;
import com.elearn.service.EnrollmentService;
import com.elearn.service.UserService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private UserService userService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private EnrollmentService enrollmentService;
    
    @Autowired
    private CategoryService categoryService;

    /**
     * Get enrollment statistics
     * @return ResponseEntity with enrollment statistics
     */
    @GetMapping("/enrollments")
    public ResponseEntity<Map<String, Object>> getEnrollmentStats() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
            
            // Calculate total enrollments
            response.put("totalEnrollments", enrollments.size());
            
            // Calculate enrollments by status
            Map<String, Long> enrollmentByStatus = new HashMap<>();
            
            // Initialize status counts to zero
            String[] statuses = {"IN_PROGRESS", "COMPLETED", "DROPPED"};
            for (String status : statuses) {
                enrollmentByStatus.put(status, 0L);
            }
            
            // Count enrollments by status
            enrollments.forEach(enrollment -> {
                try {
                    String status = enrollment.getStatus() != null ? 
                        enrollment.getStatus().toString() : "IN_PROGRESS";
                    enrollmentByStatus.put(status, enrollmentByStatus.getOrDefault(status, 0L) + 1);
                } catch (Exception e) {
                    System.err.println("Error processing enrollment status: " + e.getMessage());
                }
            });
            
            response.put("enrollmentByStatus", enrollmentByStatus);
            
            // Calculate monthly enrollments
            int[] monthlyEnrollments = new int[12];
            for (int i = 0; i < 12; i++) {
                monthlyEnrollments[i] = 0; // Initialize to zero
            }
            
            enrollments.forEach(enrollment -> {
                try {
                    if (enrollment.getEnrollmentDate() != null) {
                        int month = enrollment.getEnrollmentDate().getMonthValue() - 1; // 0-based index
                        if (month >= 0 && month < 12) { // Ensure month is valid
                            monthlyEnrollments[month]++;
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error processing enrollment date: " + e.getMessage());
                }
            });
            response.put("monthlyEnrollments", monthlyEnrollments);
            
            // Get recent enrollments
            List<Map<String, Object>> recentEnrollments = new ArrayList<>();
            try {
                recentEnrollments = enrollments.stream()
                    .sorted((e1, e2) -> {
                        if (e1.getEnrollmentDate() == null) return 1;
                        if (e2.getEnrollmentDate() == null) return -1;
                        return e2.getEnrollmentDate().compareTo(e1.getEnrollmentDate());
                    })
                    .limit(5)
                    .map(enrollment -> {
                        try {
                            Map<String, Object> enrollmentData = new HashMap<>();
                            enrollmentData.put("enrollmentId", enrollment.getId());
                            enrollmentData.put("userId", enrollment.getUser() != null ? 
                                enrollment.getUser().getId() : null);
                            enrollmentData.put("userName", enrollment.getUser() != null ? 
                                (enrollment.getUser().getName() != null ? enrollment.getUser().getName() : "Unknown") : "Unknown");
                            enrollmentData.put("courseName", enrollment.getCourse() != null ? 
                                (enrollment.getCourse().getTitle() != null ? enrollment.getCourse().getTitle() : "Unknown Course") : "Unknown Course");
                            enrollmentData.put("enrollmentDate", enrollment.getEnrollmentDate());
                            enrollmentData.put("status", enrollment.getStatus() != null ? 
                                enrollment.getStatus().toString() : "IN_PROGRESS");
                            return enrollmentData;
                        } catch (Exception e) {
                            System.err.println("Error mapping enrollment: " + e.getMessage());
                            Map<String, Object> errorData = new HashMap<>();
                            errorData.put("enrollmentId", enrollment.getId());
                            errorData.put("error", "Error processing enrollment data");
                            return errorData;
                        }
                    })
                    .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error processing recent enrollments: " + e.getMessage());
            }
            
            response.put("recentEnrollments", recentEnrollments);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve enrollment statistics");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get user statistics
     * @return ResponseEntity with user statistics
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<User> users = userService.getAllUsers();
            
            // Calculate total users
            response.put("totalUsers", users.size());
            
            // Calculate active users
            long activeUsers = users.stream()
                    .filter(user -> user.getStatus() != null && User.UserStatus.ACTIVE.equals(user.getStatus()))
                    .count();
            response.put("activeUsers", activeUsers);
            
            // Calculate users by role
            Map<String, Long> usersByRole = new HashMap<>();
            
            // Initialize role counts to zero
            String[] roles = {"STUDENT", "INSTRUCTOR", "ADMIN"};
            for (String role : roles) {
                usersByRole.put(role, 0L);
            }
            
            // Count users by role
            users.forEach(user -> {
                String role = user.getRole() != null ? user.getRole().toString() : "STUDENT";
                usersByRole.put(role, usersByRole.getOrDefault(role, 0L) + 1);
            });
            
            response.put("usersByRole", usersByRole);
            
            // Calculate user growth by month
            int[] userGrowth = new int[12];
            for (int i = 0; i < 12; i++) {
                userGrowth[i] = 0; // Initialize to zero
            }
            
            users.forEach(user -> {
                if (user.getJoinDate() != null) {
                    int month = user.getJoinDate().getMonthValue() - 1; // 0-based index
                    if (month >= 0 && month < 12) { // Ensure month is valid
                        userGrowth[month]++;
                    }
                }
            });
            response.put("userGrowth", userGrowth);
            
            // Get recent users
            List<Map<String, Object>> recentUsers = users.stream()
                    .sorted((u1, u2) -> {
                        if (u1.getJoinDate() == null) return 1;
                        if (u2.getJoinDate() == null) return -1;
                        return u2.getJoinDate().compareTo(u1.getJoinDate());
                    })
                    .limit(5)
                    .map(user -> {
                        Map<String, Object> userData = new HashMap<>();
                        userData.put("id", user.getId());
                        userData.put("name", user.getName() != null ? user.getName() : "Unknown");
                        userData.put("email", user.getEmail());
                        userData.put("role", user.getRole() != null ? user.getRole().toString() : "STUDENT");
                        userData.put("status", user.getStatus() != null ? user.getStatus().toString() : "INACTIVE");
                        userData.put("registrationDate", user.getJoinDate());
                        return userData;
                    })
                    .collect(Collectors.toList());
            
            response.put("recentUsers", recentUsers);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve user statistics");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get course statistics
     * @return ResponseEntity with course statistics
     */
    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getCourseStats() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<Courses> courses = courseService.getAllCourses();
            List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
            List<Category> categories = categoryService.getAllCategories();
            
            // Calculate total courses
            response.put("totalCourses", courses.size());
            
            // Calculate active courses
            long activeCourses = courses.stream()
                    .filter(course -> course.getStatus() != null && "PUBLISHED".equals(course.getStatus().toString()))
                    .count();
            response.put("activeCourses", activeCourses);
            
            // Calculate courses by category
            Map<String, Long> coursesByCategory = new HashMap<>();
            
            // Initialize all categories even if no courses
            categories.forEach(category -> {
                coursesByCategory.put(category.getName() != null ? category.getName() : "Uncategorized", 0L);
            });
            
            // Add "Uncategorized" category if not present
            if (!coursesByCategory.containsKey("Uncategorized")) {
                coursesByCategory.put("Uncategorized", 0L);
            }
            
            // Count courses per category
            courses.forEach(course -> {
                Integer categoryId = course.getCategoryId();
                boolean foundCategory = false;
                
                if (categoryId != null) {
                    Optional<Category> categoryOpt = categories.stream()
                        .filter(c -> c.getId().equals(categoryId))
                        .findFirst();
                        
                    if (categoryOpt.isPresent()) {
                        String categoryName = categoryOpt.get().getName() != null ? 
                            categoryOpt.get().getName() : "Uncategorized";
                        coursesByCategory.put(categoryName, coursesByCategory.getOrDefault(categoryName, 0L) + 1);
                        foundCategory = true;
                    }
                }
                
                // If no category found, increment Uncategorized
                if (!foundCategory) {
                    coursesByCategory.put("Uncategorized", coursesByCategory.getOrDefault("Uncategorized", 0L) + 1);
                }
            });
            
            response.put("coursesByCategory", coursesByCategory);
            
            // Calculate popular courses (by enrollment count)
            Map<Long, Long> enrollmentCounts = new HashMap<>();
            enrollments.forEach(enrollment -> {
                if (enrollment.getCourse() != null) {
                    Long courseId = enrollment.getCourse().getId();
                    enrollmentCounts.put(courseId, enrollmentCounts.getOrDefault(courseId, 0L) + 1);
                }
            });
            
            List<Map<String, Object>> popularCourses = courses.stream()
                    .filter(course -> course.getId() != null)
                    .sorted((c1, c2) -> {
                        Long count1 = enrollmentCounts.getOrDefault(c1.getId(), 0L);
                        Long count2 = enrollmentCounts.getOrDefault(c2.getId(), 0L);
                        return count2.compareTo(count1);
                    })
                    .limit(5)
                    .map(course -> {
                        Map<String, Object> courseData = new HashMap<>();
                        courseData.put("id", course.getId());
                        courseData.put("title", course.getTitle() != null ? course.getTitle() : "Untitled Course");
                        courseData.put("enrollments", enrollmentCounts.getOrDefault(course.getId(), 0L));
                        courseData.put("rating", 4.5); // Default rating since no rating field exists
                        return courseData;
                    })
                    .collect(Collectors.toList());
            
            response.put("popularCourses", popularCourses);
            
            // Get recent courses
            List<Map<String, Object>> recentCourses = courses.stream()
                    .sorted((c1, c2) -> {
                        if (c1.getCreatedAt() == null) return 1;
                        if (c2.getCreatedAt() == null) return -1;
                        return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                    })
                    .limit(5)
                    .map(course -> {
                        Map<String, Object> courseData = new HashMap<>();
                        courseData.put("id", course.getId());
                        courseData.put("title", course.getTitle() != null ? course.getTitle() : "Untitled Course");
                        courseData.put("instructorName", course.getInstructor() != null && course.getInstructor().getName() != null ? 
                                course.getInstructor().getName() : "Unknown Instructor");
                        courseData.put("createdAt", course.getCreatedAt());
                        return courseData;
                    })
                    .collect(Collectors.toList());
            
            response.put("recentCourses", recentCourses);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve course statistics");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get revenue statistics
     * @return ResponseEntity with revenue statistics
     */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueStats() {
        try {
            Map<String, Object> response = new HashMap<>();
            List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
            List<Category> categories = categoryService.getAllCategories();
            
            // Calculate total revenue
            BigDecimal totalRevenue = enrollments.stream()
                    .filter(e -> e.getCourse() != null && e.getCourse().getPrice() != null)
                    .map(e -> e.getCourse().getPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            response.put("totalRevenue", totalRevenue);
            
            // Calculate monthly revenue
            BigDecimal[] monthlyRevenue = new BigDecimal[12];
            for (int i = 0; i < 12; i++) {
                monthlyRevenue[i] = BigDecimal.ZERO;
            }
            
            enrollments.forEach(enrollment -> {
                if (enrollment.getEnrollmentDate() != null && 
                    enrollment.getCourse() != null && 
                    enrollment.getCourse().getPrice() != null) {
                    int month = enrollment.getEnrollmentDate().getMonthValue() - 1; // 0-based index
                    if (month >= 0 && month < 12) { // Ensure month is valid
                        monthlyRevenue[month] = monthlyRevenue[month].add(enrollment.getCourse().getPrice());
                    }
                }
            });
            response.put("monthlyRevenue", monthlyRevenue);
            
            // Calculate revenue by category
            Map<String, BigDecimal> revenueByCategory = new HashMap<>();
            
            // Initialize all categories with zero revenue
            categories.forEach(category -> {
                revenueByCategory.put(category.getName() != null ? category.getName() : "Uncategorized", BigDecimal.ZERO);
            });
            
            // Add "Uncategorized" category if not present
            if (!revenueByCategory.containsKey("Uncategorized")) {
                revenueByCategory.put("Uncategorized", BigDecimal.ZERO);
            }
            
            // Calculate revenue for each category
            enrollments.forEach(enrollment -> {
                if (enrollment.getCourse() != null && 
                    enrollment.getCourse().getPrice() != null &&
                    enrollment.getCourse().getCategoryId() != null) {
                    
                    Integer categoryId = enrollment.getCourse().getCategoryId();
                    BigDecimal price = enrollment.getCourse().getPrice();
                    boolean foundCategory = false;
                    
                    for (Category category : categories) {
                        if (category.getId().equals(categoryId)) {
                            String categoryName = category.getName() != null ? 
                                category.getName() : "Uncategorized";
                            revenueByCategory.put(categoryName, 
                                    revenueByCategory.getOrDefault(categoryName, BigDecimal.ZERO).add(price));
                            foundCategory = true;
                            break;
                        }
                    }
                    
                    // If no category found, add to Uncategorized
                    if (!foundCategory) {
                        revenueByCategory.put("Uncategorized", 
                                revenueByCategory.getOrDefault("Uncategorized", BigDecimal.ZERO).add(price));
                    }
                }
            });
            response.put("revenueByCategory", revenueByCategory);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve revenue statistics");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Generate a custom report
     * @param params Parameters for the custom report
     * @return ResponseEntity with custom report data
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateCustomReport(@RequestBody Map<String, Object> params) {
        try {
            String reportType = (String) params.get("type");
            String timeRange = (String) params.get("range");
            
            // Get data for the report based on type
            Map<String, Object> reportData = new HashMap<>();
            
            switch(reportType) {
                case "enrollment":
                    reportData = getEnrollmentStats().getBody();
                    break;
                case "revenue":
                    reportData = getRevenueStats().getBody();
                    break;
                case "users":
                    reportData = getUserStats().getBody();
                    break;
                case "courses":
                    reportData = getCourseStats().getBody();
                    break;
                default:
                    reportData.put("message", "Invalid report type");
                    return new ResponseEntity<>(reportData, HttpStatus.BAD_REQUEST);
            }
            
            // Generate the appropriate file based on the reportType parameter
            byte[] reportBytes;
            String contentType;
            String fileExtension;
            
            // Check if we're generating CSV or PDF (default to PDF)
            boolean generateCsv = "csv".equals(params.get("format"));
            
            if (generateCsv) {
                // Generate CSV content
                reportBytes = generateCsvReport(reportData, reportType);
                contentType = "text/csv";
                fileExtension = "csv";
            } else {
                // Generate PDF content
                reportBytes = generatePdfReport(reportData, reportType);
                contentType = "application/pdf";
                fileExtension = "pdf";
            }
            
            // Return the file as a response
            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header("Content-Disposition", "attachment; filename=" + reportType + "_report_" + timeRange + "." + fileExtension)
                .body(reportBytes);
                
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate report");
            errorResponse.put("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Generate CSV content from report data
     * @param reportData The data to include in the CSV
     * @param reportType The type of report
     * @return Byte array of CSV content
     */
    private byte[] generateCsvReport(Map<String, Object> reportData, String reportType) throws Exception {
        StringBuilder csvContent = new StringBuilder();
        
        // Add CSV headers based on report type
        switch(reportType) {
            case "enrollment":
                csvContent.append("Month,Enrollments,Completions\n");
                // Add monthly data
                String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                int[] monthlyEnrollments = (int[]) reportData.get("monthlyEnrollments");
                for (int i = 0; i < 12; i++) {
                    csvContent.append(months[i]).append(",").append(monthlyEnrollments[i]).append(",0\n");
                }
                break;
                
            case "revenue":
                csvContent.append("Month,Revenue\n");
                // Add monthly revenue data
                String[] revenueMonths = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                BigDecimal[] monthlyRevenue = (BigDecimal[]) reportData.get("monthlyRevenue");
                for (int i = 0; i < 12; i++) {
                    csvContent.append(revenueMonths[i]).append(",").append(monthlyRevenue[i]).append("\n");
                }
                break;
                
            case "users":
                csvContent.append("User Type,Count\n");
                csvContent.append("Students,").append(reportData.get("totalStudents")).append("\n");
                csvContent.append("Instructors,").append(reportData.get("totalInstructors")).append("\n");
                csvContent.append("Admins,").append(reportData.get("totalAdmins")).append("\n");
                break;
                
            case "courses":
                csvContent.append("Category,Courses\n");
                // Add courses by category
                @SuppressWarnings("unchecked")
                Map<String, Long> coursesByCategory = (Map<String, Long>) reportData.get("coursesByCategory");
                for (Map.Entry<String, Long> entry : coursesByCategory.entrySet()) {
                    csvContent.append(entry.getKey()).append(",").append(entry.getValue()).append("\n");
                }
                break;
                
            default:
                csvContent.append("No data available");
        }
        
        return csvContent.toString().getBytes();
    }
    
    /**
     * Generate PDF content from report data
     * @param reportData The data to include in the PDF
     * @param reportType The type of report
     * @return Byte array of PDF content
     */
    private byte[] generatePdfReport(Map<String, Object> reportData, String reportType) throws Exception {
        // This is a simplified PDF generation - in a real application you would use a PDF library
        // like iText, PDFBox, or JasperReports. For this example, we'll create a simple text
        // representation that would normally be formatted into a PDF
        
        StringBuilder pdfContent = new StringBuilder();
        pdfContent.append("Report Type: ").append(reportType.toUpperCase()).append("\n\n");
        
        switch(reportType) {
            case "enrollment":
                pdfContent.append("Total Enrollments: ").append(reportData.get("totalEnrollments")).append("\n\n");
                pdfContent.append("Monthly Enrollments:\n");
                String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                int[] monthlyEnrollments = (int[]) reportData.get("monthlyEnrollments");
                for (int i = 0; i < 12; i++) {
                    pdfContent.append(months[i]).append(": ").append(monthlyEnrollments[i]).append("\n");
                }
                break;
                
            case "revenue":
                pdfContent.append("Total Revenue: $").append(reportData.get("totalRevenue")).append("\n\n");
                pdfContent.append("Monthly Revenue:\n");
                String[] revenueMonths = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
                BigDecimal[] monthlyRevenue = (BigDecimal[]) reportData.get("monthlyRevenue");
                for (int i = 0; i < 12; i++) {
                    pdfContent.append(revenueMonths[i]).append(": $").append(monthlyRevenue[i]).append("\n");
                }
                break;
                
            case "users":
                pdfContent.append("User Statistics:\n");
                pdfContent.append("Total Students: ").append(reportData.get("totalStudents")).append("\n");
                pdfContent.append("Total Instructors: ").append(reportData.get("totalInstructors")).append("\n");
                pdfContent.append("Total Admins: ").append(reportData.get("totalAdmins")).append("\n");
                break;
                
            case "courses":
                pdfContent.append("Course Statistics:\n");
                pdfContent.append("Total Courses: ").append(reportData.get("totalCourses")).append("\n");
                pdfContent.append("Active Courses: ").append(reportData.get("activeCourses")).append("\n\n");
                pdfContent.append("Courses by Category:\n");
                
                @SuppressWarnings("unchecked")
                Map<String, Long> coursesByCategory = (Map<String, Long>) reportData.get("coursesByCategory");
                for (Map.Entry<String, Long> entry : coursesByCategory.entrySet()) {
                    pdfContent.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
                }
                break;
                
            default:
                pdfContent.append("No data available");
        }
        
        // In a real implementation, convert this content to PDF using a PDF library
        // For this example, we're just returning the text content as bytes
        return pdfContent.toString().getBytes();
    }
} 