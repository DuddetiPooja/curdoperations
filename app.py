from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from os import environ

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DB_URL')
db = SQLAlchemy(app)


class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    department = db.Column(db.String(80), nullable=False)
    salary = db.Column(db.Float, nullable=False)

    def json(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'department': self.department,
            'salary': self.salary
        }


# Create tables
with app.app_context():
    db.create_all()


# Test route
@app.route('/test', methods=['GET'])
def test():
    return make_response(jsonify({'message': 'test route'}), 200)


# Create an employee
@app.route('/employees', methods=['POST'])
def create_employee():
    try:
        data = request.get_json()

        new_employee = Employee(
            name=data['name'],
            email=data['email'],
            department=data['department'],
            salary=data['salary']
        )

        db.session.add(new_employee)
        db.session.commit()

        return make_response(
            jsonify({'message': 'employee created'}),
            201
        )

    except Exception as e:
        return make_response(
            jsonify({'message': 'error creating employee'}),
            500
        )


# Get all employees
@app.route('/employees', methods=['GET'])
def get_employees():
    try:
        employees = Employee.query.all()

        return make_response(
            jsonify([employee.json() for employee in employees]),
            200
        )

    except Exception as e:
        return make_response(
            jsonify({'message': 'error getting employees'}),
            500
        )


# Get an employee by id
@app.route('/employees/<int:id>', methods=['GET'])
def get_employee(id):
    try:
        employee = Employee.query.filter_by(id=id).first()

        if employee:
            return make_response(
                jsonify({'employee': employee.json()}),
                200
            )

        return make_response(
            jsonify({'message': 'employee not found'}),
            404
        )

    except Exception as e:
        return make_response(
            jsonify({'message': 'error getting employee'}),
            500
        )


# Update an employee
@app.route('/employees/<int:id>', methods=['PUT'])
def update_employee(id):
    try:
        employee = Employee.query.filter_by(id=id).first()

        if employee:
            data = request.get_json()

            employee.name = data['name']
            employee.email = data['email']
            employee.department = data['department']
            employee.salary = data['salary']

            db.session.commit()

            return make_response(
                jsonify({'message': 'employee updated'}),
                200
            )

        return make_response(
            jsonify({'message': 'employee not found'}),
            404
        )

    except Exception as e:
        return make_response(
            jsonify({'message': 'error updating employee'}),
            500
        )


# Delete an employee
@app.route('/employees/<int:id>', methods=['DELETE'])
def delete_employee(id):
    try:
        employee = Employee.query.filter_by(id=id).first()

        if employee:
            db.session.delete(employee)
            db.session.commit()

            return make_response(
                jsonify({'message': 'employee deleted'}),
                200
            )

        return make_response(
            jsonify({'message': 'employee not found'}),
            404
        )

    except Exception as e:
        return make_response(
            jsonify({'message': 'error deleting employee'}),
            500
        )