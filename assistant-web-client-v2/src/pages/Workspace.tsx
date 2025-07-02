import { useAuth } from '../context/AuthContext';

const Workspace = () => {
  const { user, loading, refreshUser, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Please log in to access the workspace.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workspace</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Welcome, {user.name || user.email}
          </div>
          <button 
            onClick={refreshUser}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            Refresh
          </button>
          <button 
            onClick={logout}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p>Your workspace content goes here...</p>
      </div>
    </div>
  );
};

export default Workspace;