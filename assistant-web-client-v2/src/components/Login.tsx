const Login = () => {
	const handleLogin = () => {
	  window.location.href = `${import.meta.env.VITE_BASE_PATH}${import.meta.env.VITE_API_PATH}/auth/google/login`;
	};
  
	return (
	  <div>
		<h2>Login</h2>
		<button onClick={handleLogin}>Login with Google</button>
	  </div>
	);
  };
  
  export default Login;