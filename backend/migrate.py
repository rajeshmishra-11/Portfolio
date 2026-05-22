import sqlite3
import os

def run_migration():
    # portfolio.db is in the same directory as this migrate.py script
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portfolio.db")
    print(f"Connecting to database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add color column to certificates table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE certificates ADD COLUMN color VARCHAR DEFAULT '#06b6d4' NOT NULL;")
        print("Successfully added color column to certificates table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e):
            print("color column already exists in certificates table.")
        else:
            print(f"Error adding color to certificates: {e}")
            
    # 2. Add color column to achievements table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE achievements ADD COLUMN color VARCHAR DEFAULT '#f59e0b' NOT NULL;")
        print("Successfully added color column to achievements table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e):
            print("color column already exists in achievements table.")
        else:
            print(f"Error adding color to achievements: {e}")
            
    conn.commit()
    conn.close()
    print("Migration execution completed!")

if __name__ == "__main__":
    run_migration()
