# Budget Management System

## Overview
The Budget Management System is a comprehensive solution for tracking, managing, and analyzing personal budgets. It provides real-time budget tracking, automatic status updates, detailed analytics, and seamless integration with the transaction system.

## Features

### Core Budget Management
- **Budget Creation**: Create budgets with custom names, descriptions, categories, and amounts
- **Budget Types**: Support for expense, savings, and investment budgets
- **Status Tracking**: Automatic status updates (active, warning, completed, expired)
- **Visual Customization**: Custom colors and icons for each budget
- **Date Range Support**: Set start and end dates for budget periods

### Advanced Analytics
- **Real-time Progress Tracking**: Live updates of budget progress and remaining amounts
- **Category-based Analytics**: Group and analyze budgets by category
- **Trend Analysis**: Historical spending vs budget trends
- **Statistical Overview**: Comprehensive budget statistics and insights
- **Performance Metrics**: On-track percentage and budget usage analytics

### Smart Integration
- **Transaction Linking**: Automatic budget updates when transactions occur
- **Category Matching**: Intelligent linking of transactions to budgets based on categories
- **Status Management**: Automatic status changes based on spending patterns
- **Real-time Updates**: Instant budget updates without manual intervention

### User Experience
- **Search & Filter**: Advanced search and filtering capabilities
- **Sorting Options**: Multiple sorting options (date, amount, name, category)
- **Pagination**: Efficient data loading with pagination support
- **Responsive Design**: Mobile-friendly API design

## Database Schema

### Budget Table
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    budget_amount FLOAT NOT NULL,
    spent_amount FLOAT DEFAULT 0.0,
    budget_type VARCHAR(20) DEFAULT 'expense',
    status VARCHAR(20) DEFAULT 'active',
    color VARCHAR(7) DEFAULT '#4CAF50',
    icon VARCHAR(50) DEFAULT 'wallet',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);
```

### Budget Status Values
- `active`: Budget is active and being tracked
- `warning`: Budget is at 90% or more of the limit
- `completed`: Budget has been fully spent
- `expired`: Budget period has ended

### Budget Type Values
- `expense`: Regular expense budget
- `savings`: Savings goal budget
- `investment`: Investment budget

## API Endpoints

### Core Budget Operations
- `POST /api/v1/budgets/` - Create a new budget
- `GET /api/v1/budgets/` - Get budgets with filtering and sorting
- `GET /api/v1/budgets/{id}` - Get a specific budget
- `PUT /api/v1/budgets/{id}` - Update a budget
- `DELETE /api/v1/budgets/{id}` - Delete a budget

### Search & Filter
- `GET /api/v1/budgets/search` - Search budgets by name, category, or description
- `GET /api/v1/budgets/filters/status` - Get available statuses
- `GET /api/v1/budgets/filters/types` - Get available budget types
- `GET /api/v1/budgets/filters/categories` - Get available categories

### Analytics & Reporting
- `GET /api/v1/budgets/summary/overview` - Get budget summary and overview
- `GET /api/v1/budgets/statistics` - Get detailed budget statistics
- `GET /api/v1/budgets/analytics/complete` - Get complete analytics
- `GET /api/v1/budgets/analytics/category-progress` - Get category progress
- `GET /api/v1/budgets/analytics/trend` - Get trend data

### Budget Updates
- `POST /api/v1/budgets/{id}/update-spent` - Update spent amount

## Installation & Setup

### 1. Database Migration
Run the migration script to update the database schema:
```bash
cd backend
python -m app.database.migrations.update_budget_table
```

### 2. Seed Sample Data (Optional)
Add sample budget data for testing:
```bash
cd backend
python -m app.database.seed_budget_data
```

### 3. Start the Server
```bash
cd backend
uvicorn main:app --reload
```

## Usage Examples

### Creating a Budget
```python
import requests

# Create a new food budget
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

response = requests.post(
    "http://localhost:8000/api/v1/budgets/",
    json=budget_data,
    headers={"Authorization": f"Bearer {token}"}
)
```

### Getting Budget Analytics
```python
# Get complete budget analytics
response = requests.get(
    "http://localhost:8000/api/v1/budgets/analytics/complete",
    headers={"Authorization": f"Bearer {token}"}
)

analytics = response.json()["data"]
print(f"Total budgets: {analytics['summary']['statistics']['total_budgets']}")
print(f"Monthly spent: ${analytics['summary']['monthly_spent']}")
```

### Filtering Budgets
```python
# Get warning budgets sorted by amount
response = requests.get(
    "http://localhost:8000/api/v1/budgets/?status=warning&sort_by=amount&sort_order=desc",
    headers={"Authorization": f"Bearer {token}"}
)
```

## Integration with Transactions

The budget system automatically integrates with the transaction system:

1. **Automatic Updates**: When a transaction is created, the system automatically updates relevant budgets
2. **Category Matching**: Transactions are linked to budgets based on category matching
3. **Status Updates**: Budget status is automatically updated based on spending patterns
4. **Real-time Tracking**: All budget progress is updated in real-time

### Transaction Integration Flow
```python
# When a transaction is created
def create_transaction(db: Session, transaction: TransactionCreate, user_id: int):
    # Create the transaction
    db_transaction = Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    
    # Automatically update budgets if it's an expense
    if transaction.transaction_type in ['WITHDRAWAL', 'TRANSFER']:
        update_budgets_from_transaction(db, user_id, transaction.category, transaction.amount)
```

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=Budget Management API
```

### Budget Settings
- **Warning Threshold**: 90% of budget amount (configurable)
- **Default Colors**: Predefined color palette for budget categories
- **Icon Library**: Ionicons support for budget icons
- **Status Rules**: Automatic status updates based on spending

## Testing

### Unit Tests
```bash
cd backend
pytest tests/test_budget.py
```

### API Tests
```bash
# Test budget creation
curl -X POST "http://localhost:8000/api/v1/budgets/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Budget", "category": "Test", "budget_amount": 100.0}'

# Test analytics
curl -X GET "http://localhost:8000/api/v1/budgets/analytics/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Considerations

### Database Optimization
- Indexed columns for fast queries
- Efficient joins for analytics
- Pagination for large datasets
- Caching for frequently accessed data

### API Performance
- Lazy loading for large datasets
- Efficient filtering and sorting
- Optimized database queries
- Response compression

## Security

### Authentication
- JWT token-based authentication
- User-specific data isolation
- Secure API endpoints

### Data Validation
- Input validation for all fields
- SQL injection prevention
- XSS protection
- Rate limiting

## Monitoring & Logging

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Budget update tracking

### Metrics
- API response times
- Database query performance
- Budget update frequency
- User activity tracking

## Future Enhancements

### Planned Features
- **Budget Templates**: Predefined budget templates
- **Recurring Budgets**: Automatic budget renewal
- **Budget Sharing**: Share budgets with family members
- **Advanced Analytics**: Machine learning insights
- **Mobile Notifications**: Budget alerts and reminders
- **Export Functionality**: PDF/CSV budget reports
- **Budget Goals**: Goal-based budget tracking
- **Multi-currency Support**: International budget support

### Technical Improvements
- **Real-time Updates**: WebSocket support for live updates
- **Caching Layer**: Redis integration for performance
- **Background Jobs**: Async budget calculations
- **API Versioning**: Better API version management
- **Documentation**: Interactive API documentation

## Support

For questions, issues, or contributions:
- Create an issue in the repository
- Check the API documentation
- Review the code examples
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details. 