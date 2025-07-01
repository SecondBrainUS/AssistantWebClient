import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginCallback from './pages/LoginCallback';
import Workspace from './pages/Workspace';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/home" element={<LoginCallback />} />
          <Route path="/login-success" element={<LoginCallback />} />
          <Route path="/workspace" element={<Workspace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;