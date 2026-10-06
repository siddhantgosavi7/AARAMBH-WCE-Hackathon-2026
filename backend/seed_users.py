"""
seed_users.py — seeds demo admin + farmer accounts into the database.

Run from the backend/ directory:
    python seed_users.py

Demo credentials:
  username: admin     password: admin123    role: admin
  username: farmer    password: farmer123   role: farmer
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal, init_db
from app.db.models import User
from app.core.security import hash_password


DEMO_USERS = [
    {
        "username": "admin",
        "password": "admin123",
        "role": "admin",
        "full_name": "Platform Administrator",
        "farm_name": None,
        "location": "Wardha, Maharashtra",
    },
    {
        "username": "farmer",
        "password": "farmer123",
        "role": "farmer",
        "full_name": "Ramesh Patil",
        "farm_name": "Patil Family Farm",
        "location": "Wardha, Maharashtra",
    },
]


def main() -> None:
    print("Initializing database…")
    init_db()
    session = SessionLocal()
    try:
        for u in DEMO_USERS:
            existing = session.query(User).filter(User.username == u["username"]).first()
            if existing:
                print(f"  ✓ User '{u['username']}' already exists — skipping.")
                continue
            new_user = User(
                username=u["username"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                full_name=u["full_name"],
                farm_name=u["farm_name"],
                location=u["location"],
            )
            session.add(new_user)
            print(f"  + Created user '{u['username']}' ({u['role']})")
        session.commit()
        print("Done - users seeded successfully.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
