import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginCallback from './pages/LoginCallback';
import Workspace from './pages/Workspace';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router basename="/assistant">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login-success" element={<LoginCallback />} />
          <Route path="/workspace" element={<Workspace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;