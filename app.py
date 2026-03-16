from flask import Flask, request, jsonify
from flask_cors import CORS 
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app) 

def init_db():
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
        
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT,
                  last_name TEXT,
                  email TEXT UNIQUE,
                  password TEXT)''')
                  
    c.execute('''CREATE TABLE IF NOT EXISTS departments
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  head_email TEXT,
                  description TEXT,
                  budget REAL,
                  currency TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS employees
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  first_name TEXT,
                  last_name TEXT,
                  email TEXT,
                  department TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS leave_requests
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT,
                  employee_email TEXT,
                  leave_type TEXT,
                  start_date TEXT,
                  end_date TEXT,
                  reason TEXT,
                  employee_id INTEGER,  
                  days_count INTEGER,
                  status TEXT DEFAULT 'Pending',
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    # 10. Payroll Records
    c.execute('''CREATE TABLE IF NOT EXISTS payroll_records
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT,
                  employee_email TEXT,
                  period_start TEXT,
                  period_end TEXT,
                  currency TEXT,
                  base_salary REAL,
                  hours_worked REAL,
                  overtime_hours REAL,
                  overtime_pay REAL,
                  bonuses REAL,
                  deductions REAL,
                  tax REAL,
                  net_pay REAL,
                  notes TEXT,  
                  status TEXT DEFAULT 'draft',
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS conversations
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  contact_name TEXT,
                  contact_email TEXT,
                  subject TEXT,
                  platform TEXT,
                  status TEXT,
                  unread_count INTEGER DEFAULT 0,
                  last_message TEXT,
                  last_message_at DATETIME,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  conversation_id INTEGER,
                  sender_name TEXT,
                  sender_email TEXT,
                  content TEXT,
                  platform TEXT,
                  is_outbound BOOLEAN,
                  read BOOLEAN,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS projects
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  description TEXT,
                  status TEXT,
                  budget REAL,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS project_tasks
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT,
                  list_name TEXT,
                  status TEXT,
                  parent_task_id INTEGER,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    c.execute('''CREATE TABLE IF NOT EXISTS contacts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  email TEXT,
                  phone TEXT,
                  company TEXT,
                  status TEXT,
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS performance_reviews
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  employee_name TEXT,
                  employee_email TEXT,
                  reviewer_email TEXT, 
                  review_period TEXT,
                  overall_rating TEXT,
                  goals_met TEXT,
                  strengths TEXT,
                  areas_of_improvement TEXT,
                  goals_for_next_period TEXT,
                  additional_comments TEXT,
                  status TEXT DEFAULT 'Draft',
                  created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    conn.commit()
    conn.close()

init_db()

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

@app.route('/api/contacts', methods=['GET', 'POST'])
def manage_contacts():
    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row # This magically formats the data as JSON dictionaries!
    c = conn.cursor()

    # If React is ASKING for contacts to display on the page
    if request.method == 'GET':
        c.execute("SELECT * FROM contacts ORDER BY created_date DESC")
        contacts = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(contacts)

    # If React is SENDING a new contact from the "Add Contact" button
    if request.method == 'POST':
        data = request.json
        c.execute('''INSERT INTO contacts (name, email, phone, company, status) 
                     VALUES (?, ?, ?, ?, ?)''', 
                  (data.get('name'), data.get('email'), data.get('phone'), data.get('company'), data.get('status')))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({"message": "Contact added!", "id": new_id}), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>', methods=['GET', 'POST'])
def handle_base44_entities(entity_name):
    table_map = {
        'Department': 'departments',
        'Employee': 'employees',
        'Contact': 'contacts',
        'Task': 'project_tasks',
        'Project': 'projects',
        'Conversation': 'conversations',
        'LeaveRequest': 'leave_requests',
        'PayrollRecord': 'payroll_records',
        'PerformanceReview': 'performance_reviews' 
    }
    
    table_name = table_map.get(entity_name)
    if not table_name:
        return jsonify({"error": f"Table for {entity_name} not found"}), 404

    conn = sqlite3.connect('giggenius.db')
    conn.row_factory = sqlite3.Row 
    c = conn.cursor()

    # READ: React is asking for the list of items
    if request.method == 'GET':
        c.execute(f"SELECT * FROM {table_name} ORDER BY id DESC")
        data = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(data), 200

    # CREATE: React is saving a new item
    if request.method == 'POST':
        data = request.json
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        values = tuple(data.values())
        
        c.execute(f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})", values)
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        
        data['id'] = new_id
        return jsonify(data), 201

@app.route('/api/apps/giggenius-crm/entities/<entity_name>/<entity_id>', methods=['PUT', 'DELETE'])
def handle_base44_single_item(entity_name, entity_id):
    table_map = {
        'Department': 'departments',
        'Employee': 'employees',
        'Contact': 'contacts',
        'Task': 'project_tasks',
        'Project': 'projects',
        'Conversation': 'conversations',
        'LeaveRequest': 'leave_requests',
        'PayrollRecord': 'payroll_records',
        'PerformanceReview': 'performance_reviews' # <--- NEW ADDITION
    }
    table_name = table_map.get(entity_name)
    
    conn = sqlite3.connect('giggenius.db')
    c = conn.cursor()
    
    # DELETE: React clicked the Trash icon
    if request.method == 'DELETE':
        c.execute(f"DELETE FROM {table_name} WHERE id = ?", (entity_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
        
    # UPDATE: React clicked the Edit icon and saved
    if request.method == 'PUT':
        data = request.json
        set_clause = ', '.join([f"{k} = ?" for k in data.keys()])
        values = tuple(data.values()) + (entity_id,)
        
        c.execute(f"UPDATE {table_name} SET {set_clause} WHERE id = ?", values)
        conn.commit()
        conn.close()
        return jsonify(data), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)