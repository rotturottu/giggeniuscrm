from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import json
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

def init_db():
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    
    # Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, profile_picture TEXT)''')
    
    # Invoices Table
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  invoice_number TEXT UNIQUE, client_name TEXT, type TEXT,
                  total REAL, currency TEXT DEFAULT 'PHP', status TEXT DEFAULT 'draft',
                  issue_date TEXT, notes TEXT, items TEXT, tax_rate REAL DEFAULT 0,
                  user_email TEXT, FOREIGN KEY(user_email) REFERENCES users(email))''')

    # Entity Tables
    tables = [
        'departments', 'employees', 'contacts', 'project_tasks', 
        'projects', 'campaigns', 'time_entries', 'deals'
    ]
    
    for table in tables:
        if table == 'departments': 
            schema = "name TEXT, head_email TEXT, description TEXT, budget REAL, currency TEXT"
        elif table == 'employees': 
            schema = "first_name TEXT, last_name TEXT, email TEXT UNIQUE, department TEXT"
        elif table == 'contacts': 
            schema = "name TEXT, email TEXT, phone TEXT, company TEXT, status TEXT"
        elif table == 'project_tasks': 
            schema = "title TEXT, description TEXT, list_name TEXT, status TEXT, priority TEXT, assigned_to TEXT, start_date TEXT, due_date TEXT, subtasks TEXT, attachments TEXT, parent_task_id INTEGER"
        elif table == 'projects': 
            schema = "name TEXT, assigned_person TEXT, start_date TEXT, end_date TEXT, description TEXT, budget REAL, currency TEXT, signed_contract TEXT, status TEXT DEFAULT 'active'"
        elif table == 'campaigns': 
            schema = "name TEXT, status TEXT DEFAULT 'Draft', leads INTEGER DEFAULT 0, conversion TEXT DEFAULT '0%'"
        elif table == 'time_entries': 
            schema = "employee_name TEXT, employee_email TEXT, type TEXT, date TEXT, clock_in TEXT, clock_out TEXT, duration_minutes INTEGER, status TEXT DEFAULT 'active'"
        elif table == 'deals': 
            schema = "name TEXT, value REAL, stage TEXT, owner_email TEXT, expected_close_date TEXT, description TEXT, contact_id INTEGER"
            
        c.execute(f"CREATE TABLE IF NOT EXISTS {table} (id INTEGER PRIMARY KEY AUTOINCREMENT, {schema}, user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)")

    conn.commit()
    conn.close()

init_db()

def get_valid_user_email(headers):
    """Checks Headers first, then peeks inside the JSON body."""
    email = headers.get('User-Email')
    if email in [None, '', 'null', 'undefined']:
        try:
            if request.is_json:
                data = request.get_json(silent=True)
                if data:
                    email = data.get('user_email') or data.get('employee_email') or data.get('email')
        except: pass
    return email if email not in [None, '', 'null', 'undefined'] else None

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (data['email'],))
    user = c.fetchone()
    conn.close()
    if user and check_password_hash(user[4], data['password']):
        return jsonify({"message": "Login successful!", "email": user[3]}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    try:
        data = request.json
        hashed_pw = generate_password_hash(data['password'])
        conn = sqlite3.connect('giggenius.db')
        c = conn.cursor()
        c.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
                  (data['firstName'], data['lastName'], data['email'], hashed_pw))
        conn.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals(): conn.close()

# --- ANALYTICS ROUTE FOR DASHBOARD STATS ---
@app.route('/api/apps/giggenius-crm/analytics/CustomDashboard', methods=['GET', 'OPTIONS'])
def get_dashboard_analytics():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = get_valid_user_email(request.headers)
    if not user_email: return jsonify({}), 401
    
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get all deals to calculate stats
    c.execute("SELECT value, stage FROM deals WHERE user_email = ?", (user_email,))
    deals = c.fetchall()
    
    total_pipeline = sum(d['value'] or 0 for d in deals)
    won_monthly = sum(d['value'] or 0 for d in deals if d['stage'] == 'closed_won')
    
    return jsonify({
        "pipelineValue": total_pipeline,
        "totalDeals": len(deals),
        "wonMonthly": won_monthly
    }), 200

@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST', 'OPTIONS'])
def handle_base44_list_create(entity_name):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    
    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts', 
        'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 'Invoice': 'invoices', 
        'Campaign': 'campaigns', 'Project': 'projects', 'TimeEntry': 'time_entries',
        'Deal': 'deals'
    }
    
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify([]), 200
    
    user_email = get_valid_user_email(request.headers)
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()

    if request.method == 'GET':
        if not user_email: return jsonify([]), 200
        c.execute(f"SELECT * FROM {table_name} WHERE user_email = ? ORDER BY id DESC", (user_email,))
        return jsonify([dict(row) for row in c.fetchall()]), 200

    if request.method == 'POST':
        item = request.json
        if not user_email: return jsonify({"error": "Unauthorized"}), 401
        item['user_email'] = user_email
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        cleaned = {k: v for k, v in item.items() if k in db_cols}
        columns, placeholders = ', '.join(cleaned.keys()), ', '.join(['?'] * len(cleaned))
        c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", tuple(cleaned.values()))
        conn.commit()
        cleaned['id'] = c.lastrowid
        return jsonify(cleaned), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_base44_single_item_action(entity_name, entity_id):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = get_valid_user_email(request.headers)
    if not user_email: return jsonify({"error": "Unauthorized"}), 401
    
    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts',
        'Invoice': 'invoices', 'TimeEntry': 'time_entries', 'ProjectTask': 'project_tasks', 
        'Campaign': 'campaigns', 'Project': 'projects', 'Deal': 'deals'
    }
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify({"error": "Entity not found"}), 404
    
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()

    if request.method == 'PUT':
        data = request.json
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        cleaned = {k: v for k, v in data.items() if k in db_cols and k != 'id'}
        set_clause = ', '.join([f"{k} = ?" for k in cleaned.keys()])
        c.execute(f"UPDATE {table_name} SET {set_clause} WHERE id = ? AND user_email = ?", list(cleaned.values()) + [entity_id, user_email])
        conn.commit()
        return jsonify({"success": True}), 200

    if request.method == 'DELETE':
        c.execute(f"DELETE FROM {table_name} WHERE id = ? AND user_email = ?", (entity_id, user_email))
        conn.commit()
        return jsonify({"success": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)