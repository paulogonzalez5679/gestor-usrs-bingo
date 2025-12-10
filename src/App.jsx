import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLogin from './components/AdminLogin';
import Header from './components/Header';
import UserList from './components/UserList';
import AddUserForm from './components/AddUserForm';
import UserCartons from './components/UserCartons';
import BingoCardView from './components/BingoCardView';
import CartonSearch from './components/CartonSearch';
import AddCartonForm from './components/AddCartonForm';
import Reports from './components/Reports';
import BuscarParticipante from './components/BuscarParticipante';
import PublicBuscar from './components/PublicBuscar';

const AdminLayout = ({ onLogout }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <Header onLogout={onLogout} />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

// 🔐 Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('usuario');
  return user ? children : <Navigate to="/login" replace />;
};

// 🔐 Componente para proteger ruta de reportes (solo tipo 0)
const ProtectedReportsRoute = ({ children }) => {
  const userStr = localStorage.getItem('usuario');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    // Solo usuarios con tipo 0 pueden ver reportes
    if (user.tipo_usuario === 0 || user.tipo_usuario === '0') {
      return children;
    } else {
      return <Navigate to="/admin/users" replace />;
    }
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // Verificar sesión al cargar la app
  useEffect(() => {
    const user = localStorage.getItem('usuario');
    setAdminLoggedIn(!!user);
  }, []);

  // 🔓 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setAdminLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Página de login */}
        <Route
          path="/login"
          element={
            adminLoggedIn ? (
              <Navigate to="/admin/users" replace />
            ) : (
              <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
            )
          }
        />

        {/* Redirección raíz */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas protegidas del panel admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<UserList />} />
          <Route path="add-user" element={<AddUserForm />} />
          {/* Rutas de cartones - Accesibles para todos los tipos de usuario */}
          <Route path="user/:userId/cartones" element={<UserCartons />} />
          <Route path="user/:userId/add-carton" element={<AddCartonForm />} />
          <Route path="cartones" element={<CartonSearch />} />
          <Route path="buscar-participante" element={<BuscarParticipante />} />
          <Route path="cartones/:cartonId" element={<BingoCardView />} />
          <Route 
            path="reportes" 
            element={
              <ProtectedReportsRoute>
                <Reports />
              </ProtectedReportsRoute>
            } 
          />
        </Route>

        {/* Cualquier otra ruta → login */}
        <Route path="/buscar" element={<PublicBuscar />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
