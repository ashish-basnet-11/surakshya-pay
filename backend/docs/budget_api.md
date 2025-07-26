# Budget API Documentation

## Overview
The Budget API provides comprehensive budget management functionality including creation, tracking, analytics, and reporting. The API supports multiple budget types, status tracking, and automatic updates based on transactions.

## Base URL
```
/api/v1/budgets
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Data Models

### Budget Status
- `active` - Budget is active and being tracked
- `warning` - Budget is at 90% or more of the limit
- `completed` - Budget has been fully spent
- `expired` - Budget period has ended

### Budget Type
- `expense` - Regular expense budget
- `savings` - Savings goal budget
- `investment` - Investment budget

## Endpoints

### 1. Create Budget
**POST** `/api/v1/budgets/`

Creates a new budget for the authenticated user.

**Request Body:**
```json
{
  "name": "Food & Dining",
  "description": "Monthly food budget",
  "category": "Food",
  "budget_amount": 500.0,
  "budget_type": "expense",
  "color": "#FF6B6B",
  "icon": "restaurant",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "id": 1,
    "name": "Food & Dining",
    "description": "Monthly food budget",
    "category": "Food",
    "budget_amount": 500.0,
    "spent_amount": 0.0,
    "budget_type": "expense",
    "status": "active",
    "color": "#FF6B6B",
    "icon": "restaurant",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "remaining": 500.0,
    "progress_percentage": 0.0,
    "is_over_budget": false
  }
}
```

### 2. Get Budgets
**GET** `/api/v1/budgets/`

Retrieves budgets with filtering and sorting options.

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `limit` (int, optional): Maximum number of records (default: 100, max: 1000)
- `status` (string, optional): Filter by status (active, warning, completed, expired)
- `category` (string, optional): Filter by category
- `budget_type` (string, optional): Filter by budget type (expense, savings, investment)
- `sort_by` (string, optional): Sort field (date, amount, name, category, created_at)
- `sort_order` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Budgets fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "description": "Monthly food budget",
      "category": "Food",
      "budget_amount": 500.0,
      "spent_amount": 342.5,
      "budget_type": "expense",
      "status": "active",
      "color": "#FF6B6B",
      "icon": "restaurant",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "user_id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "remaining": 157.5,
      "progress_percentage": 68.5,
      "is_over_budget": false
    }
  ]
}
```

### 3. Search Budgets
**GET** `/api/v1/budgets/search`

Search budgets by name, category, or description.

