import sys
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))
from database import SessionLocal, User

SECRET_KEY = "SUPER_SECRET_PORTFOLIO_KEY_123"
ALGORITHM = "HS256"

# Create a session
db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Total users in database: {len(users)}")
    for u in users:
        print(f"User: id={u.id}, username={u.username}, password_hash={u.password_hash}")
finally:
    db.close()

# Test token generation and validation
def test_jwt():
    data = {"sub": "admin"}
    expire = datetime.utcnow() + timedelta(minutes=60)
    data.update({"exp": expire})
    print(f"Payload to encode: {data}")
    
    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Encoded token: {token}")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded successfully: {decoded}")
    except Exception as e:
        print(f"Error decoding: {type(e).__name__}: {e}")

test_jwt()
