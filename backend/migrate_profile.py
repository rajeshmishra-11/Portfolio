import sqlite3
import os

def migrate_profile():
    # portfolio.db is in the same directory as this migrate_profile.py script
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portfolio.db")
    print(f"Connecting to database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add years_learning column to profile table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE profile ADD COLUMN years_learning INTEGER DEFAULT 3 NOT NULL;")
        print("Successfully added years_learning column to profile table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e):
            print("years_learning column already exists in profile table.")
        else:
            print(f"Error adding years_learning to profile: {e}")
            
    # 2. Add team_projects column to profile table if it doesn't exist
    try:
        cursor.execute("ALTER TABLE profile ADD COLUMN team_projects INTEGER DEFAULT 2 NOT NULL;")
        print("Successfully added team_projects column to profile table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e) or "already exists" in str(e):
            print("team_projects column already exists in profile table.")
        else:
            print(f"Error adding team_projects to profile: {e}")
            
    conn.commit()
    conn.close()
    print("Profile schema migration completed successfully!")

if __name__ == "__main__":
    migrate_profile()
