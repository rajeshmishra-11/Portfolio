import sqlite3
import os

def migrate():
    # Make sure we use the correct database path regardless of where the script is run from
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "portfolio.db")
    
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check table structure of experiences
    cursor.execute("PRAGMA table_info(experiences)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "proof" not in columns:
        print("Adding column 'proof' to experiences table...")
        cursor.execute("ALTER TABLE experiences ADD COLUMN proof TEXT")
        print("Column 'proof' successfully added.")
    else:
        print("Column 'proof' already exists in experiences table.")
        
    conn.commit()
    conn.close()
    print("Database migration for experience proof completed successfully!")

if __name__ == "__main__":
    migrate()
