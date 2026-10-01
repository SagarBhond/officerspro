# Subscription Payment Service

## Overview
Standalone microservice for managing officer subscriptions and Razorpay payments.

## Port
**8086**

## Created Files Structure
```
src/main/java/com/configserverllp/officerspro/subscriptionpaymentservice/
├── entity/
│   ├── enums/
│   │   └── SubscriptionType.java
│   ├── OfficerSubscription.java
│   └── PaymentTransaction.java
│
├── repository/
│   ├── OfficerSubscriptionRepository.java
│   └── PaymentTransactionRepository.java
│
├── service/
│   ├── RazorpayService.java
│   ├── SubscriptionService.java
│   ├── EmailService.java
│   └── PaymentHistoryService.java
│
├── controller/
│   ├── PaymentController.java
│   ├── SubscriptionController.java
│   └── PaymentHistoryController.java
│
├── dto/
│   ├── OfficerPaymentHistoryDto.java
│   └── AdminPaymentHistoryDto.java
│
└── SubscriptionpaymentserviceApplication.java
```

## API Endpoints

### Payment APIs (Port 8086)
- **POST** `/api/payments/create-subscription-order?email={email}&planType={planType}`
  - Creates Razorpay order for subscription purchase
  
- **POST** `/api/payments/verify-subscription`
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
  - Verifies payment and activates subscription

### Subscription APIs
- **GET** `/api/subscriptions/status/{email}`
  - Get subscription status for an officer
  
- **GET** `/api/subscriptions/status/all`
  - Get all officer subscriptions (for admin)
  
- **GET** `/api/subscriptions/plans`
  - Get available subscription plans
  
- **POST** `/api/subscriptions/change?email={email}&newPlan={plan}`
  - Change subscription plan
  
- **GET** `/api/subscriptions/validate/{email}`
  - Quick validation - returns `{ isValid: true/false }`

### Payment History APIs
- **GET** `/api/payment-history/officer/{officerId}`
  - Get payment history for specific officer
  
- **GET** `/api/payment-history/admin/all`
  - Get all payment transactions (for admin)

## Database Configuration

### Database Name
`subscription_payment_db` (auto-created)

### Tables
1. **officer_subscription** - Stores officer subscription details
2. **payment_transaction** - Stores all payment records

### Connection Details
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/subscription_payment_db
spring.datasource.username=root
spring.datasource.password=root
```

## Razorpay Configuration
Already configured with your test keys:
```properties
razorpay.key_id=rzp_test_EsHwLQL04BIQh4
razorpay.key_secret=27bl1AQffb77nrxWcRAqplmp
```

## Email Configuration
Update in `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## How to Run

1. **Update Email Config** in `application.properties`

2. **Start MySQL** (make sure it's running on port 3306)

3. **Run the service:**
   ```bash
   cd D:\OFFICERS-PRO-MICROSERVICES\SubscriptionPaymentService
   mvnw spring-boot:run
   ```

4. **Service will start on:** http://localhost:8086

## Next Steps

### 1. Create Initial Officer Subscriptions
When an officer is created in ProfileService, call:
```
POST http://localhost:8086/api/subscriptions/initialize
Body: {
  "officerId": "officer_xyz",
  "officerEmail": "officer@example.com",
  "adminEmail": "admin@example.com"
}
```
(You need to create this endpoint or manually insert records)

### 2. Update Frontend
Change API base URL from:
- OLD: `http://localhost:8082` (CMS)
- NEW: `http://localhost:8086` (SubscriptionPaymentService)

Update these files:
- Payment order creation
- Payment verification
- Subscription status check

### 3. Update CMS Backend (if needed)
CMS can call this service to validate subscriptions:
```java
String url = "http://localhost:8086/api/subscriptions/validate/" + email;
ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
boolean isValid = (boolean) response.getBody().get("isValid");
```

## Features Working

✅ Razorpay payment order creation  
✅ Payment verification with signature  
✅ Subscription activation after payment  
✅ Email confirmation after payment  
✅ Subscription validation  
✅ Payment history tracking  
✅ All subscription plans (FREE, ONE_MONTH, THREE_MONTHS, SIX_MONTHS, TWELVE_MONTHS)

## Testing

Test payment flow:
1. Create order: `POST /api/payments/create-subscription-order`
2. Complete payment on Razorpay (test mode)
3. Verify payment: `POST /api/payments/verify-subscription`
4. Check subscription: `GET /api/subscriptions/status/{email}`

---

**Service is ready to use!** 🚀
