from datetime import datetime
from os import environ
from flask import Flask, request, jsonify, render_template, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = environ.get('SECRET_KEY', 'change-this-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get(
    'DB_URL', 'postgresql://postgres:postgres@localhost:5432/postgres'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')

    def json(self):
        return {'id': self.id, 'username': self.username, 'email': self.email}


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default='')
    priority = db.Column(db.String(20), nullable=False, default='Medium')
    status = db.Column(db.String(20), nullable=False, default='Pending')
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description or '',
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else '',
            'created_at': self.created_at.isoformat() if self.created_at else ''
        }
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default='')
    category = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def json(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'category': self.category,
            'price': self.price,
            'stock': self.stock,
            'created_at': self.created_at.isoformat() if self.created_at else ''
        }


with app.app_context():
    db.create_all()


def current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return db.session.get(User, user_id)


def error(message, code=400):
    return jsonify({'message': message}), code


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Task Management API is working'})


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not email or not password:
        return error('Username, email and password are required')
    if len(password) < 6:
        return error('Password must contain at least 6 characters')
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return error('Username or email already exists', 409)

    user = User(username=username, email=email, password=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'message': 'Registration successful', 'user': user.json()}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')
    user = User.query.filter((User.username == identifier) | (User.email == identifier.lower())).first()

    if not user or not check_password_hash(user.password, password):
        return error('Invalid username/email or password', 401)

    session['user_id'] = user.id
    return jsonify({'message': 'Login successful', 'user': user.json()})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})


@app.route('/api/me', methods=['GET'])
def me():
    user = current_user()
    if not user:
        return error('Not logged in', 401)
    return jsonify({'user': user.json()})


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user = current_user()
    if not user:
        return error('Please login first', 401)

    status = request.args.get('status')
    priority = request.args.get('priority')
    search = request.args.get('search', '').strip()

    query = Task.query.filter_by(user_id=user.id)
    if status and status != 'All':
        query = query.filter_by(status=status)
    if priority and priority != 'All':
        query = query.filter_by(priority=priority)
    if search:
        query = query.filter(Task.title.ilike(f'%{search}%'))

    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([task.json() for task in tasks])


@app.route('/api/tasks', methods=['POST'])
def create_task():
    user = current_user()
    if not user:
        return error('Please login first', 401)

    data = request.get_json(silent=True) or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    priority = data.get('priority', 'Medium')
    status = data.get('status', 'Pending')
    due_date = data.get('due_date') or None

    if not title:
        return error('Task title is required')
    if priority not in ['Low', 'Medium', 'High']:
        return error('Invalid priority')
    if status not in ['Pending', 'In Progress', 'Completed']:
        return error('Invalid status')

    parsed_date = None
    if due_date:
        try:
            parsed_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        except ValueError:
            return error('Due date must be YYYY-MM-DD')

    task = Task(title=title, description=description, priority=priority,
                status=status, due_date=parsed_date, user_id=user.id)
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task created', 'task': task.json()}), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    user = current_user()
    if not user:
        return error('Please login first', 401)

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return error('Task not found', 404)

    data = request.get_json(silent=True) or {}
    title = data.get('title', task.title).strip()
    if not title:
        return error('Task title is required')

    priority = data.get('priority', task.priority)
    status = data.get('status', task.status)
    if priority not in ['Low', 'Medium', 'High']:
        return error('Invalid priority')
    if status not in ['Pending', 'In Progress', 'Completed']:
        return error('Invalid status')

    task.title = title
    task.description = data.get('description', task.description or '').strip()
    task.priority = priority
    task.status = status
    due_date = data.get('due_date')
    if due_date:
        try:
            task.due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        except ValueError:
            return error('Due date must be YYYY-MM-DD')
    else:
        task.due_date = None

    db.session.commit()
    return jsonify({'message': 'Task updated', 'task': task.json()})


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    user = current_user()
    if not user:
        return error('Please login first', 401)

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return error('Task not found', 404)

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify([product.json() for product in products])

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    user = current_user()
    if not user:
        return error('Please login first', 401

    tasks = Task.query.filter_by(user_id=user.id).all()
    return jsonify({
        'total': len(tasks),
        'pending': sum(task.status == 'Pending' for task in tasks),
        'in_progress': sum(task.status == 'In Progress' for task in tasks),
        'completed': sum(task.status == 'Completed' for task in tasks),
        'high_priority': sum(task.priority == 'High' for task in tasks)
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)
