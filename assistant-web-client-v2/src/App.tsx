import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginCallback from './pages/LoginCallback';
import Workspace from './pages/Workspace';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
function App() {
  return (
    <div className="flex flex-col h-screen">
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
      <Navbar/>
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login-success" element={<LoginCallback />} />
            <Route path="/workspace" element={<Workspace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </div>
  );
}

export default App;