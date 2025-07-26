"""
Migration script to fix budget table structure
Run this script to ensure the budgets table has all required columns
"""

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_budget_table():
    """Fix budget table structure"""
    
    # Create database engine
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as connection:
        # Check if table exists and create if needed
        check_table_query = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'budgets'
        );
        """
        
        result = connection.execute(text(check_table_query))
        table_exists = result.scalar()
        
        if not table_exists:
            print("Creating budgets table...")
            create_table_query = """
            CREATE TABLE budgets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                budget_amount FLOAT NOT NULL,
                spent_amount FLOAT DEFAULT 0.0,
                budget_type VARCHAR(20) DEFAULT 'expense',
                status VARCHAR(20) DEFAULT 'active',
                color VARCHAR(7) DEFAULT '#4CAF50',
                icon VARCHAR(50) DEFAULT 'wallet',
                start_date DATE DEFAULT CURRENT_DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER REFERENCES users(id)
            );
            """
            connection.execute(text(create_table_query))
            print("Budgets table created successfully!")
        else:
            print("Budgets table already exists. Checking columns...")
            
            # Add missing columns if they don't exist
            migration_queries = [
                # Add name column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS name VARCHAR(255)",
                
                # Add description column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS description TEXT",
                
                # Add category column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS category VARCHAR(100)",
                
                # Rename amount to budget_amount if needed
                "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='budgets' AND column_name='amount') THEN ALTER TABLE budgets RENAME COLUMN amount TO budget_amount; END IF; END $$;",
                
                # Add spent_amount column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS spent_amount FLOAT DEFAULT 0.0",
                
                # Add budget_type column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS budget_type VARCHAR(20) DEFAULT 'expense'",
                
                # Add status column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'",
                
                # Add color column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#4CAF50'",
                
                # Add icon column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'wallet'",
                
                # Add start_date column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE",
                
                # Add end_date column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS end_date DATE",
                
                # Add created_at column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                
                # Add updated_at column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
                
                # Add user_id column if it doesn't exist
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id INTEGER",
                
                # Add foreign key constraint if it doesn't exist
                "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='budgets_user_id_fkey') THEN ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id); END IF; END $$;",
                
                # Make name NOT NULL if it's not already
                "ALTER TABLE budgets ALTER COLUMN name SET NOT NULL",
                
                # Make budget_amount NOT NULL if it's not already
                "ALTER TABLE budgets ALTER COLUMN budget_amount SET NOT NULL",
                
                # Update existing records to have default values if NULL
                "UPDATE budgets SET name = category WHERE name IS NULL",
                "UPDATE budgets SET description = CONCAT('Budget for ', category) WHERE description IS NULL",
                "UPDATE budgets SET budget_type = 'expense' WHERE budget_type IS NULL",
                "UPDATE budgets SET status = 'active' WHERE status IS NULL",
                "UPDATE budgets SET color = '#4CAF50' WHERE color IS NULL",
                "UPDATE budgets SET icon = 'wallet' WHERE icon IS NULL",
                "UPDATE budgets SET start_date = CURRENT_DATE WHERE start_date IS NULL",
            ]
            
            for query in migration_queries:
                try:
                    connection.execute(text(query))
                    print(f"Executed: {query[:50]}...")
                except Exception as e:
                    print(f"Error executing {query[:50]}...: {e}")
        
        connection.commit()
        print("Budget table migration completed successfully!")

if __name__ == "__main__":
    fix_budget_table() 