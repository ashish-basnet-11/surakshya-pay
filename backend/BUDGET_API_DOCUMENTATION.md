# Budget API Documentation

## Overview

The enhanced budget system provides comprehensive budget management functionality with real-time tracking, progress monitoring, and automatic updates based on transactions.

## Features

### Core Budget Management
- **Create Budgets**: Set up budgets with custom names, descriptions, categories, and amounts
- **Budget Types**: Support for expense, savings, and investment budgets
- **Visual Customization**: Custom colors and icons for each budget
- **Status Tracking**: Automatic status updates (active, warning, completed)
- **Progress Monitoring**: Real-time progress calculation and remaining amount tracking

### Automatic Integration
- **Transaction Sync**: Automatic budget updates when transactions are created
- **Category Matching**: Budgets are updated based on transaction categories
- **Real-time Progress**: Budget progress is calculated from actual transaction data

### Advanced Features
- **Budget Summary**: Comprehensive overview of all budgets
- **Category Grouping**: Budgets grouped by category with aggregated progress
- **Filtering & Sorting**: Filter budgets by status, type, and category
- **Soft Delete**: Budgets are marked inactive rather than deleted

## API Endpoints

### 1. Create Budget
```http
POST /budgets/
```

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
    "remaining_amount": 500.0,
    "progress_percentage": 0.0,
    "is_over_budget": false
  }
}
```

### 2. Get All Budgets
```http
GET /budgets/?status=active&budget_type=expense&category=Food&skip=0&limit=10
```

**Query Parameters:**
- `status`: Filter by status (active, warning, completed)
- `budget_type`: Filter by type (expense, savings, investment)
- `category`: Filter by category
- `skip`: Number of records to skip (pagination)
- `limit`: Maximum number of records to return

### 3. Get Budget Summary
```http
GET /budgets/summary
```

**Response:**
```json
{
  "success": true,
  "message": "Budget summary fetched successfully",
  "data": {
    "total_budgets": 8,
    "total_budget_amount": 3050.0,
    "total_spent_amount": 1863.23,
    "total_remaining_amount": 1186.77,
    "active_budgets": 6,
    "warning_budgets": 1,
    "completed_budgets": 1,
    "budget_usage_percentage": 61.09,
    "on_track_percentage": 75.0
  }
}
```

### 4. Get Budgets by Category
```http
GET /budgets/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Budget categories fetched successfully",
  "data": [
    {
      "name": "Food",
      "budget_amount": 500.0,
      "spent_amount": 342.5,
      "color": "#FF6B6B",
      "progress": 68.5
    },
    {
      "name": "Transport",
      "budget_amount": 200.0,
      "spent_amount": 145.75,
      "color": "#4ECDC4",
      "progress": 72.88
    }
  ]
}
```

### 5. Get Specific Budget
```http
GET /budgets/{budget_id}
```

### 6. Update Budget
```http
PUT /budgets/{budget_id}
```

**Request Body:**
```json
{
  "budget_amount": 600.0,
  "description": "Updated monthly food budget",
  "color": "#FF8A80"
}
```

### 7. Delete Budget (Soft Delete)
```http
DELETE /budgets/{budget_id}
```

### 8. Refresh Budget Progress
```http
POST /budgets/{budget_id}/refresh
```

### 9. Refresh All Budgets
```http
POST /budgets/refresh-all
```

## Budget Model

### Database Schema
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR,
    category VARCHAR,
    budget_amount FLOAT NOT NULL,
    spent_amount FLOAT DEFAULT 0.0,
    budget_type VARCHAR DEFAULT 'expense',
    status VARCHAR DEFAULT 'active',
    color VARCHAR DEFAULT '#4CAF50',
    icon VARCHAR DEFAULT 'wallet',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Budget Types
- **expense**: Regular spending budgets
- **savings**: Savings goal budgets
- **investment**: Investment-related budgets

### Budget Status
- **active**: Budget is active and under 90% usage
- **warning**: Budget is between 90-100% usage
- **completed**: Budget has reached or exceeded 100% usage

## Integration with Transactions

### Automatic Budget Updates
When transactions are created, budgets are automatically updated:

1. **Withdrawal Transactions**: Update budgets based on transaction category
2. **Transfer Transactions**: Update sender's budgets for outgoing transfers
3. **Category Matching**: Only budgets with matching categories are updated
4. **Amount Calculation**: Only negative amounts (expenses) update budgets

### Transaction Categories
Common transaction categories that map to budgets:
- Food, Transport, Entertainment, Shopping, Bills, Healthcare, Savings, Investment

## Usage Examples

### Creating a Monthly Food Budget
```python
budget_data = {
    "name": "Monthly Food Budget",
    "description": "Budget for groceries and dining out",
    "category": "Food",
    "budget_amount": 500.0,
    "budget_type": "expense",
    "color": "#FF6B6B",
    "icon": "restaurant",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
}

response = requests.post("/budgets/", json=budget_data)
```

### Monitoring Budget Progress
```python
# Get budget summary
summary = requests.get("/budgets/summary")

# Get specific budget with progress
budget = requests.get("/budgets/1")

# Check if budget is over limit
if budget["data"]["is_over_budget"]:
    print("Budget exceeded!")
```

### Filtering Budgets
```python
# Get only active expense budgets
active_budgets = requests.get("/budgets/?status=active&budget_type=expense")

# Get budgets for specific category
food_budgets = requests.get("/budgets/?category=Food")
```

## Migration

### Running Database Migration
```bash
cd backend
python -m app.database.migrations.update_budget_table
```

### Populating Sample Data
```bash
cd backend
python -m app.database.migrations.populate_sample_budgets
```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Budget not found",
  "data": null
}
```

### Validation Errors
- Budget amount must be greater than 0
- Start date must be before end date
- Category is required
- Budget name is required

## Best Practices

1. **Category Consistency**: Use consistent category names across budgets and transactions
2. **Regular Monitoring**: Use the summary endpoint to monitor overall budget health
3. **Progress Refresh**: Manually refresh budget progress when needed
4. **Soft Deletes**: Use soft delete to maintain budget history
5. **Color Coding**: Use distinct colors for different budget categories

## Frontend Integration

The budget system is designed to work seamlessly with the wallet.tsx frontend, providing:
- Real-time budget progress visualization
- Category-based budget grouping
- Status-based filtering and sorting
- Comprehensive budget summary dashboard
- Automatic updates from transaction data 