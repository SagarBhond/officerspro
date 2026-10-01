# Integration Guide - Audit Service

This guide explains how to integrate the Audit Service with other microservices like `complaintandfir-service` and `investigation-service`.

## Integration Methods

### Method 1: Using Feign Client (Recommended)

#### Step 1: Add Feign Client Dependency
Ensure your service has Spring Cloud OpenFeign dependency in `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

#### Step 2: Copy the AuditClient Interface
Copy the `AuditClient.java` interface to your service's client package:

```java
package com.configserver.officerspro.yourservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "audit-service", url = "${audit.service.url:http://localhost:8086}")
public interface AuditClient {

    @PostMapping("/api/audit/add")
    void createAuditTrail(@RequestBody AuditTrailRequestDTO request);

    @PostMapping("/api/requests/log")
    void logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}
```

#### Step 3: Enable Feign Clients
Add `@EnableFeignClients` to your main application class:
```java
@SpringBootApplication
@EnableFeignClients
public class YourServiceApplication {
    // ...
}
```

#### Step 4: Configure Audit Service URL
Add to your `application.properties`:
```properties
audit.service.url=http://localhost:8086
```

#### Step 5: Use the Client in Your Service
```java
@Service
@RequiredArgsConstructor
public class FIRService {

    private final AuditClient auditClient;
    private final FIRRepository firRepository;

    public FIR createFIR(FIRRequestDTO request) {
        // Create FIR
        FIR fir = firRepository.save(mapToEntity(request));

        // Log audit trail
        AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                .tableName("FIR")
                .recordId(fir.getId())
                .action(ActionType.CREATED)
                .changedBy(getCurrentUserId())
                .afterState(serializeToJson(fir))
                .remarks("FIR created")
                .build();

        auditClient.createAuditTrail(auditRequest);

        return fir;
    }
}
```

---

## Method 2: Using RestTemplate

```java
@Service
@RequiredArgsConstructor
public class AuditService {

    private final RestTemplate restTemplate;

    @Value("${audit.service.url}")
    private String auditServiceUrl;

    public void logAuditTrail(AuditTrailRequestDTO request) {
        try {
            restTemplate.postForEntity(
                auditServiceUrl + "/api/audit/add",
                request,
                AuditTrailDTO.class
            );
        } catch (Exception e) {
            // Handle error - don't fail the main operation
            log.error("Failed to log audit trail: {}", e.getMessage());
        }
    }
}
```

---

## Method 3: Using HTTP Interceptor for Automatic API Logging

### Step 1: Create an Interceptor
```java
@Component
@RequiredArgsConstructor
public class AuditLoggingInterceptor implements HandlerInterceptor {

    private final AuditClient auditClient;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Store start time
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) {
        long startTime = (Long) request.getAttribute("startTime");
        long executionTime = System.currentTimeMillis() - startTime;

        APIRequestLogRequestDTO logRequest = APIRequestLogRequestDTO.builder()
                .userId(getUserIdFromRequest(request))
                .endpointUrl(request.getRequestURI())
                .httpMethod(HttpMethodType.valueOf(request.getMethod()))
                .ipAddress(getClientIP(request))
                .responseCode(response.getStatus())
                .executionTimeMs(executionTime)
                .build();

        // Async logging to not impact performance
        CompletableFuture.runAsync(() -> auditClient.logAPIRequest(logRequest));
    }
}
```

### Step 2: Register the Interceptor
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuditLoggingInterceptor auditLoggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditLoggingInterceptor)
                .addPathPatterns("/api/**");
    }
}
```

---

## Method 4: Using Spring AOP

### Step 1: Create an Aspect
```java
@Aspect
@Component
@RequiredArgsConstructor
public class DataChangeAspect {

    private final AuditClient auditClient;

    @AfterReturning(value = "@annotation(Auditable)", returning = "result")
    public void logDataChange(JoinPoint joinPoint, Object result) {
        Auditable auditable = getAuditableAnnotation(joinPoint);
        
        AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                .tableName(auditable.tableName())
                .recordId(extractId(result))
                .action(auditable.action())
                .changedBy(getCurrentUserId())
                .afterState(serializeToJson(result))
                .build();

        CompletableFuture.runAsync(() -> auditClient.createAuditTrail(auditRequest));
    }
}
```

### Step 2: Create a Custom Annotation
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String tableName();
    ActionType action();
}
```

### Step 3: Use the Annotation
```java
@Service
public class FIRService {

    @Auditable(tableName = "FIR", action = ActionType.CREATED)
    public FIR createFIR(FIRRequestDTO request) {
        // Your logic
        return savedFIR;
    }
}
```

---

## DTOs to Copy to Your Service

### AuditTrailRequestDTO
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailRequestDTO {
    private String tableName;
    private Long recordId;
    private ActionType action;
    private Long changedBy;
    private String beforeState;
    private String afterState;
    private String remarks;
}
```

### APIRequestLogRequestDTO
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class APIRequestLogRequestDTO {
    private Long userId;
    private String endpointUrl;
    private HttpMethodType httpMethod;
    private String ipAddress;
    private String macAddress;
    private String requestBody;
    private Integer responseCode;
    private String responseBody;
    private Long executionTimeMs;
}
```

### Enums
```java
public enum ActionType {
    CREATED, UPDATED, DELETED
}

