import { AUTH_ENDPOINTS } from '../config';

const Login = () => {
	const handleLogin = () => {
	  window.location.href = AUTH_ENDPOINTS.loginRedirect;
	};
  
	return (
      <div>
        <h2>Login</h2>
        <button onClick={handleLogin}>Login with Google</button>
      </div>
  );
};
  
export default Login;