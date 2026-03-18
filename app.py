from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Enable CORS for all routes and allow the User-Email header
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

def init_db():
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    
    # 1. USERS TABLE
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT,
                  last_name TEXT,
                  email TEXT UNIQUE,
                  password TEXT,
                  profile_picture TEXT)''')
                  
    # 2. INVOICES / DOCUMENTS TABLE
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_number TEXT UNIQUE,
                  client_name TEXT,
                  type TEXT,
                  total REAL,
                  currency TEXT DEFAULT 'PHP',
                  status TEXT DEFAULT 'draft',
                  issue_date TEXT,
                  notes TEXT,
                  items TEXT,
                  tax_rate REAL DEFAULT 0,
                  user_email TEXT,
                  FOREIGN KEY(user_email) REFERENCES users(email))''')
                  
    # 3. OTHER CRM TABLES
    c.execute('''CREATE TABLE IF NOT EXISTS departments
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT, head_email TEXT, description TEXT, budget REAL, currency TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS employees
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT, department TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS leave_requests
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT, employee_email TEXT, leave_type TEXT, start_date TEXT,
                  end_date TEXT, reason TEXT, employee_id INTEGER, days_count INTEGER,
                  status TEXT DEFAULT 'Pending', created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS payroll_records
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT, employee_email TEXT, period_start TEXT, period_end TEXT,
                  currency TEXT, base_salary REAL, hours_worked REAL, overtime_hours REAL,
                  overtime_pay REAL, bonuses REAL, deductions REAL, tax REAL, net_pay REAL,
                  notes TEXT, status TEXT DEFAULT 'draft', created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS conversations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  contact_name TEXT, contact_email TEXT, subject TEXT, platform TEXT,
                  status TEXT, unread_count INTEGER DEFAULT 0, last_message TEXT,
                  last_message_at DATETIME, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  conversation_id INTEGER, sender_name TEXT, sender_email TEXT,
                  content TEXT, platform TEXT, is_outbound BOOLEAN, read BOOLEAN,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS projects
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT, description TEXT, status TEXT, budget REAL,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS project_tasks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT, list_name TEXT, status TEXT, parent_task_id INTEGER,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS contacts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT, email TEXT, phone TEXT, company TEXT, status TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS performance_reviews
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT, employee_email TEXT, reviewer_email TEXT, 
                  review_period TEXT, overall_rating TEXT, goals_met TEXT, strengths TEXT,
                  areas_of_improvement TEXT, goals_next_period TEXT, comments TEXT,
                  status TEXT DEFAULT 'Draft', created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS onboarding_tasks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT, employee_email TEXT, task_name TEXT, category TEXT,
                  assigned_to TEXT, due_date TEXT, status TEXT DEFAULT 'Pending',
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    conn.commit()
    conn.close()

init_db()

@app.route('/api/auth/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get('email')
    exclude_current = data.get('exclude_current')
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    if exclude_current and email == exclude_current:
        conn.close()
        return jsonify({"available": True}), 200
    c.execute("SELECT id FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()
    if user:
        return jsonify({"available": False, "message": "Email already in use"}), 200
    return jsonify({"available": True}), 200

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
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    user_email = request.headers.get('User-Email')
    if not user_email:
        return jsonify({"error": "No user email provided"}), 401
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    if request.method == 'GET':
        c.execute("SELECT id, first_name, last_name, email, profile_picture FROM users WHERE email=?", (user_email,))
        user_row = c.fetchone()
        conn.close()
        if user_row:
            user_data = dict(user_row)
            return jsonify({
                "id": user_data['id'],
                "firstName": user_data['first_name'],
                "lastName": user_data['last_name'],
                "email": user_data['email'],
                "profilePicture": user_data['profile_picture'],
                "role": "user"
            }), 200
        return jsonify({"error": "User not found"}), 404
    if request.method == 'PUT':
        data = request.json
        c.execute("""UPDATE users SET first_name=?, last_name=?, email=?, profile_picture=? 
                     WHERE email=?""", (data.get('firstName'), data.get('lastName'), data.get('email'), data.get('profilePicture'), user_email))
        conn.commit()
        conn.close()
        return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST'])
def handle_base44_entities(entity_name):
    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts',
        'Task': 'project_tasks', 'Project': 'projects', 'Conversation': 'conversations',
        'LeaveRequest': 'leave_requests', 'PayrollRecord': 'payroll_records',
        'PerformanceReview': 'performance_reviews', 'OnboardingTask': 'onboarding_tasks',
        'Invoice': 'invoices'
    }
    table_name = table_map.get(entity_name)
    if not table_name:
        return jsonify({"error": f"Table for {entity_name} not found"}), 404
    user_email = request.headers.get('User-Email')
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()
    if request.method == 'GET':
        # Check if table has user_email to filter personal data
        c.execute(f"PRAGMA table_info({table_name})")
        cols = [col[1] for col in c.fetchall()]
        query = f"SELECT * FROM {table_name}"
        params = []
        if 'user_email' in cols and user_email:
            query += " WHERE user_email = ?"
            params.append(user_email)
        
        # Support for query params like ?status=draft
        for key, value in request.args.items():
            if key in cols:
                prefix = " AND " if "WHERE" in query else " WHERE "
                query += f"{prefix}{key} = ?"
                params.append(value)

        c.execute(query + " ORDER BY id DESC", tuple(params))
        data = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(data), 200
    if request.method == 'POST':
        data = request.json
        c.execute(f"PRAGMA table_info({table_name})")
        cols_in_db = [col[1] for col in c.fetchall()]
        if 'user_email' in cols_in_db and user_email:
            data['user_email'] = user_email
        # Map document_name to client_name if necessary for custom templates
        if 'document_name' in data and 'client_name' in cols_in_db:
            data['client_name'] = data.pop('document_name')
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", tuple(data.values()))
        conn.commit()
        data['id'] = c.lastrowid
        conn.close()
        return jsonify(data), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE'])
def handle_base44_single_item(entity_name, entity_id):
    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts',
        'Task': 'project_tasks', 'Project': 'projects', 'Conversation': 'conversations',
        'LeaveRequest': 'leave_requests', 'PayrollRecord': 'payroll_records',
        'PerformanceReview': 'performance_reviews', 'OnboardingTask': 'onboarding_tasks',
        'Invoice': 'invoices'
    }
    table_name = table_map.get(entity_name)
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    if request.method == 'DELETE':
        c.execute(f"DELETE FROM {table_name} WHERE id = ?", (entity_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    if request.method == 'PUT':
        data = request.json
        set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
        c.execute(f"UPDATE {table_name} SET {set_clause} WHERE id = ?", tuple(data.values()) + (entity_id,))
        conn.commit()
        conn.close()
        return jsonify(data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)