import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();

  const handleLogin = () => {
    // Aquí puedes agregar lógica para autenticar al usuario
    login();
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
