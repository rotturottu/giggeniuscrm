from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import os  # <--- CRITICAL: Make sure this is here
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Enable CORS for your domain
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

DB_FOLDER = 'user_databases'
if not os.path.exists(DB_FOLDER):
    os.makedirs(DB_FOLDER)

MAIN_DB = 'users.db'

def init_main_db():
    conn = sqlite3.connect(MAIN_DB)
    conn.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, db_path TEXT)''')
    conn.close()

def init_user_db(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    # Comprehensive Schema to support all your tabs
    c.execute('''CREATE TABLE IF NOT EXISTS invoices
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE, 
                  client_name TEXT, document_name TEXT, signing_date TEXT, details TEXT,
                  type TEXT, total REAL, currency TEXT DEFAULT 'PHP', status TEXT DEFAULT 'draft', 
                  issue_date TEXT, notes TEXT, items TEXT, tax_rate REAL DEFAULT 0)''')

    tables = {
        'departments': "name TEXT, head_email TEXT, description TEXT, budget REAL, currency TEXT",
        'employees': "first_name TEXT, last_name TEXT, email TEXT UNIQUE, department TEXT",
        'contacts': "name TEXT, email TEXT, phone TEXT, company TEXT, status TEXT",
        'project_tasks': "title TEXT, description TEXT, list_name TEXT, status TEXT, priority TEXT, assigned_to TEXT, start_date TEXT, due_date TEXT, subtasks TEXT, attachments TEXT, parent_task_id INTEGER",
        'projects': "name TEXT, assigned_person TEXT, start_date TEXT, end_date TEXT, description TEXT, budget REAL, currency TEXT, signed_contract TEXT, status TEXT DEFAULT 'active'",
        'campaigns': "name TEXT, status TEXT DEFAULT 'Draft', leads INTEGER DEFAULT 0, conversion TEXT DEFAULT '0%'",
        'deals': "name TEXT, value REAL, stage TEXT, owner_email TEXT, expected_close_date TEXT, description TEXT, contact_id INTEGER"
    }
    for table, schema in tables.items():
        c.execute(f"CREATE TABLE IF NOT EXISTS {table} (id INTEGER PRIMARY KEY AUTOINCREMENT, {schema}, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    conn.close()

init_main_db()

def get_user_db_path():
    # Frontend sends email in 'User-Email' header
    email = request.headers.get('User-Email')
    if not email or email in ['null', 'undefined', '']:
        return None
    conn = sqlite3.connect(MAIN_DB)
    res = conn.execute("SELECT db_path FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return res[0] if res else None

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
        init_user_db(user_db_path)
        return jsonify({"message": "Success", "email": email}), 201
    except: return jsonify({"error": "User exists"}), 400
    finally: conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(MAIN_DB)
    user = conn.execute("SELECT * FROM users WHERE email=?", (data['email'],)).fetchone()
    conn.close()
    if user and check_password_hash(user[4], data['password']):
        return jsonify({"message": "OK", "email": user[3]}), 200
    return jsonify({"error": "Invalid"}), 401

# CRITICAL: This matches the /entities/User/me path in your screenshots
@app.route('/api/apps/giggenius-crm/entities/User/me', methods=['GET', 'OPTIONS'])
def get_me():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    email = request.headers.get('User-Email')
    conn = sqlite3.connect(MAIN_DB)
    conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT first_name, last_name, email FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return jsonify(dict(user)) if user else jsonify({"error": "Not found"}), 404

# CRITICAL: This handles the data for all tabs (Contacts, Tasks, Campaigns, etc.)
@app.route('/api/apps/giggenius-crm/entities/<entity>', methods=['GET', 'POST', 'OPTIONS'])
def handle_entities(entity):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    db_path = get_user_db_path()
    if not db_path: return jsonify({"error": "No Database"}), 401
    
    mapping = {
        'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts', 
        'ProjectTask': 'project_tasks', 'Task': 'project_tasks', 'Invoice': 'invoices', 
        'Campaign': 'campaigns', 'Project': 'projects', 'Deal': 'deals'
    }
    table = mapping.get(entity)
    if not table: return jsonify([]), 200

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    if request.method == 'GET':
        query = f"SELECT * FROM {table}"
        params = []
        # Support tab-specific filtering (like type=contract)
        if request.args:
            filters = [f"{k} = ?" for k in request.args.keys() if k not in ['_sort', '_order', '_limit', '_page']]
            if filters:
                query += " WHERE " + " AND ".join(filters)
                params = [v for k, v in request.args.items() if k not in ['_sort', '_order', '_limit', '_page']]
        
        res = conn.execute(query + " ORDER BY id DESC", tuple(params)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in res]), 200

    if request.method == 'POST':
        data = request.json
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)