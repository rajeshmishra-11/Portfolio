import sqlite3
import os

def migrate():
    # Make sure we use the correct database path regardless of where the script is run from
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "portfolio.db")
    
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Create experiences table if it doesn't exist
    print("Checking if experiences table exists...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        duration TEXT NOT NULL,
        description TEXT NOT NULL,
        projects_worked TEXT,
        what_learned TEXT,
        `order` INTEGER DEFAULT 0,
        color TEXT NOT NULL DEFAULT '#e11d48'
    );
    """)
    
    # 2. Add show_experience column to profile if it doesn't exist
    cursor.execute("PRAGMA table_info(profile)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "show_experience" not in columns:
        print("Adding column show_experience to profile table...")
        cursor.execute("ALTER TABLE profile ADD COLUMN show_experience BOOLEAN DEFAULT 0 NOT NULL")
    else:
        print("Column show_experience already exists in profile table.")
        
    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate()
