import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LogOut, ArrowLeft, User } from 'lucide-react';  
import { Link, useNavigate } from 'react-router-dom';  
import { logoutAdmin } from '../utils/auth';  

const Header = ({ title, backLink, showNav = true, onLogout }) => {  
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // Obtener nombre del usuario logueado
  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Intentar obtener el nombre de diferentes campos posibles
        const name = user.nombres || user.nombre || user.usuario || user.nombre_completo || 'Usuario';
        setUserName(name);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  }, []);

  // Verificar si el usuario tiene tipo 0 para mostrar enlace de reportes
  const canViewReports = () => {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.tipo_usuario === 0 || user.tipo_usuario === '0';
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    // Limpiar el nombre del usuario
    setUserName('');
    
    // Prefer parent handler so App can update its state immediately
    if (onLogout) {
      // parent should handle removal from storage if needed
      onLogout();
      navigate('/login');
      return;
    }

    logoutAdmin();
    navigate('/login');
  };

  return (  
    <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 lg:px-10 py-3 bg-white dark:bg-gray-900">  
      <div className="flex items-center gap-4">  
        {backLink && (  
          <motion.button  
            onClick={() => navigate(backLink)}  
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300"  
            whileHover={{ scale: 1.05 }}  
          >  
            <ArrowLeft className="w-5 h-5" />  
          </motion.button>  
        )}  
        <div className="text-blue-600 w-7 h-7 flex items-center justify-center rounded">  
          <svg fill="none" viewBox="0 0 48 48">  
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor" />  
          </svg>  
        </div>  
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>  
      </div>  

      {showNav && (  
        <nav className="hidden md:flex items-center gap-6">  
          <Link to="/admin/users" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">Participantes</Link>  
          <Link to="/admin/buscar-participante" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">Buscar</Link>
          <Link to="/admin/cartones" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">Cartones</Link>  
          {canViewReports() && (
            <Link to="/admin/reportes" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">Reportes</Link>  
          )}
        </nav>  
      )}  

      <div className="flex items-center gap-4">  
        {userName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {userName}
            </span>
          </div>
        )}
        <motion.button  
          className="flex w-10 h-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"  
          whileHover={{ scale: 1.05 }}  
          onClick={handleLogout}
          title="Cerrar sesión"
        >  
          <LogOut className="w-5 h-5" /> 
        </motion.button>  
      </div>  
    </header>  
  );  
};  

export default Header;