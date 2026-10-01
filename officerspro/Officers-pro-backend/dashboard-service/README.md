# Dashboard Service

Professional Dashboard Service for Officers Pro System - Aggregates data from all microservices.

## 🚀 Quick Start

```bash
# Build the service
.\mvnw.cmd clean install -DskipTests

# Run the service
.\mvnw.cmd spring-boot:run
```

## 📋 Service Information

- **Port:** 8087
- **Base URL:** http://localhost:8087
- **API Endpoint:** http://localhost:8087/admin
- **Swagger UI:** http://localhost:8087/swagger-ui/index.html
- **Actuator:** http://localhost:8087/actuator

## 🔗 Dependencies

This service communicates with:
- **Complaint/FIR Service** (Port 8082)
- **Investigation Service** (Port 8083)

**Important:** Ensure these services are running before starting the dashboard service.

## 📊 API Endpoints

### Dashboard Statistics

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/admin/total` | GET | Total cases count | String (number) |
| `/admin/active` | GET | Active cases count | String (number) |
| `/admin/completed` | GET | Completed cases count | String (number) |
| `/admin/statements` | GET | Total statements count | String (number) |
| `/admin/all` | GET | List all cases | Array of DashboardCaseDTO |
| `/admin/health` | GET | Health check | String |

### Example Requests

```bash
# Get total cases
curl http://localhost:8087/admin/total

# Get active cases
curl http://localhost:8087/admin/active

# Get completed cases
curl http://localhost:8087/admin/completed

# Get statements count
curl http://localhost:8087/admin/statements

# Get all cases
curl http://localhost:8087/admin/all
```

### Response Examples

**Count Endpoints:**
```json
"42"
```

**All Cases Endpoint:**
```json
[
  {
    "victimName": "John Doe",
    "offenderName": "Jane Smith",
    "firNo": "FIR_MH_PNE_2025_000001",
    "shortDescription": "Cyber crime case involving...",
    "caseStatus": "in progress",
    "created_on": "2025-11-10T10:30:00",
    "complaintId": "CMP_MH_PNE_2025_000001",
    "sections": "Section 420, Section 66"
  }
]
```

## 🏗️ Architecture

### Technology Stack
- **Java 17**
- **Spring Boot 3.1.5**
- **Spring Cloud OpenFeign** - For inter-service communication
- **Swagger/OpenAPI** - API documentation
- **Lombok** - Reduce boilerplate code
- **Maven** - Build tool

### Project Structure
```
dashboard-service/
├── src/main/java/com/configserver/officerspro/dashboardservice/
│   ├── DashboardServiceApplication.java
│   ├── client/
│   │   ├── ComplaintServiceClient.java
│   │   └── InvestigationServiceClient.java
│   ├── config/
│   │   ├── CorsConfig.java
│   │   └── SwaggerConfig.java
│   ├── controller/
│   │   └── DashboardController.java
│   ├── dto/
│   │   ├── DashboardCaseDTO.java
│   │   └── FIRResponseDTO.java
│   └── service/
│       └── DashboardService.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## ⚙️ Configuration

### application.properties

```properties
# Server Configuration
server.port=8087

# Service URLs (modify if services run on different ports)
complaint.service.url=http://localhost:8082
investigation.service.url=http://localhost:8083

# CORS Configuration
cors.allowed.origins=http://localhost:5173,http://localhost:3000

# Logging
logging.level.com.configserver.officerspro.dashboardservice=DEBUG
logging.level.feign=DEBUG
```

## 🔄 How It Works

1. **Frontend Request:** Dashboard UI calls `/admin/total`, `/admin/active`, etc.
2. **Dashboard Service:** Receives request and uses Feign clients
3. **Service Communication:** Calls Complaint and Investigation services
4. **Data Aggregation:** Processes and aggregates data
5. **Response:** Returns formatted data to frontend

### Service Communication Flow

```
Frontend (Port 5173)
    ↓
Dashboard Service (Port 8087)
    ├→ Complaint/FIR Service (Port 8082)
    └→ Investigation Service (Port 8083)
```

## 🎯 Features

✅ **Real-time Statistics**
- Total FIRs count
- Active cases count
- Completed cases count
- Total statements/complaints count

✅ **Case Management**
- List all cases with details
- Filter by status
- View victim and offender information

✅ **Professional Design**
- RESTful API design
- Swagger documentation
- CORS enabled
- Error handling
- Comprehensive logging

✅ **Microservice Architecture**
- Uses Feign for service-to-service communication
- Fault-tolerant with fallbacks
- Configurable timeouts
- Clean separation of concerns

## 🔧 Development

### Build
```bash
.\mvnw.cmd clean install
```

### Run with Debug
```bash
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--debug"
```

### Run Tests
```bash
.\mvnw.cmd test
```

## 🌐 Frontend Integration

### Update Frontend Config

Update `.env` file in `officers_pro-frontend`:

```env
VITE_ADMIN_API=http://localhost:8087
```

### Frontend Dashboard Code

The dashboard already expects these endpoints:
- `request('admin', 'GET', '/total', {})`
- `request('admin', 'GET', '/active', {})`
- `request('admin', 'GET', '/completed', {})`
- `request('admin', 'GET', '/statements', {})`
- `request('admin', 'GET', '/all', {})`

No frontend changes needed - just update the environment variable!

## 📝 Logging

Service provides comprehensive logging:
- Request/Response logging (DEBUG level)
- Feign client calls (DEBUG level)
- Error logging with stack traces
- Service startup confirmation

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8088
```

### Services Not Responding
1. Check if Complaint service is running on port 8082
2. Check if Investigation service is running on port 8083
3. Verify URLs in application.properties

### No Data Returned
1. Ensure FIRs exist in the database
2. Check service logs for Feign errors
3. Verify database connections of dependent services

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8087/admin/health
```

### Actuator Endpoints
```bash
# Health
curl http://localhost:8087/actuator/health

# Info
curl http://localhost:8087/actuator/info

# Metrics
curl http://localhost:8087/actuator/metrics
```

## 🚦 Status Mapping

The service automatically maps FIR statuses:

| FIR Status | Dashboard Status |
|------------|------------------|
| OPEN | in progress |
| IN_PROGRESS | in progress |
| UNDER_INVESTIGATION | in progress |
| CLOSED | completed |
| RESOLVED | completed |
| COMPLETED | completed |

## 📦 Deployment

### Production Configuration

```properties
server.port=8087
complaint.service.url=http://complaint-service:8082
investigation.service.url=http://investigation-service:8083
logging.level.com.configserver.officerspro.dashboardservice=INFO
```

### Docker Support (Future)

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/dashboard-service-1.0.0.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 👥 Team

Built with professionalism using Spring Boot best practices and microservice architecture patterns.

## 📄 License

Part of Officers Pro System
