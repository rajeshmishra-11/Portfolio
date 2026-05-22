import sys
import os

# Append the backend directory so we can import modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import SessionLocal, Experience, Profile
from main import get_db

def verify():
    print("Starting experiences validation script...")
    db = SessionLocal()
    try:
        # 1. Clear any existing test experiences if they exist to avoid noise
        db.query(Experience).filter(Experience.company == "Test Company").delete()
        db.commit()
        
        # 2. Add dummy experience
        print("1. Creating dummy experience...")
        new_exp = Experience(
            company="Test Company",
            role="Lead Engineer",
            duration="Jan 2026 - Present",
            description="Testing dynamic experience timelines integration.",
            projects_worked="Created portfolio\nDeveloped database layer",
            what_learned="Python, React, FastAPI, SQLite",
            proof="/experiences/proofs/test_doc.pdf",
            order=10,
            color="#e11d48"
        )
        db.add(new_exp)
        db.commit()
        db.refresh(new_exp)
        print(f"   Success! Created experience ID: {new_exp.id}")
        
        # 3. Read back and verify fields
        print("2. Verifying experience fields...")
        fetched = db.query(Experience).filter(Experience.id == new_exp.id).first()
        assert fetched is not None
        assert fetched.company == "Test Company"
        assert fetched.role == "Lead Engineer"
        assert fetched.projects_worked == "Created portfolio\nDeveloped database layer"
        assert fetched.what_learned == "Python, React, FastAPI, SQLite"
        assert fetched.proof == "/experiences/proofs/test_doc.pdf"
        print("   Success! Fields match perfectly.")
        
        # 4. Update experience
        print("3. Updating experience...")
        fetched.role = "Senior Lead Engineer"
        db.commit()
        db.refresh(fetched)
        assert fetched.role == "Senior Lead Engineer"
        print("   Success! Update verification completed.")
        
        # 5. Verify show_experience toggle on Profile
        print("4. Verifying show_experience toggle in Profile...")
        profile = db.query(Profile).first()
        if not profile:
            profile = Profile(name="Rajesh Mishra", show_experience=False)
            db.add(profile)
            db.commit()
            db.refresh(profile)
            
        initial_toggle = profile.show_experience
        print(f"   Initial show_experience: {initial_toggle}")
        
        profile.show_experience = True
        db.commit()
        db.refresh(profile)
        assert profile.show_experience is True
        print("   Success! Enabled show_experience in Profile settings.")
        
        # Reset to initial state
        profile.show_experience = initial_toggle
        db.commit()
        
        # 6. Delete experience
        print("5. Deleting dummy experience...")
        db.delete(fetched)
        db.commit()
        
        deleted = db.query(Experience).filter(Experience.id == new_exp.id).first()
        assert deleted is None
        print("   Success! Delete verified.")
        
        print("\nAll experience database CRUD tests completed successfully! No issues found.")
        
    except AssertionError as ae:
        print(f"Verification failed with assertion error: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during verification: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    verify()
