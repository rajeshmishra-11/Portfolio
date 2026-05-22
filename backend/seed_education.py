import os
import sys

# Adjust python path to find database.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base, Education

def seed_education():
    db = SessionLocal()
    # Check if education is empty
    if db.query(Education).first() is not None:
        print("Education table is already populated. Skipping seed.")
        db.close()
        return

    print("Education table is empty. Seeding default education items...")
    
    education_items = [
        Education(
            title="B.Sc Artificial Intelligence Honours with Research",
            org="Central Tribal University of Andhra Pradesh",
            period="2023 – 2027 (4th Year)",
            desc="Pursuing a 4-year B.Sc AI Honours with Research programme. Currently in the 4th year with a CGPA of 7.9. Specializing in AI, machine learning, and full-stack development.",
            order=1
        ),
        Education(
            title="Class 12th — MPC (Math, Physics, Chemistry)",
            org="Atal Aadarsh Vidyalaya, Lodi Estate, Delhi — CBSE Board",
            period="2022 – 2023",
            desc="Completed higher secondary education with Mathematics, Physics, and Chemistry as core subjects from Atal Aadarsh Vidyalaya under CBSE Board. Scored 70% marks.",
            order=2
        )
    ]
    
    for e in education_items:
        db.add(e)
    
    db.commit()
    print("Education seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_education()
