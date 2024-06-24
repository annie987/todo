from flask import Flask, request, jsonify, Response, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime
import json


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mytasks.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app, resources={r"/*": {"origins": "*"}})


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.DateTime)
    priority = db.Column(db.String(10), default='low')

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'due_date': self.due_date.strftime('%Y-%m-%d %H:%M:%S') if self.due_date else None,
            'priority':self.priority
        }

@app.route("/")
def home():
    return "Welcome to the Task Manager!"

@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.serialize())
    
@app.route("/tasks", methods=["GET"])
def get_all_tasks():
    tasks = Task.query.all()
    task_list = [
        {"id": task.id, 
        "title": task.title, 
        "description": task.description, 
        "completed": task.completed, 
        "due_date": task.due_date,
        "priority": task.priority}
        for task in tasks
    ]
    return Response(json.dumps(task_list, default=str), content_type="application/json")


@app.route("/tasks", methods=["POST"])
def create_task():
    # Your existing code for creating tasks

    data = request.json
    due_date = datetime.strptime(data.get("due_date", ""), '%Y-%m-%dT%H:%M:%S.%fZ') if data.get("due_date") else None
    priority = data.get("priority", 1)
    print('Received Due Date:', due_date)

    new_task = Task(
        title=data["title"],
        description=data["description"],
        completed=data.get("completed", False),
        due_date=due_date,
        priority = data.get("priority", 'low') 
    )
    print('New Task:', new_task.serialize())

    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task created successfully"}), 200



@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.completed = data.get("completed", task.completed)
    task.due_date = datetime.strptime(data.get("due_date", ""), '%Y-%m-%d %H:%M:%S.%f') if data.get("due_date") else None
    task.priority = data.get("priority", 'low')
    
    db.session.commit()
    updated_task = Task.query.get(task_id)
    return jsonify({"message": "Task updated successfully"})


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"})

if __name__ == "__main__":
    app.run(debug=True)
