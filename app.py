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

@app.route('/<path:catchall>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def intercept_base44(catchall):
    print(f"\n🚨 BASE44 SDK KNOCKING AT DOOR: /{catchall}")
    print(f"METHOD: {request.method}")
    print(f"DATA: {request.get_json(silent=True)}")
    print("------------------------------------------\n")
    
    # Send a fake success back so the React modal finally closes!
    return jsonify({"message": "Intercepted!", "id": 999}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)