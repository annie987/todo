import React, { useEffect, useState } from 'react';
import './Main.css';


function TaskList({ tasks, toggleCompleted, deleteTask}) {
  const comparePriority = (taskA, taskB) => {
    if (taskA.priority === 'high' && taskB.priority !== 'high') {
      return -1; // taskA (high priority) comes before taskB (low priority)
    } else if (taskA.priority !== 'high' && taskB.priority === 'high') {
      return 1; // taskA (low priority) comes after taskB (high priority)
    } else {
      return 0; // tasks have the same priority or both are not high or low
    }
  };

  useEffect(() => {
    console.log('Received Tasks in TaskList:', tasks);
  }, [tasks]);

  // Sort tasks based on priority before rendering
  const sortedTasks = [...tasks].sort(comparePriority);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update the current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const calculateTimeLeft = (dueDate) => {
  const now = new Date();
  const dueDateTime = new Date(dueDate);
  const timeDifference = dueDateTime - now;

  if (timeDifference <= 0) {
    return 'Expired'; // or any message you prefer for tasks that have passed their due date
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  // Build the formatted string
  let timeLeftString = '';
  if (days > 0) {
    timeLeftString += `${days} day${days > 1 ? 's' : ''} `;
  }
  if (hours > 0) {
    timeLeftString += `${hours} hour${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0) {
    timeLeftString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return timeLeftString.trim(); // Trim any extra whitespace
}

  return (
    <div className="TaskList">
      <div className="text-center">
        <strong>{currentTime.toDateString()}</strong>
        <br />
        <strong className="time">{currentTime.toLocaleTimeString()}</strong>
      </div>

      <ul>
        {sortedTasks.map((task) => (
          <li key={task.id} id={`task-${task.id}`} className="task-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompleted(task.id)}
              />
            </label>
            <div className="task-details">
              <strong className="title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.title} 
                {task.priority === 'high' ? ' 🔴' : '🟡'}

              </strong>

              <p className="description" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                {task.description}
              </p>
            </div>
            <div className="task-actions">
              {task.due_date && (
                <div className="due-date-container">
                          <p className="alert_due">
                            {new Intl.DateTimeFormat('en-UK', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(task.due_date)).replace(',', '')}
                        </p>
                </div>
              )}
              <button className="delete-button" onClick={() => deleteTask(task.id)}>
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
