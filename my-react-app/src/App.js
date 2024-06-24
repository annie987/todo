import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from './Main';
import TaskList from './TaskList';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>

          <Route exact path="/" element={<Main />} />
          <Route exact path="/TaskList" element={<TaskList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
