import './Main.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-calendar/dist/Calendar.css';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';



function Main() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState(null);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [priority, setPriority] = useState('low');
  const [editingTask, setEditingTask] = useState(null);
  const [userId, setUserId] = useState(null);

 


  const openCalendar = () => {
    setShowCalendar(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
  };

  const handleDateChange = (date) => {
    console.log('Received Date:', date);
  
    try {
      // Use moment.js to parse the date
      const parsedDate = moment(date);
  
      console.log('Parsed Date:', parsedDate);
  
      if (!parsedDate.isValid()) {
        throw new Error('Invalid date format');
      }
  
      setDueDate(parsedDate.toDate());
    } catch (error) {
      console.error('Error parsing date:', error);
      toast.error('Invalid date format. Please enter a valid date.');
      setDueDate(new Date()); // Reset to a default value or handle accordingly
    }
  };


  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tasks`);
      console.log('API Response:', response);
      const tasks = response.data;
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Error fetching tasks. Please try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);


  const createTask = async (taskData) => {
    console.log('Creating task with due date:', dueDate);
    try {
      const taskWithDate = {
        ...taskData,
        due_date: dueDate ? dueDate.toISOString() : null,
      };
  
      if (!taskWithDate.title || taskWithDate.title.trim() === '') {
        toast.error('Please enter a task title.');
        return;
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (dueDate < today) {
        toast.error('Due date must be today or in the future.');
        return;
      }
  
      const response = await axios.post(
        'http://localhost:5000/tasks',
        {
          ...taskWithDate,
          priority: priority, // Add priority to task data
          due_date: dueDate ? dueDate.toISOString() : null, // Change due_date to dueDate
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        fetchTasks();
        setNewTaskTitle('');
        setDescription('');
        setDueDate(new Date());
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Error creating task. Please try again.');
    }
  };
  

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/tasks/${taskId}`, 
        {
          ...taskData, 
          priority:priority,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Update Task Response:', response); // Log the response to check the completed status
      if (taskData.completed) {
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
          taskElement.style.textDecoration = 'line-through';
          console.log('Text Decoration Applied'); // Log that the text decoration is applied
        }
      }
  
      if (response.status === 200) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Error updating task. Please try again.');
    }
  };
  

  const toggleCompleted = async (taskId) => {
    console.log('Toggle Completed called for task ID:', taskId);
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
  
      if (taskToUpdate) {
        const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
        const response = await axios.put(`http://localhost:0/tasks/${taskId}`, updatedTask);
  
        if (response.status === 200) {
          fetchTasks();
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError('Error toggling task completion. Please try again.');
    }
  };
  

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Error deleting task. Please try again.');
    }
  };

  

  return (
    <div className="Main">
      <h1 className="Header">
        Hi Simon, 
      </h1>
      <h2 className="todo">
        what do you have planned? 
      </h2>
  
      <div className="App">
        <header className="App-container">
          <h2 className="bubbly-text">
            Create a New Task
          </h2>
          <div className="Task-Title">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className="Task-Description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
            />
          </div>
  
          <div className="Task-Priority">
            <label className="priority-label">Priority:</label>
            <div className="priority-buttons">
              <button
                className={`priority-button ${priority === 'high' ? 'selected' : ''}`}
                onClick={() => setPriority('high')}
              >
                High
              </button>
              <button
                className={`priority-button ${priority === 'low' ? 'selected' : ''}`}
                onClick={() => setPriority('low')}
              >
                Low
              </button>
            </div>
          </div>
    
          <div className="DueDate">
            <span>Deadline: </span>
            <span className="CalendarIcon"  onClick={showCalendar ? closeCalendar : openCalendar}>
              📅
            </span>
            <span className="SelectedDate">
              {dueDate && new Intl.DateTimeFormat('en-UK', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(dueDate))}
            </span>
          </div>
  
          {showCalendar && (
            <div className="CalendarModal">
              <Datetime onChange={handleDateChange} value={dueDate} open={true} inputProps={{ readOnly: true }}/>
            </div>
          )}
    
          <button
            className="create_button"
            onClick={() =>
              createTask({
                title: newTaskTitle,
                description: description,
                due_date: dueDate ? dueDate.toISOString() : null,
              })
            }
          >
            Create Task
          </button>
        </header>
      </div>
      <TaskList tasks={tasks} toggleCompleted={toggleCompleted} deleteTask={deleteTask} dueDate={dueDate}/>
  
      <ToastContainer />
      
    </div>
  );
          }

  

export default Main;
