from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Broad CORS for troubleshooting
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

def init_db():
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    
    # 1. Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, profile_picture TEXT)''')
    
    # 2. Invoices Table (WITH ALL COLUMNS)
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_number TEXT UNIQUE, client_name TEXT, document_name TEXT, 
                  signing_date TEXT, details TEXT, type TEXT, total REAL, 
                  currency TEXT DEFAULT 'PHP', status TEXT DEFAULT 'draft', 
                  issue_date TEXT, notes TEXT, items TEXT, tax_rate REAL DEFAULT 0,
                  user_email TEXT, FOREIGN KEY(user_email) REFERENCES users(email))''')

    # 3. Dynamic Entity Tables
    tables = {
        'departments': "name TEXT, head_email TEXT, description TEXT, budget REAL, currency TEXT",
        'employees': "first_name TEXT, last_name TEXT, email TEXT UNIQUE, department TEXT",
        'contacts': "name TEXT, email TEXT, phone TEXT, company TEXT, status TEXT",
        'project_tasks': "title TEXT, description TEXT, list_name TEXT, status TEXT, priority TEXT, assigned_to TEXT, start_date TEXT, due_date TEXT, subtasks TEXT, attachments TEXT, parent_task_id INTEGER",
        'projects': "name TEXT, assigned_person TEXT, start_date TEXT, end_date TEXT, description TEXT, budget REAL, currency TEXT, signed_contract TEXT, status TEXT DEFAULT 'active'",
        'campaigns': "name TEXT, status TEXT DEFAULT 'Draft', leads INTEGER DEFAULT 0, conversion TEXT DEFAULT '0%'",
        'time_entries': "employee_name TEXT, employee_email TEXT, type TEXT, date TEXT, clock_in TEXT, clock_out TEXT, duration_minutes INTEGER, status TEXT DEFAULT 'active'",
        'deals': "name TEXT, value REAL, stage TEXT, owner_email TEXT, expected_close_date TEXT, description TEXT, contact_id INTEGER",
        'leave_requests': "employee_name TEXT, employee_email TEXT, leave_type TEXT, start_date TEXT, end_date TEXT, reason TEXT, days_count INTEGER, status TEXT DEFAULT 'pending'",
        'payroll': "employee_name TEXT, employee_email TEXT, period_start TEXT, period_end TEXT, currency TEXT, base_salary REAL, hours_worked REAL, overtime_hours REAL, overtime_pay REAL, bonuses REAL, deductions REAL, tax REAL, net_pay REAL, status TEXT DEFAULT 'draft', notes TEXT, paid_at TEXT",
        'performance_reviews': "employee_name TEXT, employee_email TEXT, reviewer_email TEXT, review_period TEXT, overall_rating INTEGER, goals_met TEXT, strengths TEXT, areas_of_improvement TEXT, goals_next_period TEXT, comments TEXT, status TEXT DEFAULT 'draft'",
        'onboarding_tasks': "employee_name TEXT, employee_id TEXT, task_name TEXT, category TEXT, assigned_to TEXT, due_date TEXT, status TEXT DEFAULT 'pending', notes TEXT, department TEXT"
    }
    
    for table, schema in tables.items():
        c.execute(f"CREATE TABLE IF NOT EXISTS {table} (id INTEGER PRIMARY KEY AUTOINCREMENT, {schema}, user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)")

    conn.commit()
    conn.close()

init_db()

def get_email(headers):
    email = headers.get('User-Email')
    if not email or email in ['null', 'undefined', '']:
        try:
            if request.is_json:
                data = request.get_json(silent=True)
                email = data.get('user_email') or data.get('email')
        except: pass
    return email if email else None

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect('giggenius.db')
    user = conn.execute("SELECT * FROM users WHERE email=?", (data['email'],)).fetchone()
    conn.close()
    if user and check_password_hash(user[4], data['password']):
        return jsonify({"message": "OK", "email": user[3]}), 200
    return jsonify({"error": "Invalid"}), 401

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    data = request.json
    pw = generate_password_hash(data['password'])
    conn = sqlite3.connect('giggenius.db')
    try:
        conn.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
                     (data['firstName'], data['lastName'], data['email'], pw))
        conn.commit()
        return jsonify({"message": "Created"}), 201
    except: return jsonify({"error": "Exists"}), 400
    finally: conn.close()

# FIX FOR 404/405 ON /entities/User/me
@app.route('/api/apps/giggenius-crm/entities/User/me', methods=['GET', 'OPTIONS'])
def get_me():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    email = get_email(request.headers)
    if not email: return jsonify({"error": "No Email"}), 401
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT first_name, last_name, email FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return jsonify(dict(user)) if user else jsonify({"error": "Not found"}), 404

@app.route('/api/apps/giggenius-crm/entities/<entity>', methods=['GET', 'POST', 'OPTIONS'])
def handle_list(entity):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    
    mapping = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts', 
        'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 'Invoice': 'invoices', 
        'Campaign': 'campaigns', 'Project': 'projects', 'TimeEntry': 'time_entries',
        'Deal': 'deals', 'LeaveRequest': 'leave_requests', 'PayrollRecord': 'payroll',
        'PerformanceReview': 'performance_reviews', 'OnboardingTask': 'onboarding_tasks'
    }
    
    table = mapping.get(entity)
    if not table: return jsonify([]), 200
    
    email = get_email(request.headers)
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row

    if request.method == 'GET':
        if not email: return jsonify([]), 200
        query = f"SELECT * FROM {table} WHERE user_email = ?"
        params = [email]
        for k, v in request.args.items():
            if k not in ['_sort', '_order', '_limit', '_page']:
                query += f" AND {k} = ?"
                params.append(v)
        res = conn.execute(query + " ORDER BY id DESC", tuple(params)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in res]), 200

    if request.method == 'POST':
        data = request.json
        if not email: return jsonify({"error": "Auth"}), 401
        data['user_email'] = email
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in cursor.fetchall()]
        cleaned = {k: v for k, v in data.items() if k in cols}
        q = f"INSERT INTO {table} ({','.join(cleaned.keys())}) VALUES ({','.join(['?']*len(cleaned))})"
        cursor.execute(q, tuple(cleaned.values()))
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return jsonify({"id": last_id, **cleaned}), 201

@app.route('/api/apps/giggenius-crm/entities/<entity>/<id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_item(entity, id):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    email = get_email(request.headers)
    mapping = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts',
        'Invoice': 'invoices', 'TimeEntry': 'time_entries', 'ProjectTask': 'project_tasks', 
        'Campaign': 'campaigns', 'Project': 'projects', 'Deal': 'deals',
        'LeaveRequest': 'leave_requests', 'PayrollRecord': 'payroll',
        'PerformanceReview': 'performance_reviews', 'OnboardingTask': 'onboarding_tasks'
    }
    table = mapping.get(entity)
    conn = sqlite3.connect('giggenius.db')
    if request.method == 'PUT':
        data = request.json
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in cursor.fetchall()]
        cleaned = {k: v for k, v in data.items() if k in cols and k != 'id'}
        sets = ", ".join([f"{k} = ?" for k in cleaned.keys()])
        conn.execute(f"UPDATE {table} SET {sets} WHERE id = ? AND user_email = ?", list(cleaned.values()) + [id, email])
        conn.commit()
    if request.method == 'DELETE':
        conn.execute(f"DELETE FROM {table} WHERE id = ? AND user_email = ?", (id, email))
        conn.commit()
    conn.close()
    return jsonify({"success": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)