**Query Parameters:**
- `query` (string, required): Search term
- `skip` (int, optional): Number of records to skip
- `limit` (int, optional): Maximum number of records

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    // Array of matching budgets
  ]
}
```

### 4. Get Budget by ID
**GET** `/api/v1/budgets/{budget_id}`

Retrieves a specific budget by ID.

**Response:**
```json
{
  "success": true,
  "message": "Budget fetched successfully",
  "data": {
    // Single budget object
  }
}
```

### 5. Update Budget
**PUT** `/api/v1/budgets/{budget_id}`

Updates an existing budget.

**Request Body:**
```json
{
  "name": "Updated Food Budget",
  "budget_amount": 600.0,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    // Updated budget object
  }
}
```

### 6. Delete Budget
**DELETE** `/api/v1/budgets/{budget_id}`

Deletes a budget.

**Response:**
```json
{
  "success": true,
  "message": "Budget deleted successfully",
  "data": null
}
```

### 7. Get Budget Summary
**GET** `/api/v1/budgets/summary/overview`

Retrieves comprehensive budget summary and overview.

**Response:**
```json
{
  "success": true,
  "message": "Budget summary fetched successfully",
  "data": {
    "monthly_budget": 3050.0,
    "monthly_spent": 1868.23,
    "monthly_remaining": 1181.77,
    "warning_count": 1,
    "statistics": {
      "total_budgets": 8,
      "active_budgets": 6,
      "warning_budgets": 1,
      "completed_budgets": 1,
      "total_budget_amount": 3050.0,
      "total_spent_amount": 1868.23,
      "total_remaining_amount": 1181.77,
      "budget_usage_percentage": 61.25,
      "on_track_percentage": 75.0
    }
  }
}
```

### 8. Get Budget Statistics
**GET** `/api/v1/budgets/statistics`

Retrieves detailed budget statistics.

**Response:**
```json
{
  "success": true,
  "message": "Budget statistics fetched successfully",
  "data": {
    "total_budgets": 8,
    "active_budgets": 6,
    "warning_budgets": 1,
    "completed_budgets": 1,
    "total_budget_amount": 3050.0,
    "total_spent_amount": 1868.23,
    "total_remaining_amount": 1181.77,
    "budget_usage_percentage": 61.25,
    "on_track_percentage": 75.0
  }
}
```

### 9. Get Complete Analytics
**GET** `/api/v1/budgets/analytics/complete`

Retrieves complete budget analytics including trends and category progress.

**Response:**
```json
{
  "success": true,
  "message": "Budget analytics fetched successfully",
  "data": {
    "category_progress": [
      {
        "category": "Food",
        "budget_amount": 500.0,
        "spent_amount": 342.5,
        "progress_percentage": 68.5,
        "color": "#FF6B6B",
        "is_over_budget": false
      }
    ],
    "trend_data": [
      {
        "date": "2024-01-15",
        "budget": 180.0,
        "spent": 120.0
      }
    ],
    "summary": {
      // Budget summary object
    }
  }
}
```

### 10. Get Category Progress
**GET** `/api/v1/budgets/analytics/category-progress`

Retrieves budget progress by category.

**Query Parameters:**
- `limit` (int, optional): Number of categories to return (default: 5, max: 20)

**Response:**
```json
{
  "success": true,
  "message": "Category progress fetched successfully",
  "data": [
    {
      "category": "Food",
      "budget_amount": 500.0,
      "spent_amount": 342.5,
      "progress_percentage": 68.5,
      "color": "#FF6B6B",
      "is_over_budget": false
    }
  ]
}
```

### 11. Get Trend Data
**GET** `/api/v1/budgets/analytics/trend`

Retrieves budget vs spending trend data.

**Query Parameters:**
- `days` (int, optional): Number of days to analyze (default: 7, max: 30)

**Response:**
```json
{
  "success": true,
  "message": "Trend data fetched successfully",
  "data": [
    {
      "date": "2024-01-15",
      "budget": 180.0,
      "spent": 120.0
    }
  ]
}
```

### 12. Update Budget Spent Amount
**POST** `/api/v1/budgets/{budget_id}/update-spent`

Updates spent amount for a budget (used when transactions occur).

**Query Parameters:**
- `amount` (float, required): Amount to add to spent total

**Response:**
```json
{
  "success": true,
  "message": "Budget spent amount updated successfully",
  "data": {
    // Updated budget object
  }
}
```

### 13. Get Available Statuses
**GET** `/api/v1/budgets/filters/status`

Retrieves available budget statuses.

**Response:**
```json
{
  "success": true,
  "message": "Statuses fetched successfully",
  "data": ["active", "warning", "completed", "expired"]
}
```

### 14. Get Available Types
**GET** `/api/v1/budgets/filters/types`

Retrieves available budget types.

**Response:**
```json
{
  "success": true,
  "message": "Budget types fetched successfully",
  "data": ["expense", "savings", "investment"]
}
```

### 15. Get Available Categories
**GET** `/api/v1/budgets/filters/categories`

Retrieves available budget categories for the user.

**Response:**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Savings", "Investment"]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "detail": "Field validation error details"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Budget not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

## Integration Notes

1. **Automatic Updates**: Budgets are automatically updated when transactions occur in the same category
2. **Status Management**: Budget status is automatically updated based on spent amount:
   - 90%+ spent → Warning status
   - 100%+ spent → Completed status
3. **Real-time Analytics**: All analytics are calculated in real-time based on current data
4. **Transaction Integration**: The system automatically links transactions to budgets based on category matching

## Usage Examples

### Creating a Monthly Food Budget
```bash
curl -X POST "https://api.example.com/api/v1/budgets/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Food Budget",
    "description": "Budget for groceries and dining out",
    "category": "Food",
    "budget_amount": 500.0,
    "budget_type": "expense",
    "color": "#FF6B6B",
    "icon": "restaurant",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }'
```

### Getting Budget Analytics
```bash
curl -X GET "https://api.example.com/api/v1/budgets/analytics/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filtering Budgets by Status
```bash
curl -X GET "https://api.example.com/api/v1/budgets/?status=warning&sort_by=amount&sort_order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
``` 