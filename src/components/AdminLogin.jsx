import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const AdminLogin = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Seguridad: si por alguna razón sigue undefined, usar fallback conocido
  const baseUrl = API_BASE_URL || 'http://127.0.0.1:5000';

  // Si ya hay sesión guardada, redirigir directamente
  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
  const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error en el inicio de sesión');
        return;
      }

      // Guardar datos del usuario
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Notificar al padre y redirigir
      if (onLogin) onLogin();
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md space-y-8 bg-gray-950 rounded-2xl p-8 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <motion.div
            className="bg-yellow-500 rounded-full p-3 inline-block mx-auto mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <svg
              className="h-8 w-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
              <path d="M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0"></path>
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Panel Administrativo de Bingo</h2>
          <p className="text-sm text-gray-400 mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Usuario"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-t-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-b-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Iniciar Sesión
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
