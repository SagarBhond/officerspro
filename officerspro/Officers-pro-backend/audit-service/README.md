<<<<<<< HEAD
# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact
=======
# Audit Service - OfficerPro

## Overview
Centralized audit trail and API monitoring service for the OfficerPro project. This service maintains transparency, accountability, and traceability across all modules.

## Features
- ✅ **Audit Trail Management**: Track all data modifications (Create, Update, Delete) across the system
- ✅ **API Request Logging**: Monitor and log all API requests with complete details
- ✅ **RESTful APIs**: Comprehensive endpoints for querying audit logs and request logs
- ✅ **Flexible Filtering**: Filter logs by user, date range, table, action type, HTTP method, etc.

## Technology Stack
- **Java**: 17
- **Spring Boot**: 3.5.4
- **Spring Data JPA**: Database operations
- **MySQL**: Database
- **MapStruct**: DTO mapping
- **Lombok**: Reduce boilerplate code
- **Swagger/OpenAPI**: API documentation
- **Maven**: Dependency management

## Database Schema

### 1. AuditTrail Table
Tracks all data modifications across the system.

| Field        | Type     | Description                          |
|--------------|----------|--------------------------------------|
| audit_id     | BIGINT   | Primary key (auto-increment)         |
| table_name   | VARCHAR  | Name of the modified table           |
| record_id    | BIGINT   | ID of the modified record            |
| action       | ENUM     | CREATED, UPDATED, DELETED            |
| changed_by   | BIGINT   | User ID who made the change          |
| changed_on   | DATETIME | Timestamp of change                  |
| before_state | JSON     | Optional: Previous record state      |
| after_state  | JSON     | Optional: New record state           |
| remarks      | TEXT     | Optional: Reason for change          |

### 2. APIRequestLog Table
Logs all API requests for monitoring and analysis.

| Field              | Type     | Description                     |
|--------------------|----------|---------------------------------|
| request_id         | BIGINT   | Primary key (auto-increment)    |
| user_id            | BIGINT   | User who made the request       |
| endpoint_url       | VARCHAR  | API endpoint path               |
| http_method        | ENUM     | GET, POST, PUT, DELETE, PATCH   |
| request_time       | DATETIME | Request timestamp               |
| ip_address         | VARCHAR  | Source IP address               |
| mac_address        | VARCHAR  | Source MAC address              |
| request_body       | TEXT     | Request payload                 |
| response_code      | INT      | HTTP response code              |
| response_body      | TEXT     | Optional: Response payload      |
| execution_time_ms  | BIGINT   | API execution time in ms        |

## Configuration

### Application Properties
```properties
server.port=8086
spring.datasource.url=jdbc:mysql://localhost:3306/auditDB?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

## REST API Endpoints

### Audit Trail APIs

#### Create Audit Entry
```
POST /api/audit/add
Content-Type: application/json

{
  "tableName": "FIR",
  "recordId": 123,
  "action": "CREATED",
  "changedBy": 1,
  "beforeState": null,
  "afterState": "{\"id\":123,\"status\":\"Open\"}",
  "remarks": "New FIR created"
}
```

#### Get All Audit Logs
```
GET /api/audit/logs
```

#### Get Audit Logs by Table Name
```
GET /api/audit/logs/table/{tableName}
```

#### Get Audit Logs by Table and Record ID
```
GET /api/audit/logs/table/{tableName}/record/{recordId}
```

#### Get Audit Logs by User
```
GET /api/audit/logs/user/{userId}
```

#### Get Audit Logs by Action
```
GET /api/audit/logs/action/{action}
```

#### Get Audit Logs by Date Range
```
GET /api/audit/logs/date-range?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
```

### API Request Log APIs

#### Create API Request Log
```
POST /api/requests/log
Content-Type: application/json

{
  "userId": 1,
  "endpointUrl": "/api/fir/create",
  "httpMethod": "POST",
  "ipAddress": "192.168.1.100",
  "macAddress": "00:1B:44:11:3A:B7",
  "requestBody": "{\"complaint\":\"Sample\"}",
  "responseCode": 201,
  "responseBody": "{\"id\":123}",
  "executionTimeMs": 250
}
```

#### Get All API Request Logs
```
GET /api/requests/logs
```

#### Get API Request Logs by User
```
GET /api/requests/logs/user/{userId}
```

#### Get API Request Logs by Endpoint
```
GET /api/requests/logs/endpoint?endpointUrl=/api/fir/create
```

#### Get API Request Logs by HTTP Method
```
GET /api/requests/logs/method/{httpMethod}
```

#### Get API Request Logs by Date Range
```
GET /api/requests/logs/date-range?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59
```

#### Get API Request Logs by Response Code
```
GET /api/requests/logs/response-code/{responseCode}
```

#### Get API Request Logs by IP Address
```
GET /api/requests/logs/ip/{ipAddress}
```

## Running the Service

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Steps
1. **Clone the repository**
   ```bash
   cd audit-service
   ```

2. **Configure database**
   - Update `application.properties` with your MySQL credentials
   - The database `auditDB` will be created automatically

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Access Swagger UI**
   ```
   http://localhost:8086/swagger-ui.html
   ```

## Integration with Other Services

To integrate with `complaintandfir-service` and `investigation-service`, you can:

1. **Use Feign Client** to call audit-service endpoints
2. **Create an interceptor** to automatically log all API requests
3. **Use AOP** to intercept service methods and log data changes

### Example Integration (Feign Client)
```java
@FeignClient(name = "audit-service", url = "http://localhost:8086")
public interface AuditClient {
    
    @PostMapping("/api/audit/add")
    void createAuditTrail(@RequestBody AuditTrailRequestDTO request);
    
    @PostMapping("/api/requests/log")
    void logAPIRequest(@RequestBody APIRequestLogRequestDTO request);
}
```

## Future Enhancements
- 🔄 OfficerTransferLog table
- 🔄 FIRReassignment table
- 🔄 Advanced analytics and reporting
- 🔄 Real-time monitoring dashboard
- 🔄 Automated alerting for suspicious activities

## API Documentation
Swagger documentation is available at: `http://localhost:8086/swagger-ui.html`

## Support
For any issues or questions, please contact the development team.
>>>>>>> master