public enum HttpMethodType {
    GET, POST, PUT, DELETE, PATCH
}
```

---

## Complete Integration Example

### Example: Integrating with complaintandfir-service

#### 1. Add Dependency
Already present in your pom.xml

#### 2. Copy DTOs and Enums
Create package `com.configserver.officerspro.complainandfirservice.audit` and copy:
- `AuditTrailRequestDTO`
- `APIRequestLogRequestDTO`
- `ActionType` enum
- `HttpMethodType` enum

#### 3. Create Feign Client
```java
package com.configserver.officerspro.complainandfirservice.client;

@FeignClient(name = "audit-service", url = "${audit.service.url:http://localhost:8086}")
public interface AuditClient {
    @PostMapping("/api/audit/add")
    void createAuditTrail(@RequestBody AuditTrailRequestDTO request);

    @PostMapping("/api/requests/log")
    void logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}
```

#### 4. Use in Service Layer
```java
@Service
@RequiredArgsConstructor
public class FIRService {

    private final FIRRepository firRepository;
    private final AuditClient auditClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public FIRResponseDTO createFIR(FIRRequestDTO request, Long userId) {
        // Create FIR
        FIR fir = mapToEntity(request);
        FIR savedFIR = firRepository.save(fir);

        // Log to audit service (async to not block)
        logAuditTrail(savedFIR, userId, ActionType.CREATED, null, savedFIR);

        return mapToDTO(savedFIR);
    }

    @Transactional
    public FIRResponseDTO updateFIR(Long firId, FIRRequestDTO request, Long userId) {
        FIR existingFIR = firRepository.findById(firId)
            .orElseThrow(() -> new ResourceNotFoundException("FIR not found"));

        // Capture before state
        FIR beforeState = cloneFIR(existingFIR);

        // Update FIR
        updateEntity(existingFIR, request);
        FIR updatedFIR = firRepository.save(existingFIR);

        // Log to audit service
        logAuditTrail(updatedFIR, userId, ActionType.UPDATED, beforeState, updatedFIR);

        return mapToDTO(updatedFIR);
    }

    @Transactional
    public void deleteFIR(Long firId, Long userId) {
        FIR fir = firRepository.findById(firId)
            .orElseThrow(() -> new ResourceNotFoundException("FIR not found"));

        // Capture before state
        FIR beforeState = cloneFIR(fir);

        firRepository.delete(fir);

        // Log to audit service
        logAuditTrail(fir, userId, ActionType.DELETED, beforeState, null);
    }

    private void logAuditTrail(FIR fir, Long userId, ActionType action, 
                               FIR beforeState, FIR afterState) {
        CompletableFuture.runAsync(() -> {
            try {
                AuditTrailRequestDTO auditRequest = AuditTrailRequestDTO.builder()
                        .tableName("FIR")
                        .recordId(fir.getId())
                        .action(action)
                        .changedBy(userId)
                        .beforeState(beforeState != null ? objectMapper.writeValueAsString(beforeState) : null)
                        .afterState(afterState != null ? objectMapper.writeValueAsString(afterState) : null)
                        .remarks("FIR " + action.name().toLowerCase())
                        .build();

                auditClient.createAuditTrail(auditRequest);
            } catch (Exception e) {
                // Log error but don't fail the main operation
                log.error("Failed to log audit trail for FIR {}: {}", fir.getId(), e.getMessage());
            }
        });
    }
}
```

---

## Best Practices

1. **Async Logging**: Always log to audit service asynchronously to avoid impacting main operations
2. **Error Handling**: Don't let audit logging failures break your main business logic
3. **Sensitive Data**: Be careful about what you log in before/after states
4. **Performance**: Consider batching audit logs for high-volume operations
5. **Retry Logic**: Implement retry mechanism for failed audit logs
6. **Circuit Breaker**: Use circuit breaker pattern to handle audit service downtime

---

## Testing Integration

### Test if Audit Service is Reachable
```java
@Test
public void testAuditServiceConnection() {
    try {
        ResponseEntity<String> response = restTemplate.getForEntity(
            "http://localhost:8086/api/audit/logs", 
            String.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
    } catch (Exception e) {
        fail("Audit service is not reachable");
    }
}
```

### Test Audit Trail Creation
```java
@Test
public void testCreateAuditTrail() {
    AuditTrailRequestDTO request = AuditTrailRequestDTO.builder()
            .tableName("TEST_TABLE")
            .recordId(123L)
            .action(ActionType.CREATED)
            .changedBy(1L)
            .remarks("Test audit")
            .build();

    auditClient.createAuditTrail(request);

    // Verify in audit service
    List<AuditTrailDTO> logs = auditClient.getAuditTrailsByTableAndRecordId("TEST_TABLE", 123L);
    assertFalse(logs.isEmpty());
}
```

---

## Troubleshooting

### Issue: Connection refused to audit-service
**Solution**: Ensure audit-service is running on port 8086

### Issue: Feign client not found
**Solution**: Add `@EnableFeignClients` to your main application class

### Issue: Audit logging slows down application
**Solution**: Use async logging with `CompletableFuture` or `@Async`

### Issue: Circular JSON serialization
**Solution**: Use `@JsonIgnore` on bidirectional relationships before serializing

---

## Support
For questions or issues with integration, contact the development team.
