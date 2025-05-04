package com.elearn.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


import com.elearn.model.Courses;
import com.elearn.model.Headphones;
import com.elearn.model.Laptops;
import com.elearn.model.Mobiles;
import com.elearn.model.User;
import com.elearn.repo.UserRepository;
import com.elearn.service.ExcelRService;
import com.elearn.util.JwtUtil;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:4200", "https://edulearn-lms.netlify.app", "https://www.edulearn-lms.netlify.app"})
public class ExcelRController {

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private ExcelRService excelRService;
	
	
	@PostMapping("/login")
	public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginData){
		//read email & password from loginData
		String email = loginData.get("email");
		String password = loginData.get("password");
		//compare react email with database
		Optional<User> user = userRepository.findByEmail(email);
		if(user.isPresent() && user.get().getPassword().equals(password)) {
			Map<String, String> response = new HashMap<>();
			String token = jwtUtil.generateToken(email);
			response.put("login", "success");
			response.put("token", token);
			response.put("role", user.get().getRole().toString());
			return ResponseEntity.ok(response);
		}else {
			Map<String, String> response1 = new HashMap<>();
			response1.put("login", "fail");
			return ResponseEntity.status(401).body(response1);
		}
	}
	
	
	@GetMapping("/user/courses")
	public List<Courses> getCourses(){
		return excelRService.getCourses();
	}
	
	@GetMapping("/user/laptops")
	public List<Laptops> getLatops() {
		return excelRService.getLaptops();
	}
	
	@GetMapping("/user/mobiles")
	public List<Mobiles> getMobiles() {
		return excelRService.getMobiles();
	}
	
	@GetMapping("/user/headphones")
	public List<Headphones> getHeadphones() {
		return excelRService.getHeadphones();
	}
	
	@GetMapping("/user/laptops/{pid}")
	public Optional<Laptops> getSingleLaptop(@PathVariable Long pid){
		return excelRService.getLaptopById(pid);
	}
	
	@GetMapping("/user/courses/{pid}")
	public Optional<Courses> getSingleCourses(@PathVariable Long pid) {
		return excelRService.getCoursesById(pid);
	}
	
	@GetMapping("/user/mobiles/{pid}")
	public Optional<Mobiles> getSingleMobile(@PathVariable Long pid){
		return excelRService.getMobilesById(pid);
	}
	
	@GetMapping("/user/headphones/{pid}")
	public Optional<Headphones> getSingleHeadphone(@PathVariable Long pid){
		return excelRService.getHeadphonesById(pid);
	}
	
	
	@PostMapping("/admin/upload/laptops")
	public ResponseEntity<?> uploadLaptops(@RequestParam String pname,
								@RequestParam int pqty,
								@RequestParam int pcost,
								@RequestParam MultipartFile file) {
		 if (pname == null || pname.isEmpty() || pcost <= 0 || file == null || file.isEmpty() || pqty<=0) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input parameters");
         }else {
        	 Laptops savedLaptop = null;
			try {
				savedLaptop = excelRService.saveLaptop(pname, pcost, pqty, file);
			} catch (IOException e) {
				// Handle the file upload or processing error properly
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file: " + e.getMessage());
			}
        	return ResponseEntity.ok(savedLaptop);
         }
	}
	
	@PostMapping("/admin/upload/mobiles")
	public String uploadMobiles() {
		return "admin will upload mobiles soon....";
	}
	
	@PostMapping("/admin/upload/headphones")
	public String uploadHeadphones() {
		return "admin will upload headphones soon....";
	}
	
	@PostMapping("/admin/upload/courses")
	public String uploadCourses() {
		return "admin will upload headphones soon....";
	}
	
	@PostMapping("/admin/register")
	public User register(@RequestBody User user) {
		return excelRService.saveUser(user);
	}
	
	
	/*
	 * razorpay
	 */
	@PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            System.out.println("Creating order with data: " + data);
            int amount = Integer.parseInt(data.get("amount").toString());
            String currency = (String) data.get("currency");
            String receipt = (String) data.get("receipt");

            System.out.println("Amount: " + amount + ", Currency: " + currency + ", Receipt: " + receipt);
            String order = excelRService.createOrder(amount, currency, receipt);
            System.out.println("Order created successfully: " + order);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("Failed to create order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create order: " + e.getMessage());
        }
    }
	
	@PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            System.out.println("Verifying payment with data: " + data);
            String orderId = data.get("razorpay_order_id");
            String paymentId = data.get("razorpay_payment_id");
            String signature = data.get("razorpay_signature");

            boolean isValid = excelRService.verifyPayment(orderId, paymentId, signature);
            System.out.println("Payment verification result: " + isValid);

            if (isValid) {
                return ResponseEntity.ok("Payment Verified");
            } else {
                return ResponseEntity.badRequest().body("Payment Verification Failed");
            }
        } catch (Exception e) {
            System.err.println("Failed to verify payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify payment: " + e.getMessage());
        }
    }
	
	
	
}
