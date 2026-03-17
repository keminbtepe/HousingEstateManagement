import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import './index.css';

function App() {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <MainLayout /> : <Login />;
}

export default App;
