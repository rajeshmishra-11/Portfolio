import os
import shutil
import random
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import List, Optional

# Manually load environment variables from .env file if it exists
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")
    except Exception as e:
        print(f"[Warning] Failed to load .env file manually: {e}")

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from sqlalchemy.orm import Session

# In-memory store for OTPs (username -> {"otp": str, "expires_at": float})
active_otps = {}

from database import engine, Base, get_db, User, Project, Certificate, Achievement, Skill, Education, Profile, Experience

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Auto-seed the database if it's empty (critical for brand-new PostgreSQL instances)
try:
    from seed import seed_database
    seed_database()
except Exception as e:
    print(f"[Warning] Automatic seeding skipped/failed: {e}")

def run_migrations():
    # Only run SQLite-specific table alterations if we are not connected to PostgreSQL
    if os.getenv("DATABASE_URL"):
        print("Connected to PostgreSQL. Skipping SQLite migrations.")
        return

    import sqlite3
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "portfolio.db")
    if os.path.exists(db_path):
        try:
            print(f"Connecting to database for show_projects migration: {db_path}")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(profile)")
            columns = [row[1] for row in cursor.fetchall()]
            if "show_projects" not in columns:
                print("Adding column show_projects to profile table...")
                cursor.execute("ALTER TABLE profile ADD COLUMN show_projects BOOLEAN DEFAULT 1 NOT NULL")
                conn.commit()
                print("Column show_projects added successfully!")
            else:
                print("Column show_projects already exists in profile table.")
            conn.close()
        except Exception as e:
            print(f"[Migration Error] Failed to run automated database migration: {e}")

run_migrations()


app = FastAPI(title="Portfolio Admin API", version="1.0.0")

# Enable CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Security Configurations
SECRET_KEY = "SUPER_SECRET_PORTFOLIO_KEY_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Pydantic Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class VerifyOTPRequest(BaseModel):
    username: str
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectBase(BaseModel):
    title: str
    description: str
    points: List[str]
    tags: List[str]
    github: Optional[str] = None
    live: Optional[str] = None
    featured: bool = False
    color: str = "#7c3aed"
    accentColor: str = "rgba(124, 58, 237, 0.1)"
    order: int = 0

class CertificateBase(BaseModel):
    title: str
    issuer: str
    date: str
    image: str
    link: Optional[str] = None
    featured: bool = True
    order: int = 0
    color: str = "#06b6d4"

class AchievementBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: str
    image: str
    proof_link: Optional[str] = None
    date: Optional[str] = None
    order: int = 0
    color: str = "#f59e0b"

class SkillBase(BaseModel):
    name: str
    category: str
    percentage: int = 80
    order: int = 0

class EducationBase(BaseModel):
    title: str
    org: str
    period: str
    desc: str
    order: int = 0
    color: str = "#06b6d4"

class ExperienceBase(BaseModel):
    company: str
    role: str
    duration: str
    description: str
    projects_worked: Optional[str] = None
    what_learned: Optional[str] = None
    proof: Optional[str] = None
    order: int = 0
    color: str = "#e11d48"

class ProfileUpdate(BaseModel):
    name: str
    roles: List[str]
    hero_bio: str
    about_bio_1: str
    about_bio_2: str
    about_tags: List[str]
    github: Optional[str] = None
    linkedin: Optional[str] = None
    geeksforgeeks: Optional[str] = None
    email: Optional[str] = None
    years_learning: int = 3
    team_projects: int = 2
    projects_built: int = 6
    certificates_count: int = 4
    show_experience: bool = False
    show_projects: bool = True

# Auth Utilities
def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# --- PUBLIC ENDPOINTS ---

@app.get("/api/portfolio")
def get_portfolio_data(db: Session = Depends(get_db)):
    """Fetch all portfolio content in a single consolidated payload."""
    projects = db.query(Project).order_by(Project.order, Project.id).all()
    certificates = db.query(Certificate).order_by(Certificate.order, Certificate.id).all()
    achievements = db.query(Achievement).order_by(Achievement.order, Achievement.id).all()
    skills = db.query(Skill).order_by(Skill.order, Skill.id).all()
    education = db.query(Education).order_by(Education.order, Education.id).all()
    experiences = db.query(Experience).order_by(Experience.order, Experience.id).all()
    
    # Fetch profile config
    profile = db.query(Profile).first()
    if not profile:
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
            email="rajeshmishra847410@gmail.com",
            years_learning=3,
            team_projects=2,
            projects_built=6,
            certificates_count=4,
            show_experience=False,
            show_projects=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return {
        "projects": projects,
        "certificates": certificates,
        "achievements": achievements,
        "skills": skills,
        "education": education,
        "experiences": experiences,
        "profile": profile
    }


