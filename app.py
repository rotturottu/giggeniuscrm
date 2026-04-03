from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
import json
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
# Enable CORS and allow the User-Email header for cross-domain requests
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
    tables = [
        'departments', 'employees', 'contacts', 'project_tasks', 
        'projects', 'campaigns', 'time_entries'
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
            
        c.execute(f'''CREATE TABLE IF NOT EXISTS {table}
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, {schema}, 
                      user_email TEXT, created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    conn.commit()
    conn.close()

init_db()

def get_valid_user_email(headers):
    # 1. Try the Header first
    email = headers.get('User-Email')
    
    # 2. If Header is empty, look inside the actual data being sent (The Body)
    if email in [None, '', 'null', 'undefined']:
        try:
            if request.is_json:
                data = request.get_json(silent=True)
                if data:
                    # Look for the email in ANY of these common fields
                    email = data.get('user_email') or data.get('employee_email') or data.get('email')
        except:
            pass

    # 3. Final check
    if email in [None, '', 'null', 'undefined']:
        return None
    return email

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
        return jsonify({"message": "Login successful!", "email": user[3]}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/apps/giggenius-crm/entities/User/me', methods=['GET', 'PUT', 'OPTIONS'])
def handle_me():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = get_valid_user_email(request.headers)
    
    if not user_email: 
        return jsonify({"error": "No valid user email provided"}), 401
    
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if request.method == 'GET':
        c.execute("SELECT id, first_name, last_name, email, profile_picture FROM users WHERE email=?", (user_email,))
        user_row = c.fetchone()
        conn.close()
        if user_row:
            u = dict(user_row)
            return jsonify({"id": u['id'], "firstName": u['first_name'], "lastName": u['last_name'],
                            "email": u['email'], "profilePicture": u['profile_picture'], "role": "user"}), 200
        return jsonify({"error": "User not found"}), 404
    
    if request.method == 'PUT':
        data = request.json
        c.execute("UPDATE users SET first_name=?, last_name=?, email=?, profile_picture=? WHERE email=?",
                  (data.get('firstName'), data.get('lastName'), data.get('email'), data.get('profilePicture'), user_email))
        conn.commit()
        conn.close()
        return jsonify({"message": "Profile updated successfully"}), 200

# --- GENERIC ENTITY HANDLERS ---
@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST', 'OPTIONS'])
def handle_base44_list_create(entity_name):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200

    table_map = {
        'User': 'users', 'Department': 'departments', 'Employee': 'employees', 
        'Contact': 'contacts', 'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 
        'Invoice': 'invoices', 'Campaign': 'campaigns', 'Project': 'projects', 
        'TimeEntry': 'time_entries'
    }
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify([]), 200
    
    user_email = get_valid_user_email(request.headers)
    
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()

    if request.method == 'GET':
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        
        query = f"SELECT * FROM {table_name}"
        params = []
        where_clauses = []

        if 'user_email' in db_cols:
            if user_email:
                where_clauses.append("user_email = ?")
                params.append(user_email)
            else:
                conn.close()
                return jsonify([]), 200

        for key, value in request.args.items():
            if key in db_cols:
                where_clauses.append(f"{key} = ?")
                params.append(value)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        c.execute(query + " ORDER BY id DESC", tuple(params))
        data = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(data), 200

    if request.method == 'POST':
        request_data = request.json
        items_to_process = request_data if isinstance(request_data, list) else [request_data]
        
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        
        results = []

        try:
            for item in items_to_process:
                if 'user_email' in db_cols:
                    if user_email:
                        item['user_email'] = user_email
                    else:
                        raise Exception("Anonymous posting not allowed")
                
                cleaned_data = {k: v for k, v in item.items() if k in db_cols}
                
                columns = ', '.join(cleaned_data.keys())
                placeholders = ', '.join(['?'] * len(cleaned_data))
                
                c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", tuple(cleaned_data.values()))
                cleaned_data['id'] = c.lastrowid
                results.append(cleaned_data)
            
            conn.commit()
            return jsonify(results if isinstance(request_data, list) else results[0]), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_base44_single_item_action(entity_name, entity_id):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = get_valid_user_email(request.headers)
    
    table_map = {
        'Invoice': 'invoices', 'Contact': 'contacts', 'ProjectTask': 'project_tasks', 
        'Campaign': 'campaigns', 'Project': 'projects', 'TimeEntry': 'time_entries',
        'Employee': 'employees', 'Department': 'departments'
    }
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify({}), 200

    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()

    c.execute(f"PRAGMA table_info({table_name})")
    db_cols = [col[1] for col in c.fetchall()]

    if request.method == 'DELETE':
        query = f"DELETE FROM {table_name} WHERE id = ?"
        params = [entity_id]
        
        if 'user_email' in db_cols:
            if user_email:
                query += " AND user_email = ?"
                params.append(user_email)
            else:
                conn.close()
                return jsonify({"error": "Unauthorized"}), 401
                
        c.execute(query, tuple(params))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200

    if request.method == 'PUT':
        data = request.json
        cleaned_data = {k: v for k, v in data.items() if k in db_cols}
        
        if 'user_email' in cleaned_data:
            cleaned_data['user_email'] = user_email

        set_clause = ', '.join([f"{k} = ?" for k in cleaned_data.keys()])
        
        query = f"UPDATE {table_name} SET {set_clause} WHERE id = ?"
        params = list(cleaned_data.values()) + [entity_id]
        
        if 'user_email' in db_cols:
            if user_email:
                query += " AND user_email = ?"
                params.append(user_email)
            else:
                conn.close()
                return jsonify({"error": "Unauthorized"}), 401
                
        c.execute(query, tuple(params))
        conn.commit()
        conn.close()
        return jsonify(cleaned_data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)