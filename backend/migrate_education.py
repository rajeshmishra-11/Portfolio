import sqlite3

def migrate():
    conn = sqlite3.connect("portfolio.db")
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("PRAGMA table_info(education)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "color" not in columns:
        print("Adding column color to education table...")
        cursor.execute("ALTER TABLE education ADD COLUMN color TEXT DEFAULT '#06b6d4' NOT NULL")
        
    conn.commit()
    conn.close()
    print("Education table migration completed successfully!")

if __name__ == "__main__":
    migrate()
