from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import json
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
# Enable CORS for all routes and allow the User-Email header
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

def init_db():
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    
    # 1. USERS TABLE
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, profile_picture TEXT)''')
                  
    # 2. INVOICES TABLE
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_number TEXT UNIQUE, client_name TEXT, type TEXT,
                  total REAL, currency TEXT DEFAULT 'PHP', status TEXT DEFAULT 'draft',
                  issue_date TEXT, notes TEXT, items TEXT, tax_rate REAL DEFAULT 0,
                  user_email TEXT, FOREIGN KEY(user_email) REFERENCES users(email))''')
                  
    # 3. CRM TABLES
    c.execute('''CREATE TABLE IF NOT EXISTS departments
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, head_email TEXT,
                  description TEXT, budget REAL, currency TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS employees
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT,
                  email TEXT UNIQUE, department TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS contacts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT,
                  phone TEXT, company TEXT, status TEXT, user_email TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS project_tasks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  title TEXT, description TEXT, list_name TEXT,
                  status TEXT, priority TEXT, assigned_to TEXT,
                  start_date TEXT, due_date TEXT, subtasks TEXT,
                  attachments TEXT, parent_task_id INTEGER, 
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS conversations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  contact_name TEXT, contact_email TEXT,
                  subject TEXT, last_message TEXT, platform TEXT DEFAULT 'crm',
                  status TEXT DEFAULT 'active', unread_count INTEGER DEFAULT 0,
                  sender_email TEXT, recipient_email TEXT,
                  last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  conversation_id INTEGER, sender_email TEXT, recipient_email TEXT,
                  sender_name TEXT, body TEXT, is_read INTEGER DEFAULT 0,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS projects
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, assigned_person TEXT,
                  start_date TEXT, end_date TEXT, description TEXT,
                  budget REAL, currency TEXT, signed_contract TEXT,
                  status TEXT DEFAULT 'active', user_email TEXT, 
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS leave_requests
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_name TEXT,
                  employee_email TEXT, leave_type TEXT, start_date TEXT,
                  end_date TEXT, days_count INTEGER, reason TEXT,
                  status TEXT DEFAULT 'pending', created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS payroll_records
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_name TEXT, 
                  employee_email TEXT, period_start TEXT, period_end TEXT,
                  currency TEXT, base_salary REAL, net_pay REAL,
                  status TEXT DEFAULT 'draft', user_email TEXT, 
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS performance_reviews
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_name TEXT,
                  employee_email TEXT, reviewer_email TEXT, status TEXT DEFAULT 'draft',
                  user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS onboarding_tasks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_name TEXT,
                  task_name TEXT, status TEXT DEFAULT 'pending',
                  user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS campaigns
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, status TEXT DEFAULT 'Draft',
                  leads INTEGER DEFAULT 0, conversion TEXT DEFAULT '0%',
                  user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS time_entries
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_name TEXT, 
                  type TEXT, date TEXT, status TEXT DEFAULT 'active',
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    conn.commit()
    conn.close()

init_db()

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    hashed_pw = generate_password_hash(data['password'])
    try:
        conn = sqlite3.connect('giggenius.db')
        c = conn.cursor()
        c.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
                  (data['firstName'], data['lastName'], data['email'], hashed_pw))
        conn.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists."}), 400
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (data['email'],))
    user = c.fetchone()
    conn.close()
    if user and check_password_hash(user[4], data['password']):
        return jsonify({"message": "Login successful!"}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/apps/giggenius-crm/entities/User/me', methods=['GET', 'PUT', 'OPTIONS'])
def handle_me():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = request.headers.get('User-Email')
    
    if not user_email or user_email in ['null', 'undefined', '']:
        return jsonify({"authenticated": False, "message": "No active session"}), 200
    
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if request.method == 'GET':
        c.execute("SELECT id, first_name, last_name, email, profile_picture FROM users WHERE email=?", (user_email,))
        user_row = c.fetchone()
        conn.close()
        if user_row:
            u = dict(user_row)
            u['authenticated'] = True
            u['firstName'] = u['first_name']
            u['lastName'] = u['last_name']
            u['profilePicture'] = u['profile_picture']
            return jsonify(u), 200
        return jsonify({"authenticated": False, "message": "User not found"}), 200
    
    if request.method == 'PUT':
        data = request.json
        c.execute("UPDATE users SET first_name=?, last_name=?, email=?, profile_picture=? WHERE email=?",
                  (data.get('firstName'), data.get('lastName'), data.get('email'), data.get('profilePicture'), user_email))
        conn.commit()
        conn.close()
        return jsonify({"message": "Profile updated successfully"}), 200

# --- ANALYTICS ROUTE ---
@app.route('/api/apps/giggenius-crm/analytics/track/batch', methods=['POST', 'OPTIONS'])
def handle_analytics():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    return jsonify({"success": True}), 200

# --- GENERIC ENTITY HANDLERS ---
@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST', 'OPTIONS'])
def handle_base44_list_create(entity_name):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200

    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts',
        'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 
        'Invoice': 'invoices', 'Conversation': 'conversations', 'Campaign': 'campaigns',
        'Project': 'projects', 'LeaveRequest': 'leave_requests', 
        'PayrollRecord': 'payroll_records', 'PerformanceReview': 'performance_reviews',
        'OnboardingTask': 'onboarding_tasks', 'TimeEntry': 'time_entries',
        'Message': 'messages'
    }
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify({"error": f"Table for {entity_name} not found"}), 404
    
    user_email = request.headers.get('User-Email')
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()

    if request.method == 'GET':
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        query = f"SELECT * FROM {table_name}"
        params = []
        where_clauses = []

        # --- REFINED PRIVACY LOGIC (GROUPS THE OR CONDITION) ---
        if entity_name in ['Conversation', 'Message']:
            if user_email and user_email not in ['null', 'undefined', '']:
                where_clauses.append("(sender_email = ? OR recipient_email = ?)")
                params.extend([user_email, user_email])
            else:
                return jsonify([]), 200 
        elif 'user_email' in db_cols and user_email:
            where_clauses.append("user_email = ?")
            params.append(user_email)

        for key, value in request.args.items():
            if key in db_cols and key not in ['sender_email', 'recipient_email', 'user_email', 'participant_email']:
                where_clauses.append(f"{key} = ?")
                params.append(value)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        order_by = "created_date ASC" if entity_name == 'Message' else "id DESC"
        c.execute(query + f" ORDER BY {order_by}", tuple(params))
        data = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(data), 200

    if request.method == 'POST':
        item = request.json
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        
        if 'user_email' in db_cols and 'user_email' not in item:
            item['user_email'] = user_email
        if entity_name == 'Message' and 'created_date' not in item:
            item['created_date'] = datetime.now().isoformat()

        cleaned_data = {k: v for k, v in item.items() if k in db_cols}
        cols = ', '.join(cleaned_data.keys())
        placeholders = ', '.join(['?'] * len(cleaned_data))
        c.execute(f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})", tuple(cleaned_data.values()))
        conn.commit()
        cleaned_data['id'] = c.lastrowid
        conn.close()
        return jsonify(cleaned_data), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_base44_single_item_action(entity_name, entity_id):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    table_map = {
        'Invoice': 'invoices', 'Contact': 'contacts', 'Task': 'project_tasks', 
        'ProjectTask': 'project_tasks', 'Conversation': 'conversations', 
        'Campaign': 'campaigns', 'Project': 'projects', 'LeaveRequest': 'leave_requests',
        'PayrollRecord': 'payroll_records', 'PerformanceReview': 'performance_reviews',
        'OnboardingTask': 'onboarding_tasks', 'Employee': 'employees', 'Department': 'departments',
        'TimeEntry': 'time_entries', 'Message': 'messages'
    }
    table_name = table_map.get(entity_name)
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    if request.method == 'DELETE':
        if entity_name == 'Conversation':
            c.execute("DELETE FROM messages WHERE conversation_id = ?", (entity_id,))
        c.execute(f"DELETE FROM {table_name} WHERE id = ?", (entity_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    if request.method == 'PUT':
        data = request.json
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        cleaned_data = {k: v for k, v in data.items() if k in db_cols}
        set_clause = ', '.join([f"{k} = ?" for k in cleaned_data.keys()])
        c.execute(f"UPDATE {table_name} SET {set_clause} WHERE id = ?", tuple(cleaned_data.values()) + (entity_id,))
        conn.commit()
        conn.close()
        return jsonify(cleaned_data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)