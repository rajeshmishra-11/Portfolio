import sys
import os
import bcrypt

# Adjust python path to find database.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base, User, Project, Certificate, Achievement, Skill, Education, Profile

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if database is already seeded
    if db.query(User).first() is not None:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database...")
    
    # Create default Admin User
    admin_user = User(
        username="admin",
        password_hash=get_password_hash("admin123")  # Default password: admin123
    )
    db.add(admin_user)
    
    # Seed Projects
    projects = [
        Project(
            title="Smart Study Support System",
            description="An AI-assisted full-stack study platform built to improve student focus and academic performance.",
            points=[
                "Built Chrome Extension to detect and block distracting websites in real time",
                "Integrated Pomodoro timer and session-based focus tracking for students",
                "Gamification system with XP points, badges, and leaderboard to motivate learners",
                "Teacher analytics dashboard with Recharts graphs for monitoring class-wide performance",
                "Secure JWT-based login with role-based access for students and teachers",
                "Backend built with Java Spring Boot and MySQL; frontend with React.js"
            ],
            tags=["Java", "Spring Boot", "React", "MySQL", "Chrome Extension", "JWT", "Recharts"],
            github="https://github.com/rajeshmishra-11/SmartStudySapportSystem",
            live=None,
            featured=True,
            color="#7c3aed",
            accentColor="rgba(124, 58, 237, 0.1)",
            order=1
        ),
        Project(
            title="HealthConnect – Integrated Healthcare Ecosystem",
            description="A healthcare management platform connecting patients and doctors with a clean, modern interface.",
            points=[
                "Collaborated in a team to develop an integrated healthcare ecosystem connecting patients, doctors, and pharmacies.",
                "Independently designed and developed the complete Doctor Portal, including frontend, backend, REST APIs, and database integration using Flask.",
                "Implemented secure prescription management with unique RX code generation, enabling pharmacies to verify and dispatch medicines securely.",
                "Built scalable APIs, appointment management, patient record handling, and responsive dashboards with role-based access control.",
                "Developed a modular healthcare system enabling seamless communication between doctor, patient, and pharmacy services."
            ],
            tags=["Python", "Flask", "React", "MySQL", "REST API", "JWT"],
            github="https://github.com/rajeshmishra-11/HealthConnect",
            live=None,
            featured=True,
            color="#06b6d4",
            accentColor="rgba(6, 182, 212, 0.1)",
            order=2
        ),
        Project(
            title="Expense Tracker Web Application",
            description="A full-stack expense tracker with secure authentication and complete CRUD operations for expense management.",
            points=[
                "Developed a full-stack expense tracker with secure authentication and complete CRUD operations for expense management.",
                "Built interactive dashboards with charts and graphs for category-wise expense analysis and reporting.",
                "Added features like monthly expense filtering, month-wise category comparison, and graphical expense visualization.",
                "Implemented smart budget alerts and next-month budget prediction based on the previous three months spending history.",
                "Designed responsive UI using HTML, CSS, JavaScript, and Bootstrap with Flask and MySQL backend integration."
            ],
            tags=["Python", "Flask", "MySQL", "HTML", "CSS", "JavaScript", "Bootstrap"],
            github="https://github.com/rajeshmishra-11/expense_tracker",
            live=None,
            featured=True,
            color="#f59e0b",
            accentColor="rgba(245, 158, 11, 0.1)",
            order=3
        ),
        Project(
            title="Portfolio Website",
            description="This very portfolio — built with React + Vite featuring a teal/amber dark theme, dark/light mode toggle, and animated sections.",
            points=[
                "Dark/Light mode toggle with smooth CSS variable transitions and localStorage persistence",
                "Animated particle background and type-animation in the Hero section",
                "Interactive certificate gallery with PDF/image modal viewer",
                "Achievement proof cards with image lightbox for Campus Mantri and GFG records",
                "EmailJS contact form integration for direct inbox delivery",
                "Deployed on GitHub Pages with Vite optimized production build"
            ],
            tags=["React", "Vite", "CSS", "EmailJS", "GitHub Pages"],
            github="https://github.com/rajeshmishra-11/Portfolio",
            live=None,
            featured=True,
            color="#22c55e",
            accentColor="rgba(34, 197, 94, 0.1)",
            order=4
        )
    ]
    for p in projects:
        db.add(p)
        
    # Seed Certificates
    certificates = [
        Certificate(
            title="Software Engineer Intern",
            issuer="HackerRank",
            date="2024",
            image="/certificates/software_engineer_intern.pdf",
            link=None,
            featured=True,
            order=1,
            color="#7c3aed"
        ),
        Certificate(
            title="SQL (Basic)",
            issuer="HackerRank",
            date="2024",
            image="/certificates/sql_basic.pdf",
            link=None,
            featured=True,
            order=2,
            color="#00758f"
        ),
        Certificate(
            title="TechSprint 2k25",
            issuer="Tech Competition",
            date="2025",
            image="/certificates/techsprint_2k25.pdf",
            link=None,
            featured=True,
            order=3,
            color="#f59e0b"
        ),
        Certificate(
            title="IIITM Gwalior",
            issuer="IIITM Gwalior",
            date="2026",
            image="/certificates/iiitm_gwalior.jpg",
            link=None,
            featured=True,
            order=4,
            color="#06b6d4"
        )
    ]
    for c in certificates:
        db.add(c)
        
    # Seed Achievements
    achievements = [
        Achievement(
            title="Campus Mantri",
            subtitle="GeeksforGeeks",
            description="Selected as Campus Mantri for my college — an official campus representative role at GeeksforGeeks, driving student engagement and opportunities on campus.",
            image="/achievements/campus-mantri-offerletter.jpeg",
            proof_link=None,
            date="2026",
            order=1,
            color="#7c3aed"
        ),
        Achievement(
            title="Letter of Recommendation",
            subtitle="GeeksforGeeks",
            description="Received a Letter of Recommendation from GeeksforGeeks for exceptional contribution as a Campus Mantri (Jan 2026 – June 2026), recognized for leadership, event coordination, and promoting technical learning initiatives on campus.",
            image="/achievements/lro-gfg.png",
            proof_link="https://www.geeksforgeeks.org/profile/rajeshmishhica?tab=activity",
            date="Jan 2026 – June 2026",
            order=2,
            color="#06b6d4"
        ),
        Achievement(
            title="5+ Projects Completed",
            subtitle="Personal & Academic",
            description="Built and deployed 5+ end-to-end projects spanning healthcare, education, and productivity — including HealthConnect and Expense Tracker.",
            image="",
            proof_link="https://github.com/rajeshmishra-11",
            date="2023–26",
            order=3,
            color="#22c55e"
        ),
        Achievement(
            title="300+ Problems Solved",
            subtitle="GeeksforGeeks / LeetCode",
            description="Solved 300+ coding problems on GeeksforGeeks and LeetCode, continuously strengthening Data Structures and Algorithm skills in Python.",
            image="",
            proof_link="https://www.geeksforgeeks.org/profile/rajeshmishhica?tab=activity",
            date="2025–26",
            order=4,
            color="#f89820"
        ),
        Achievement(
            title="Selected as Finalist — IIITM Gwalior",
            subtitle="IIITM Gwalior",
            description="Selected as a Finalist at IIITM Gwalior — recognized for exceptional performance and innovation in a competitive technical event at one of India's premier technical institutes.",
            image="/certificates/iiitm_gwalior.jpg",
            proof_link=None,
            date="2026",
            order=5,
            color="#e11d48"
        ),
        Achievement(
            title="TechSprint 2k25 Participant",
            subtitle="Tech Competition",
            description="Competed in TechSprint 2025, a competitive technical event showcasing problem-solving skills, rapid development, and innovative thinking.",
            image="/certificates/techsprint_2k25.pdf",
            proof_link=None,
            date="2025",
            order=6,
            color="#ec4899"
        )
    ]
    for a in achievements:
        db.add(a)
        
    # Seed Skills
    skills = [
        # Languages
        Skill(name="Python", category="Languages", percentage=90, order=1),
        Skill(name="C / C++", category="Languages", percentage=72, order=2),
        Skill(name="JavaScript", category="Languages", percentage=75, order=3),
        Skill(name="HTML / CSS", category="Languages", percentage=82, order=4),
        Skill(name="React.js", category="Languages", percentage=78, order=5),
        Skill(name="MySQL / SQL", category="Languages", percentage=80, order=6),
        
        # Frameworks
        Skill(name="Flask", category="Frameworks", percentage=85, order=7),
        Skill(name="React", category="Frameworks", percentage=80, order=8),
        Skill(name="FastAPI", category="Frameworks", percentage=75, order=9),
        Skill(name="REST API", category="Frameworks", percentage=85, order=10),
        Skill(name="Bootstrap", category="Frameworks", percentage=80, order=11),
        
        # Cloud & Tools
        Skill(name="AWS", category="Tools", percentage=65, order=12),
        Skill(name="GCP", category="Tools", percentage=60, order=13),
        Skill(name="Docker", category="Tools", percentage=70, order=14),
        Skill(name="Git", category="Tools", percentage=85, order=15),
        Skill(name="Postman", category="Tools", percentage=80, order=16),
        Skill(name="MySQL", category="Tools", percentage=80, order=17),
        Skill(name="Render", category="Tools", percentage=75, order=18)
    ]
    for s in skills:
        db.add(s)

    # Seed Education
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

    # Seed Profile Config
    profile = Profile(
        name="Rajesh Mishra",
        roles=["Full Stack Developer", "Python Developer", "Flask & React Developer", "Problem Solver"],
        hero_bio="Passionate developer crafting scalable, user-centric web applications. I love turning complex problems into elegant solutions with clean code and modern technologies.",
        about_bio_1="I am a motivated and detail-oriented Software Developer with a strong foundation in Python, full-stack web development, and problem-solving. I have experience building responsive and user-focused applications using technologies such as Python, Flask, React, MySQL, JavaScript, and Bootstrap.",
        about_bio_2="I am passionate about creating efficient and scalable solutions while continuously improving my technical skills through real-world projects and collaborative learning. Currently in my 4th year of B.Sc AI Honours at Central Tribal University of Andhra Pradesh (CGPA: 7.9), with leadership experience through Campus Mantri at GeeksforGeeks.",
        about_tags=['Python', 'Flask', 'React', 'MySQL', 'JavaScript', 'Bootstrap', 'Problem Solver', 'Team Player'],
        github="https://github.com/rajeshmishra-11",
        linkedin="https://www.linkedin.com/in/rajesh-mishra-cse",
        geeksforgeeks="https://www.geeksforgeeks.org/profile/rajeshmishhica",
        email="rajeshmishra847410@gmail.com"
    )
    db.add(profile)
        
    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
