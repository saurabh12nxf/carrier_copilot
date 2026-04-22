"""
Database migration script to add new columns
"""
import sqlite3
import os

def migrate_database():
    """Add new columns to existing database"""
    db_path = "career_copilot.db"
    
    if not os.path.exists(db_path):
        print("Database doesn't exist yet. Will be created on first run.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    migrations = []
    
    if 'resume_analysis' not in columns:
        migrations.append("ALTER TABLE users ADD COLUMN resume_analysis TEXT")
    
    if 'skill_gap_analysis' not in columns:
        migrations.append("ALTER TABLE users ADD COLUMN skill_gap_analysis TEXT")
    
    if 'roadmap_data' not in columns:
        migrations.append("ALTER TABLE users ADD COLUMN roadmap_data TEXT")
    
    if migrations:
        print(f"Running {len(migrations)} migrations...")
        for migration in migrations:
            try:
                cursor.execute(migration)
                print(f"✓ {migration}")
            except Exception as e:
                print(f"✗ Failed: {migration} - {e}")
        
        conn.commit()
        print("✓ Database migration complete!")
    else:
        print("✓ Database is already up to date!")
    
    conn.close()

if __name__ == "__main__":
    migrate_database()
