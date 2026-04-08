from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# 1. SETUP ISOLATION FOLDERS
DB_FOLDER = 'user_databases'
if not os.path.exists(DB_FOLDER):
    os.makedirs(DB_FOLDER)

MAIN_DB = 'users_master.db' # Tracks who has what database

def init_master_db():
    conn = sqlite3.connect(MAIN_DB)
    conn.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, db_path TEXT)''')
    conn.close()

def init_user_db(db_path):
    """Initializes the CRM structure inside a user's private file."""
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # User's Private Invoices
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE, 
                  client_name TEXT, document_name TEXT, signing_date TEXT, details TEXT,
                  type TEXT, total REAL, currency TEXT DEFAULT 'PHP', status TEXT DEFAULT 'draft', 
                  issue_date TEXT, notes TEXT, items TEXT, tax_rate REAL DEFAULT 0)''')

    # User's Private Entity Tables
    tables = {
        'departments': "name TEXT, head_email TEXT, description TEXT, budget REAL, currency TEXT",
        'employees': "first_name TEXT, last_name TEXT, email TEXT UNIQUE, department TEXT",
        'contacts': "name TEXT, email TEXT, phone TEXT, company TEXT, status TEXT",
        'project_tasks': "title TEXT, description TEXT, list_name TEXT, status TEXT, priority TEXT, assigned_to TEXT, start_date TEXT, due_date TEXT, subtasks TEXT, attachments TEXT, parent_task_id INTEGER",
        'projects': "name TEXT, assigned_person TEXT, start_date TEXT, end_date TEXT, description TEXT, budget REAL, currency TEXT, signed_contract TEXT, status TEXT DEFAULT 'active'",
        'campaigns': "name TEXT, status TEXT DEFAULT 'Draft', leads INTEGER DEFAULT 0, conversion TEXT DEFAULT '0%'",
        'time_entries': "employee_name TEXT, employee_email TEXT, type TEXT, date TEXT, clock_in TEXT, clock_out TEXT, duration_minutes INTEGER, status TEXT DEFAULT 'active'",
        'deals': "name TEXT, value REAL, stage TEXT, owner_email TEXT, expected_close_date TEXT, description TEXT, contact_id INTEGER"
    }
    
    for table, schema in tables.items():
        c.execute(f"CREATE TABLE IF NOT EXISTS {table} (id INTEGER PRIMARY KEY AUTOINCREMENT, {schema}, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)")
    
    conn.commit()
    conn.close()

init_master_db()

# 2. HELPER: Finding the correct database
def get_user_db_path():
    """Universal lookup to find the user's private database."""
    # 1. Try to get email from Headers (Best practice)
    email = request.headers.get('User-Email')
    
    # 2. If not in headers, check the URL (e.g., ?user_email=...)
    if not email or email in ['null', 'undefined', '']:
        email = request.args.get('user_email') or request.args.get('email')
        
    # 3. If still not found, peek inside the JSON body (for POST/PUT)
    if not email or email in ['null', 'undefined', '']:
        try:
            if request.is_json:
                data = request.get_json(silent=True)
                if data:
                    email = data.get('user_email') or data.get('email') or data.get('userEmail')
        except: pass

    # If we still have no email, we can't open a database
    if not email or email in ['null', 'undefined', '']:
        return None

    conn = sqlite3.connect(MAIN_DB)
    res = conn.execute("SELECT db_path FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return res[0] if res else None

# 3. AUTHENTICATION (The Gatekeeper)
@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    data = request.json
    email = data['email']
    safe_name = email.replace('@', '_').replace('.', '_')
    user_db_path = os.path.join(DB_FOLDER, f"{safe_name}.db")
    hashed_pw = generate_password_hash(data['password'])
    
    conn = sqlite3.connect(MAIN_DB)
    try:
        conn.execute("INSERT INTO users (first_name, last_name, email, password, db_path) VALUES (?, ?, ?, ?, ?)",
                     (data['firstName'], data['lastName'], email, hashed_pw, user_db_path))
        conn.commit()
        # Create their actual private file immediately
        init_user_db(user_db_path)
        return jsonify({"message": "Registration success"}), 201
    except: return jsonify({"error": "Email exists"}), 400
    finally: conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(MAIN_DB)
    user = conn.execute("SELECT * FROM users WHERE email=?", (data['email'],)).fetchone()
    conn.close()
    if user and check_password_hash(user[4], data['password']):
        return jsonify({"message": "OK", "email": user[3]}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# 4. DATA HANDLING (The Isolated Engine)
@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST', 'OPTIONS'])
def handle_entities(entity_name):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    
    db_path = get_user_db_path()
    if not db_path: return jsonify({"error": "No isolation DB found"}), 401
    
    table_map = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts', 
        'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 'Invoice': 'invoices', 
        'Campaign': 'campaigns', 'Project': 'projects', 'TimeEntry': 'time_entries', 'Deal': 'deals'
    }
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify([]), 200

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    if request.method == 'GET':
        query = f"SELECT * FROM {table_name}"
        params = []
        if request.args:
            filters = [f"{k} = ?" for k in request.args.keys() if k not in ['_limit', '_order', '_page', '_sort']]
            if filters:
                query += " WHERE " + " AND ".join(filters)
                params = [v for k, v in request.args.items() if k not in ['_limit', '_order', '_page', '_sort']]
        
        res = c.execute(query + " ORDER BY id DESC", tuple(params)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in res]), 200

    if request.method == 'POST':
        item = request.json
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        cleaned = {k: v for k, v in item.items() if k in db_cols}
        columns, placeholders = ', '.join(cleaned.keys()), ', '.join(['?'] * len(cleaned))
        c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", tuple(cleaned.values()))
        conn.commit()
        last_id = c.lastrowid
        conn.close()
        return jsonify({"id": last_id, **cleaned}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)