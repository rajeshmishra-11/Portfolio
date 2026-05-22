import sqlite3

def migrate():
    conn = sqlite3.connect("portfolio.db")
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("PRAGMA table_info(profile)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "projects_built" not in columns:
        print("Adding column projects_built...")
        cursor.execute("ALTER TABLE profile ADD COLUMN projects_built INTEGER DEFAULT 6 NOT NULL")
        
    if "certificates_count" not in columns:
        print("Adding column certificates_count...")
        cursor.execute("ALTER TABLE profile ADD COLUMN certificates_count INTEGER DEFAULT 4 NOT NULL")
        
    conn.commit()
    conn.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
