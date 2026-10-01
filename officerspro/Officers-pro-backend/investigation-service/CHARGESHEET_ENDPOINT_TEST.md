# ChargeSheet Integration - Investigation Endpoint Testing Guide

## 🎯 Endpoint Implemented

### Investigation Summary Endpoint
**URL:** `GET /api/investigation/chargesheet/{firId}`

**Port:** 8083

**Example Request:**
```
GET http://localhost:8083/api/investigation/chargesheet/FIR_MH_PNE_2025_000001
```

## 📋 Response Format

```json
{
  "investigationId": "INV/MH/PNE/2025/000789",
  "firId": "FIR_MH_PNE_2025_000123",
  "caseId": "CASE/MH/PNE/2025/000123",
  "investigatingOfficer": {
    "officerId": 1,
    "name": "Officer ID: 1",
    "designation": "Investigating Officer",
    "badgeNumber": "BADGE-1",
    "contactNumber": "N/A",
    "email": "officer1@police.gov.in"
  },
  "investigationStatus": "IN_PROGRESS",
  "caseDiary": [
    {
      "entryId": 1,
      "entryDate": "2025-11-10T18:30:00",
      "entryType": "CASE_DIARY",
      "description": "Investigation initiated",
      "location": "N/A",
      "officerId": 1,
      "officerName": "Officer ID: 1"
    }
  ],
  "evidences": [
    {
      "evidenceId": 1,
      "evidenceCode": "EVD/MH/PNE/2025/0001",
      "evidenceType": "DOCUMENT",
      "description": "Digital evidence collected",
      "location": "Crime scene",
      "collectedBy": "Officer 1",
      "collectedOn": "2025-11-10T18:00:00",
      "storageLocation": "Evidence Room",
      "documentPath": "/uploads/evidence/doc1.pdf",
      "pageCount": 0
    }
  ]
}
```

## 🧪 Testing Steps

### Option 1: Using cURL

```bash
# Test with a FIR ID that has investigation data
curl http://localhost:8083/api/investigation/chargesheet/FIR_MH_PNE_2025_000001

# Test with non-existent FIR (should return 404)
curl -v http://localhost:8083/api/investigation/chargesheet/FIR_INVALID
```

### Option 2: Using Postman/Thunder Client

1. **Create a GET request**
   - URL: `http://localhost:8083/api/investigation/chargesheet/{firId}`
   - Method: GET
   - Replace `{firId}` with actual FIR ID

2. **Send the request**

3. **Expected responses:**
   - **200 OK**: Investigation found with data
   - **404 Not Found**: No investigation for that FIR
   - **500 Internal Server Error**: Server error

### Option 3: Using Browser

Simply visit: `http://localhost:8083/api/investigation/chargesheet/FIR_MH_PNE_2025_000001`

### Option 4: Swagger UI

1. Start the investigation service
2. Visit: `http://localhost:8083/swagger-ui/index.html`
3. Find the "Investigation Management" section
4. Look for the `/api/investigation/chargesheet/{firId}` endpoint
5. Click "Try it out"
6. Enter a FIR ID
7. Click "Execute"

## 📊 Test Data Requirements

For the endpoint to return data, you need:

1. **An Investigation record** with the FIR ID
   - Table: `Investigation`
   - Column: `fir_id`

2. **Optional Case Diary entries**
   - Table: `CaseDiary`
   - Linked by: `investigation_id`

3. **Optional Evidence records**
   - Table: `Evidence`
   - Linked by: `investigation_id`

## 🔧 Sample SQL to Create Test Data

