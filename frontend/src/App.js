import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import Confirm from './pages/Confirm';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import Recipients from './pages/Recipients';
import FQQ from './pages/FAQ';
import MyAccounts from './pages/MyAccounts';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />  {/* ← add this */}
        <Route path="/signup" element={<Signup />} />
       <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
        <Route path="/confirm" element={<ProtectedRoute><Confirm /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/recipients" element={<ProtectedRoute><Recipients /></ProtectedRoute>} />
        <Route path="/faq" element={<FQQ />} />
        <Route path="/accounts" element={<ProtectedRoute><MyAccounts /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
