# 🎯 Frontend Integration Guide

## ✅ Backend is Complete!

The help-support-feedback-service is now **fully functional** with:
- ✅ All REST APIs working
- ✅ Audit logging integrated
- ✅ CORS enabled for frontend access
- ✅ Swagger documentation available

## 🚀 How to Start the Service

```bash
cd help-support-feedback-service
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

**Service URL**: http://localhost:8094  
**Swagger UI**: http://localhost:8094/swagger-ui/index.html

## 📱 Frontend Integration

### 1. **Officer Pro UI** (Port 5173)

#### Update `.env` file:
```env
# Add this line to officers_pro-frontend/.env
VITE_SUPPORT_API=http://localhost:8094/api/support
```

#### Example API Calls:

**Create Support Ticket** (Officer raises issue):
```typescript
// In officers_pro-frontend/src/services/supportService.ts

const createTicket = async (ticketData) => {
  const response = await fetch(`${import.meta.env.VITE_SUPPORT_API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raisedByUserId: officerId,
      subject: ticketData.subject,
      description: ticketData.description,
      createdBy: officerId
    })
  });
  return response.json();
};
```

**Get My Tickets** (Officer views their tickets):
```typescript
const getMyTickets = async (userId) => {
  const response = await fetch(`${import.meta.env.VITE_SUPPORT_API}/tickets/user/${userId}`);
  return response.json();
};
```

**Add Rating** (Officer rates resolved ticket):
```typescript
const addRating = async (ticketId, score, feedback, userId) => {
  const response = await fetch(`${import.meta.env.VITE_SUPPORT_API}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId,
      ratedBy: userId,
      score, // 1-5
      feedback,
      createdBy: userId
    })
  });
  return response.json();
};
```

#### UI Components Needed in Officer Pro:

1. **HelpAndSupport.tsx** - Raise new ticket page
2. **MyTickets.tsx** - View officer's tickets
3. **TicketDetails.tsx** - View ticket with comments
4. **RateSupport.tsx** - Rate resolved ticket

---

### 2. **Admin Dashboard** (Port 3000)

#### API Integration:

**Get All Tickets** (Admin views all support tickets):
```typescript
// In admin-dashboard-frontend/src/api/supportAPI.ts

export const getAllTickets = async (page = 0, size = 10) => {
  const response = await fetch(
    `http://localhost:8094/api/support/tickets?page=${page}&size=${size}`
  );
  return response.json();
};
```

**Assign Ticket** (Admin assigns to support staff):
```typescript
export const assignTicket = async (ticketId, assignedTo, assignedBy) => {
  const response = await fetch(`http://localhost:8094/api/support/tickets/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignedTo,
      assignedBy,
      status: 'IN_PROGRESS'
    })
  });
  return response.json();
};
```

**Add Comment** (Admin/Support staff adds comment):
```typescript
export const addComment = async (ticketId, message, userId) => {
  const response = await fetch('http://localhost:8094/api/support/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId,
      commentedBy: userId,
      message,
      createdBy: userId
    })
  });
  return response.json();
};
```

**Get Ticket Stats** (Admin dashboard stats):
```typescript
export const getOpenTicketsCount = async () => {
  const response = await fetch('http://localhost:8094/api/support/stats/open');
  return response.json();
};
```

#### UI Components Needed in Admin:

1. **SupportDashboard.tsx** - Overview with stats
2. **TicketsList.tsx** - All tickets with filtering
3. **TicketManagement.tsx** - Assign & update status
4. **TicketConversation.tsx** - View/add comments

---

## 📊 Complete API Reference

### Ticket Management
| Endpoint | Method | Description | Used By |
|----------|--------|-------------|---------|
| `/api/support/tickets` | POST | Create ticket | Officer |
| `/api/support/tickets` | GET | Get all tickets | Admin |
| `/api/support/tickets/{id}` | GET | Get ticket details | Both |
| `/api/support/tickets/{id}` | PUT | Update ticket | Admin |
| `/api/support/tickets/{id}` | DELETE | Delete ticket | Admin |
| `/api/support/tickets/status/{status}` | GET | Get by status | Admin |
| `/api/support/tickets/user/{userId}` | GET | Get user tickets | Officer |

### Comments
| Endpoint | Method | Description | Used By |
|----------|--------|-------------|---------|
| `/api/support/comments` | POST | Add comment | Both |
| `/api/support/comments/ticket/{ticketId}` | GET | Get comments | Both |

### Ratings
| Endpoint | Method | Description | Used By |
|----------|--------|-------------|---------|
| `/api/support/ratings` | POST | Add rating | Officer |
| `/api/support/ratings/ticket/{ticketId}` | GET | Get ratings | Both |
| `/api/support/ratings/average/{ticketId}` | GET | Get average | Admin |

### Statistics
| Endpoint | Method | Description | Used By |
|----------|--------|-------------|---------|
| `/api/support/stats/open` | GET | Open tickets count | Admin |

---

## 🎨 Example React Components

### Officer Pro - Create Ticket
```typescript
// officers_pro-frontend/src/pages/HelpAndSupport/CreateTicket.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${import.meta.env.VITE_SUPPORT_API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raisedByUserId: 123, // Get from auth context
        subject,
        description,
        createdBy: 123
      })
    });

    if (response.ok) {
      navigate('/my-tickets');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
      />
      <textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your issue"
      />
      <button type="submit">Submit Ticket</button>
    </form>
  );
}
```

### Admin - Ticket List
```typescript
// admin-dashboard-frontend/src/pages/Support/TicketsList.tsx

import { useEffect, useState } from 'react';

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8094/api/support/tickets')
      .then(res => res.json())
      .then(data => setTickets(data));
  }, []);

  const assignTicket = async (ticketId, staffId) => {
    await fetch(`http://localhost:8094/api/support/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedTo: staffId,
        assignedBy: 1, // Admin ID
        status: 'IN_PROGRESS'
      })
    });
    // Refresh list
  };

  return (
    <div>
      {tickets.map(ticket => (
        <div key={ticket.ticketId}>
          <h3>{ticket.subject}</h3>
          <p>Status: {ticket.status}</p>
          <button onClick={() => assignTicket(ticket.ticketId, 5)}>
            Assign to Staff
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Summary

### Backend (Port 8094) - ✅ READY!
- ✅ All APIs working
- ✅ Audit logging enabled
- ✅ CORS configured for frontends
- ✅ Database tables auto-created
- ✅ Swagger documentation available

### Frontend Integration - ⏳ TODO

#### Officer Pro UI (Port 5173):
1. Add `VITE_SUPPORT_API` to `.env`
2. Create help & support pages
3. Integrate API calls
4. Test ticket creation and rating

#### Admin Dashboard (Port 3000):
1. Create support management section
2. Add ticket assignment UI
3. Add comment/reply functionality
4. Add statistics dashboard

---

## 🎯 Next Steps

1. **Start the service:**
   ```bash
   cd help-support-feedback-service
   mvnw.cmd spring-boot:run
   ```

2. **Test APIs in Swagger:**
   ```
   http://localhost:8094/swagger-ui/index.html
   ```

3. **Integrate with Officer Pro UI:**
   - Add environment variable
   - Create support pages
   - Make API calls

4. **Integrate with Admin UI:**
   - Add admin support section
   - Create ticket management UI
   - Add assignment & commenting

**The backend is fully functional! You can now integrate it with your frontends.** 🎉