```sql
-- Insert Investigation
INSERT INTO Investigation (fir_id, officer_id, assigned_on, status, description, created_by, created_on)
VALUES ('FIR_MH_PNE_2025_000001', 1, NOW(), 'IN_PROGRESS', 'Investigation started', 1, NOW());

-- Get the investigation ID
SET @inv_id = LAST_INSERT_ID();

-- Insert Case Diary Entry
INSERT INTO CaseDiary (investigation_id, entry_date, entry_text, created_by, created_on)
VALUES (@inv_id, NOW(), 'Investigation initiated. Evidence collection in progress.', 1, NOW());

-- Insert Evidence
INSERT INTO Evidence (investigation_id, evidence_name, description, evidence_type, location_found, collected_by, collected_on, created_by, created_on)
VALUES (@inv_id, 'Digital Evidence', 'Laptop seized from suspect', 'ELECTRONIC', 'Suspect residence', 'Officer 1', NOW(), 1, NOW());
```

## ✅ Verification Checklist

- [ ] Service starts successfully on port 8083
- [ ] Endpoint is accessible at `/api/investigation/chargesheet/{firId}`
- [ ] Returns 200 OK with valid FIR ID that has investigation
- [ ] Returns 404 Not Found for FIR with no investigation
- [ ] Response includes all required fields:
  - [ ] investigationId
  - [ ] firId
  - [ ] caseId
  - [ ] investigatingOfficer (object)
  - [ ] investigationStatus
  - [ ] caseDiary (array)
  - [ ] evidences (array)
- [ ] Logs show proper debug messages
- [ ] Swagger UI documentation is accessible

## 🔍 Debugging Tips

1. **Check service logs:**
   ```
   Look for:
   - "🔍 ChargeSheet Controller: Received request for FIR ID: ..."
   - "🔍 Getting investigation summary for ChargeSheet - FIR ID: ..."
   - "✅ Found investigation ID: ..."
   - "📖 Found X case diary entries"
   - "🔬 Found X evidence items"
   ```

2. **Verify database:**
   ```sql
   -- Check if investigation exists
   SELECT * FROM Investigation WHERE fir_id = 'FIR_MH_PNE_2025_000001';
   
   -- Check case diary
   SELECT * FROM CaseDiary WHERE investigation_id = 1;
   
   -- Check evidence
   SELECT * FROM Evidence WHERE investigation_id = 1;
   ```

3. **Common issues:**
   - **404 Response**: No investigation exists for the FIR ID
   - **Empty arrays**: No case diary or evidence linked to investigation
   - **Connection refused**: Service not running on port 8083

## 📝 TODO Items (For Future Enhancement)

The following items are marked as TODO and will need integration with other services:

1. **Officer Service Integration:**
   - Fetch real officer name, designation, badge number, contact, email
   - Currently showing placeholder: "Officer ID: X"

2. **Case Diary Enhancements:**
   - Add location field to CaseDiary entity
   - Fetch officer details from officer service

3. **Evidence Enhancements:**
   - Add storage location field to Evidence entity
   - Calculate page count for documents
   - Generate proper evidence codes from service

## 🎉 What's Been Implemented

✅ **Investigation ChargeSheet Endpoint** - Complete
✅ **Service Layer** - Implemented with full data mapping
✅ **Controller Layer** - Added with proper error handling
✅ **DTO Mapping** - All ChargeSheet DTOs properly mapped
✅ **Database Queries** - Fetching investigation, case diary, and evidence
✅ **Logging** - Comprehensive debug and info logs
✅ **Swagger Documentation** - Endpoint documented

## 🔗 Related Endpoints

- **FIR Endpoint**: `GET http://localhost:8081/api/victim/chargesheet/fir/{firId}` (Complaint Service)
- **Investigation Endpoint**: `GET http://localhost:8083/api/investigation/chargesheet/{firId}` (This endpoint)
- **Case Diary Endpoint**: `GET http://localhost:8083/api/getCaseDiary/{firId}` (Frontend integration)

## 📞 Next Steps

1. Test the endpoint with sample data
2. Integrate with ChargeSheet service (if separate service exists)
3. Implement officer service integration for real officer details
4. Add validation and error handling as needed
5. Consider adding pagination for large case diary and evidence lists