def send_otp_email(to_email: str, username: str, otp_code: str):
    """Sends OTP code to the admin email. Falls back to console print if SMTP is not configured."""
    # Dynamically load/reload environment variables from .env file so the user doesn't need to restart the server
    if os.path.exists(".env"):
        try:
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip().strip('"').strip("'")
        except Exception as e:
            print(f"[Warning] Failed to dynamically reload .env file: {e}")

    subject = "🔑 Rajesh Mishra Portfolio Admin Portal OTP Login Code"
    body = f"""Hi Rajesh,

You or someone else requested a login to the Admin Dashboard of your portfolio.

Your verification code is: {otp_code}

This code is valid for 5 minutes. If you did not initiate this login, please ignore this email or change your admin password.

Best regards,
Your Portfolio Security System
"""
    
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    if smtp_password:
        smtp_password = smtp_password.replace(" ", "")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587

    print(f"\n=======================================================")
    print(f"🔑 SECURITY OTP FOR LOGIN ({username}): {otp_code}")
    print(f"=======================================================\n")

    # Write the OTP to a local text file in the workspace for easy developer/user access!
    try:
        with open("current_otp.txt", "w", encoding="utf-8") as otp_file:
            otp_file.write(f"Your latest Admin OTP Code is: {otp_code}\nGenerated at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        print("[Local Backup Success]: Wrote OTP to backend/current_otp.txt")
    except Exception as e:
        print(f"[Local Backup Warning]: Failed to write OTP to file: {e}")

    if not smtp_user or not smtp_password or "YOUR_16_CHARACTER_GMAIL_APP_PASSWORD" in smtp_password:
        print("[SMTP Warning]: SMTP_USER or SMTP_PASSWORD environment variables not set correctly in .env file. Email not sent.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print("[SMTP Success]: Verification email successfully sent.")
        return True
    except Exception as e:
        print(f"[SMTP Error]: Failed to send verification email: {str(e)}")
        return False


# --- AUTH ENDPOINTS ---

@app.post("/api/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 standard login endpoint."""
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login-json")
def login_json(req: LoginRequest, db: Session = Depends(get_db)):
    """JSON payload login alternative that initiates the Two-Step OTP verification process."""
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Generate temporary 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    active_otps[req.username] = {
        "otp": otp_code,
        "expires_at": time.time() + 300  # 5 minutes
    }
    
    # Dispatch OTP email to the pre-configured admin email
    admin_email = "rajeshmishra847410@gmail.com"
    send_otp_email(admin_email, req.username, otp_code)
    
    return {"status": "otp_required", "username": req.username}

@app.post("/api/auth/verify-otp", response_model=Token)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verifies the 6-digit OTP code and returns the access token."""
    username = req.username
    otp_val = req.otp.strip()
    
    if username not in active_otps:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No verification session found or expired. Please try logging in again."
        )
        
    otp_entry = active_otps[username]
    if time.time() > otp_entry["expires_at"]:
        del active_otps[username]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification code has expired. Please try logging in again."
        )
        
    if otp_entry["otp"] != otp_val:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect verification code."
        )
        
    # Validated! Clear OTP from cache
    del active_otps[username]
    
    # Generate token
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/verify")
def verify_token(current_user: User = Depends(get_current_user)):
    """Endpoint to check if the user's token is still valid."""
    return {"status": "valid", "username": current_user.username}


# --- PROTECTED CRUD ENDPOINTS ---

# 1. Projects
@app.post("/api/projects")
def create_project(project: ProjectBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/api/projects/{project_id}")
def update_project(project_id: int, project: ProjectBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.dict().items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"detail": "Project deleted successfully"}


# 2. Certificates
@app.post("/api/certificates")
def create_certificate(cert: CertificateBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = Certificate(**cert.dict())
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@app.put("/api/certificates/{cert_id}")
def update_certificate(cert_id: int, cert: CertificateBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    for key, value in cert.dict().items():
        setattr(db_cert, key, value)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@app.delete("/api/certificates/{cert_id}")
def delete_certificate(cert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    db.delete(db_cert)
    db.commit()
    return {"detail": "Certificate deleted successfully"}


# 3. Achievements
@app.post("/api/achievements")
def create_achievement(ach: AchievementBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ach = Achievement(**ach.dict())
    db.add(db_ach)
    db.commit()
    db.refresh(db_ach)
    return db_ach

@app.put("/api/achievements/{ach_id}")
def update_achievement(ach_id: int, ach: AchievementBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not db_ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    for key, value in ach.dict().items():
        setattr(db_ach, key, value)
    db.commit()
    db.refresh(db_ach)
    return db_ach

@app.delete("/api/achievements/{ach_id}")
def delete_achievement(ach_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not db_ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    db.delete(db_ach)
    db.commit()
    return {"detail": "Achievement deleted successfully"}


# 4. Skills
@app.post("/api/skills")
def create_skill(skill: SkillBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Skill).filter(Skill.name.ilike(skill.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Skill '{skill.name}' already exists.")
    db_skill = Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@app.put("/api/skills/{skill_id}")
def update_skill(skill_id: int, skill: SkillBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    existing = db.query(Skill).filter(Skill.name.ilike(skill.name), Skill.id != skill_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Skill '{skill.name}' already exists.")
    for key, value in skill.dict().items():
        setattr(db_skill, key, value)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@app.delete("/api/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(db_skill)
    db.commit()
    return {"detail": "Skill deleted successfully"}


# 5. Resume PDF File Upload
@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Secure uploader that replaces the front-end resume.pdf directly."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    # Target path inside React public folder
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root_dir, "public")
    dest_path = os.path.join(public_dir, "resume.pdf")
    
    # Ensure public folder exists
    os.makedirs(public_dir, exist_ok=True)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"detail": "Resume uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


# 6. Certificate Document File Upload
@app.post("/api/upload/certificate")
async def upload_certificate_file(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Secure uploader for certificate documents (images or PDFs)."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PDF and Image files are allowed")
        
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_dir = os.path.join(root_dir, "public", "certificates")
    os.makedirs(dest_dir, exist_ok=True)
    
    # Generate clean filename
    filename = file.filename.replace(" ", "_")
    dest_path = os.path.join(dest_dir, filename)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"path": f"/certificates/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


# 7. Achievement Proof File Upload
@app.post("/api/upload/achievement")
async def upload_achievement_file(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Secure uploader for achievement proof documents (images or PDFs)."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PDF and Image files are allowed")
        
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_dir = os.path.join(root_dir, "public", "achievements")
    os.makedirs(dest_dir, exist_ok=True)
    
    filename = file.filename.replace(" ", "_")
    dest_path = os.path.join(dest_dir, filename)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"path": f"/achievements/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


# 7b. Experience Proof File Upload
@app.post("/api/upload/experience")
async def upload_experience_proof_file(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Secure uploader for experience verification proof (images or PDFs)."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PDF and Image files are allowed")
        
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest_dir = os.path.join(root_dir, "public", "experiences", "proofs")
    os.makedirs(dest_dir, exist_ok=True)
    
    filename = file.filename.replace(" ", "_")
    dest_path = os.path.join(dest_dir, filename)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"path": f"/experiences/proofs/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


# 7c. Profile Picture File Upload
@app.post("/api/profile/upload")
async def upload_profile_picture(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Secure uploader that replaces the front-end profile.jpg directly."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG, and WEBP files are allowed")
        
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root_dir, "public")
    dest_path = os.path.join(public_dir, "profile.jpg")
    
    os.makedirs(public_dir, exist_ok=True)
    
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"detail": "Profile picture uploaded successfully", "path": "/profile.jpg"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")



# 8. Education
@app.post("/api/education")
def create_education(edu: EducationBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_edu = Education(**edu.dict())
    db.add(db_edu)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@app.put("/api/education/{edu_id}")
def update_education(edu_id: int, edu: EducationBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_edu = db.query(Education).filter(Education.id == edu_id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Education item not found")
    for key, value in edu.dict().items():
        setattr(db_edu, key, value)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@app.delete("/api/education/{edu_id}")
def delete_education(edu_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_edu = db.query(Education).filter(Education.id == edu_id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Education item not found")
    db.delete(db_edu)
    db.commit()
    return {"detail": "Education item deleted successfully"}


# 9. Profile Settings
@app.get("/api/profile")
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
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
            email="rajeshmishra847410@gmail.com",
            years_learning=3,
            team_projects=2,
            projects_built=6,
            certificates_count=4,
            show_experience=False,
            show_projects=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@app.put("/api/profile")
def update_profile(profile_data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile()
        db.add(profile)
    for key, value in profile_data.dict().items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


# 10. Experiences
@app.post("/api/experiences")
def create_experience(exp: ExperienceBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_exp = Experience(**exp.dict())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.put("/api/experiences/{exp_id}")
def update_experience(exp_id: int, exp: ExperienceBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in exp.dict().items():
        setattr(db_exp, key, value)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.delete("/api/experiences/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(db_exp)
    db.commit()
    return {"detail": "Experience deleted successfully"}

