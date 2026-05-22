import json
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Dynamic Database URL (PostgreSQL in production/Vercel, SQLite locally)
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # SQLAlchemy requires connection strings to start with 'postgresql://' instead of 'postgres://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Create Database Engine for PostgreSQL (no check_same_thread needed)
    engine = create_engine(DATABASE_URL)
else:
    # SQLite Database URL (Absolute path based on this file's directory)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'portfolio.db')}"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}  # Needed for SQLite in multi-threaded FastAPI env
    )

# Session Local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    points = Column(JSON, nullable=False, default=list)  # Stored as JSON array of strings
    tags = Column(JSON, nullable=False, default=list)    # Stored as JSON array of strings
    github = Column(String, nullable=True)
    live = Column(String, nullable=True)
    featured = Column(Boolean, default=False)
    color = Column(String, nullable=False, default="#7c3aed")
    accentColor = Column(String, nullable=False, default="rgba(124, 58, 237, 0.1)")
    order = Column(Integer, default=0)

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    date = Column(String, nullable=False)
    image = Column(String, nullable=False)  # Local image URL in public or asset path
    link = Column(String, nullable=True)   # Credential verification link
    featured = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    color = Column(String, nullable=False, default="#06b6d4")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    image = Column(String, nullable=False)
    proof_link = Column(String, nullable=True)
    date = Column(String, nullable=True)
    order = Column(Integer, default=0)
    color = Column(String, nullable=False, default="#f59e0b")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # e.g., 'Languages', 'Backend', 'Frontend', 'Tools'
    percentage = Column(Integer, default=80)
    order = Column(Integer, default=0)

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    org = Column(String, nullable=False)
    period = Column(String, nullable=False)
    desc = Column(Text, nullable=False)
    order = Column(Integer, default=0)
    color = Column(String, nullable=False, default="#06b6d4")

class Profile(Base):
    __tablename__ = "profile"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Rajesh Mishra")
    roles = Column(JSON, nullable=False, default=list)
    hero_bio = Column(Text, nullable=False, default="Passionate developer crafting scalable...")
    about_bio_1 = Column(Text, nullable=False, default="I am a motivated...")
    about_bio_2 = Column(Text, nullable=False, default="I am passionate...")
    about_tags = Column(JSON, nullable=False, default=list)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    geeksforgeeks = Column(String, nullable=True)
    email = Column(String, nullable=True)
    years_learning = Column(Integer, nullable=False, default=3)
    team_projects = Column(Integer, nullable=False, default=2)
    projects_built = Column(Integer, nullable=False, default=6)
    certificates_count = Column(Integer, nullable=False, default=4)
    show_experience = Column(Boolean, nullable=False, default=False)
    show_projects = Column(Boolean, nullable=False, default=True)


class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    projects_worked = Column(Text, nullable=True) # specific projects worked on
    what_learned = Column(Text, nullable=True)    # learnings/skills acquired
    proof = Column(String, nullable=True)         # optional link/path to offer letter or ID card proof
    order = Column(Integer, default=0)
    color = Column(String, nullable=False, default="#e11d48")

# DB dependency helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
