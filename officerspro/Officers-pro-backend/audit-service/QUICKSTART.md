# Quick Start Guide - Audit Service

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify Prerequisites
- ✅ Java 17+ installed
- ✅ Maven 3.6+ installed
- ✅ MySQL 8.0+ running on localhost:3306

### Step 2: Configure Database
The database will be created automatically, but ensure MySQL is running with:
- **Username**: root
- **Password**: root

Or update `src/main/resources/application.properties` with your credentials.

### Step 3: Build the Project
```bash
cd audit-service
mvn clean install
```

### Step 4: Run the Application
```bash
mvn spring-boot:run
```

The service will start on **http://localhost:8086**

### Step 5: Verify Installation
Open your browser and go to:
```
http://localhost:8086/swagger-ui.html
```

You should see the Swagger UI with all API endpoints.

---

## 🧪 Test the APIs

### Test 1: Create an Audit Trail Entry
```bash
curl -X POST http://localhost:8086/api/audit/add \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "FIR",
    "recordId": 1,
    "action": "CREATED",
    "changedBy": 1,
    "afterState": "{\"id\":1,\"status\":\"Open\"}",
    "remarks": "Test audit entry"
  }'
```

### Test 2: Get All Audit Trails
```bash
curl http://localhost:8086/api/audit/logs
```

### Test 3: Create an API Request Log
```bash
curl -X POST http://localhost:8086/api/requests/log \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "endpointUrl": "/api/fir/create",
    "httpMethod": "POST",
    "ipAddress": "192.168.1.100",
    "requestBody": "{\"complaint\":\"Sample\"}",
    "responseCode": 201,
    "executionTimeMs": 250
  }'
```

### Test 4: Get All API Request Logs
```bash
curl http://localhost:8086/api/requests/logs
```

---

## 📊 Verify Database Tables

Connect to MySQL and run:
```sql
USE auditDB;
SHOW TABLES;
```

You should see:
- `audit_trail`
- `api_request_log`

Check data:
```sql
SELECT * FROM audit_trail;
SELECT * FROM api_request_log;
```

---

## 🔗 Integration with Other Services

### For complaintandfir-service:

1. **Add to application.properties:**
```properties
audit.service.url=http://localhost:8086
```

2. **Copy the Feign Client** from `audit-service/src/.../client/AuditClient.java` to your service

3. **Use in your service:**
```java
@Autowired
private AuditClient auditClient;

// Log audit trail
auditClient.createAuditTrail(auditRequest);

// Log API request
auditClient.logAPIRequest(requestLog);
```

See `INTEGRATION_GUIDE.md` for complete details.

---

## 📝 Available Endpoints

### Audit Trail APIs
- `POST /api/audit/add` - Create audit entry
- `GET /api/audit/logs` - Get all audit logs
- `GET /api/audit/logs/{id}` - Get specific audit log
- `GET /api/audit/logs/table/{tableName}` - Get logs by table
- `GET /api/audit/logs/table/{tableName}/record/{recordId}` - Get logs by table and record
- `GET /api/audit/logs/user/{userId}` - Get logs by user
- `GET /api/audit/logs/action/{action}` - Get logs by action
- `GET /api/audit/logs/date-range` - Get logs by date range

### API Request Log APIs
- `POST /api/requests/log` - Create API request log
- `GET /api/requests/logs` - Get all request logs
- `GET /api/requests/logs/{id}` - Get specific request log
- `GET /api/requests/logs/user/{userId}` - Get logs by user
- `GET /api/requests/logs/endpoint` - Get logs by endpoint
- `GET /api/requests/logs/method/{method}` - Get logs by HTTP method
- `GET /api/requests/logs/date-range` - Get logs by date range
- `GET /api/requests/logs/response-code/{code}` - Get logs by response code
- `GET /api/requests/logs/ip/{ipAddress}` - Get logs by IP

---

## 🛠️ Common Issues & Solutions

### Issue: Port 8086 already in use
**Solution**: Change port in `application.properties`:
```properties
server.port=8087
```

### Issue: Cannot connect to MySQL
**Solution**: 
1. Verify MySQL is running: `mysql -u root -p`
2. Update credentials in `application.properties`

### Issue: Build fails
**Solution**: 
1. Ensure Java 17+ is installed: `java -version`
2. Clean and rebuild: `mvn clean install -U`

---

## 📚 Next Steps

1. ✅ Service is running on port 8086
2. ⏳ Integrate with `complaintandfir-service` (See INTEGRATION_GUIDE.md)
3. ⏳ Integrate with `investigation-service` (See INTEGRATION_GUIDE.md)
4. ⏳ Test end-to-end: Make API calls to other services and verify audit logs

---

## 🎯 Success Criteria

You've successfully set up the audit-service when:
1. ✅ Service starts without errors
2. ✅ Swagger UI is accessible
3. ✅ Can create audit trail entries via API
4. ✅ Can create API request logs via API
5. ✅ Data is visible in MySQL database
6. ✅ Other services can call audit-service APIs

---

## 📞 Support

For detailed documentation:
- See `README.md` for complete documentation
- See `INTEGRATION_GUIDE.md` for integration examples
- Check Swagger UI at http://localhost:8086/swagger-ui.html
