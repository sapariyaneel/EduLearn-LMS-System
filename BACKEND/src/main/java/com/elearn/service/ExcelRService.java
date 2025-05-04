package com.elearn.service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.elearn.model.Courses;
import com.elearn.model.Headphones;
import com.elearn.model.Laptops;
import com.elearn.model.Mobiles;
import com.elearn.model.User;
import com.elearn.repo.*;
import com.elearn.repository.CoursesRepo;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;

@Service
public class ExcelRService {

    private final CoursesRepo coursesRepo;

	@Autowired
	private UserRepository userRepository;
	
	
	@Autowired
	private LaptopsRepo laptopsRepo;
	
	
	@Autowired
	private MobilesRepo mobilesRepo;
	
	
	@Autowired
	private HeadphonesRepo headphonesRepo;
	
	
	 @Value("${aws.s3.bucket.name}")
	 private String bucketName;
	    
	    
	 @Value("${aws.accessKeyId}")
	 private String accessKeyId;

	 @Value("${aws.secretAccessKey}")
	 private String secretAccessKey;

     @Value("${aws.s3.region}")
     private String awsRegion;
	
	 // Getting reference of s3 buckets using injected credentials
	 private S3Client s3Client;

     @Autowired
     public void initS3Client() {
         this.s3Client = S3Client.builder()
             .region(Region.of(awsRegion))
             .credentialsProvider(StaticCredentialsProvider.create(
                 AwsBasicCredentials.create(accessKeyId, secretAccessKey)
             ))
             .build();
     }

    ExcelRService(CoursesRepo coursesRepo) {
        this.coursesRepo = coursesRepo;
    }
	 
	 
	 
	 public Laptops saveLaptop(String pname, int pcost, int pqty, MultipartFile file) throws IOException {
	        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
	        try {
	            // Upload to S3
	            s3Client.putObject(
	                PutObjectRequest.builder()
	                    .bucket(bucketName)
	                    .key(fileName)
	                    
	                    .contentType("image/jpeg")
	                    .build(),
	                RequestBody.fromBytes(file.getBytes())
	            );
	        } catch (Exception e) {
	            throw new RuntimeException("Error uploading file to S3: " + e.getMessage());
	        }

	        //String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, Region.US_EAST_1.id(), fileName);

	        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, fileName);
	        System.out.println("File uploaded successfully. File URL: " + fileUrl);

	        
	        try {
	            // Save to database
	            Laptops laptop = new Laptops();
	            laptop.setPname(pname);
	            laptop.setPcost(pcost);
	            laptop.setPimage(fileUrl);
	            laptop.setPqty(pqty);
	            System.out.println("Saving Laptop: pname=" + pname + ", pcost=" + pcost + ", pimage=" + fileUrl);

	            return laptopsRepo.save(laptop);
	        } catch (Exception e) {
	            throw new RuntimeException("Error saving laptop to database: " + e.getMessage());
	        }
	    }
	 
	 
	 
	 
	 
	 
	
	public User saveUser(User user) {
		return userRepository.save(user);
	}
	
	
	public List<Laptops> getLaptops(){
		return laptopsRepo.findAll();
	}
	
	
	public List<Mobiles> getMobiles(){
		return mobilesRepo.findAll();
	}
	
	
	public List<Headphones> getHeadphones(){
		return headphonesRepo.findAll();
	}
	
	public Optional<Laptops> getLaptopById(Long pid) {
		return laptopsRepo.findById(pid);
	}
	
	public Optional<Mobiles> getMobilesById(Long pid) {
		return mobilesRepo.findById(pid);
	}
	
	public Optional<Headphones> getHeadphonesById(Long pid) {
		return headphonesRepo.findById(pid);
	}
	
	public List<Courses> getCourses(){
		return coursesRepo.findAll();
	}
	
	public Optional<Courses> getCoursesById(Long pid){
		return coursesRepo.findById(pid);
	}
	/*
	 * Razorpay
	 */
	@Value("${razorpay.api.key}")
    private String key;

    @Value("${razorpay.api.secret}")
    private String secret;

    public String createOrder(int amount, String currency, String receipt) throws RazorpayException {
        try {
            System.out.println("Creating Razorpay order with key: " + key + ", amount: " + amount);
            RazorpayClient razorpay = new RazorpayClient(key, secret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            System.out.println("Order request JSON: " + orderRequest.toString());

            Order order = razorpay.orders.create(orderRequest);
            String orderJson = order.toString();
            System.out.println("Order created: " + orderJson);
            return orderJson;
        } catch (RazorpayException e) {
            System.err.println("Razorpay error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error creating order: " + e.getMessage());
            e.printStackTrace();
            throw new RazorpayException("Failed to create order: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            System.out.println("Verifying payment with orderId: " + orderId + ", paymentId: " + paymentId);
            String generatedSignature = HmacSHA256(orderId + "|" + paymentId, secret);
            System.out.println("Generated signature: " + generatedSignature);
            System.out.println("Received signature: " + signature);
            return generatedSignature.equals(signature);
        } catch (Exception e) {
            System.err.println("Error verifying payment: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String HmacSHA256(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hmacData = mac.doFinal(data.getBytes());
            return javax.xml.bind.DatatypeConverter.printHexBinary(hmacData).toLowerCase();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA256", e);
        }
    }
}
