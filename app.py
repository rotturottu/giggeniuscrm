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
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT, last_name TEXT, email TEXT UNIQUE,
                  password TEXT, profile_picture TEXT)''')
    
    tables = ['departments', 'employees', 'contacts', 'project_tasks', 
              'projects', 'campaigns', 'time_entries', 'invoices']
    
    for table in tables:
        c.execute(f"PRAGMA table_info({table})")
        exists = c.fetchone()
        if not exists:
            # Simplified for creation; real logic uses specific schemas per your previous code
            c.execute(f"CREATE TABLE IF NOT EXISTS {table} (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT)")
    
    conn.commit()
    conn.close()

init_db()

def get_valid_user_email(headers):
    """The 'Master Key' Logic: Checks Header, then checks the JSON Body."""
    email = headers.get('User-Email')
    
    if email in [None, '', 'null', 'undefined']:
        try:
            if request.is_json:
                data = request.get_json(silent=True)
                if data:
                    # Look for the email inside the data packet itself
                    email = data.get('user_email') or data.get('employee_email') or data.get('email')
        except:
            pass

    if email in [None, '', 'null', 'undefined']:
        return None
    return email

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

@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST', 'OPTIONS'])
def handle_base44_list_create(entity_name):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    
    table_map = {'Department': 'departments', 'Employee': 'employees', 'Contact': 'contacts', 
                 'Task': 'project_tasks', 'ProjectTask': 'project_tasks', 'Invoice': 'invoices', 
                 'Campaign': 'campaigns', 'Project': 'projects', 'TimeEntry': 'time_entries'}
    
    table_name = table_map.get(entity_name)
    if not table_name: return jsonify([]), 200
    
    user_email = get_valid_user_email(request.headers)
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()

    if request.method == 'GET':
        query = f"SELECT * FROM {table_name} WHERE user_email = ? ORDER BY id DESC"
        c.execute(query, (user_email,))
        data = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(data), 200

    if request.method == 'POST':
        item = request.json
        if not user_email: return jsonify({"error": "Anonymous posting blocked"}), 401
        
        item['user_email'] = user_email
        c.execute(f"PRAGMA table_info({table_name})")
        db_cols = [col[1] for col in c.fetchall()]
        cleaned_data = {k: v for k, v in item.items() if k in db_cols}
        
        columns = ', '.join(cleaned_data.keys())
        placeholders = ', '.join(['?'] * len(cleaned_data))
        c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", tuple(cleaned_data.values()))
        cleaned_data['id'] = c.lastrowid
        conn.commit()
        conn.close()
        return jsonify(cleaned_data), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_base44_single_item_action(entity_name, entity_id):
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    user_email = get_valid_user_email(request.headers)
    if not user_email: return jsonify({"error": "Unauthorized"}), 401

    table_map = {'TimeEntry': 'time_entries', 'ProjectTask': 'project_tasks', 'Campaign': 'campaigns'}
    table_name = table_map.get(entity_name)
    
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()

    if request.method == 'PUT':
        data = request.json
        data['user_email'] = user_email
        set_clause = ', '.join([f"{k} = ?" for k in data.keys() if k != 'id'])
        query = f"UPDATE {table_name} SET {set_clause} WHERE id = ? AND user_email = ?"
        c.execute(query, list(data.values()) + [entity_id, user_email])
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)