import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { Search, Plus, Edit, Trash2, Loader } from 'lucide-react';  
import { Link } from 'react-router-dom';  
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

const UserList = () => {  
  const [search, setSearch] = useState('');  
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const cargarParticipantes = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        setError('No hay usuario logueado');
        return;
      }

      const user = JSON.parse(userStr);
      const params = {
        usuario_id: user.id,
        tipo_usuario: user.tipo_usuario
      };

      const response = await axios.get('/api/participantes', { params });
      if (response.data.success) {
        setParticipantes(response.data.participantes || []);
      } else {
        setError(response.data.message || 'Error al cargar participantes');
      }
    } catch (err) {
      console.error('Error al cargar participantes:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (participanteId) => {
    if (!window.confirm('¿Está seguro de eliminar este participante?')) {
      return;
    }

    try {
      const userStr = localStorage.getItem('usuario');
      const user = JSON.parse(userStr);
      
      const response = await axios.delete(`/api/participante/${participanteId}/${user.tipo_usuario}`, {
        data: { usuario_id: user.id }
      });

      if (response.data.success) {
        alert('Participante eliminado correctamente');
        cargarParticipantes();
      } else {
        alert(response.data.message || 'Error al eliminar participante');
      }
    } catch (err) {
      console.error('Error al eliminar participante:', err);
      alert(err.response?.data?.message || 'Error al eliminar participante');
    }
  };

  const filteredUsers = participantes.filter(user =>  
    (user.nombre || '').toLowerCase().includes(search.toLowerCase()) ||  
    (user.apellido || '').toLowerCase().includes(search.toLowerCase()) ||  
    (user.cedula || '').includes(search)  
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }  

  return (  
    <div className="p-6 lg:p-10">  
      <motion.div className="mb-6 flex items-center justify-between">  
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionar Participantes</h1>  
        <Link to="/admin/add-user">  
          <motion.button  
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"  
            whileHover={{ scale: 1.05 }}  
          >  
            <Plus className="w-4 h-4" />  
            Añadir Participante  
          </motion.button>  
        </Link>  
      </motion.div>  

      <div className="mb-6">  
        <div className="relative">  
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />  
          <input  
            type="text"  
            value={search}  
            onChange={(e) => setSearch(e.target.value)}  
            placeholder="Buscar Participantess por nombre, apellido o cédula"  
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"  
          />  
        </div>  
      </div>  

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">  
        <table className="w-full">  
          <thead className="bg-gray-50 dark:bg-gray-800">  
            <tr>  
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nombre</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Apellido</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cédula</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cartones Registrados</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Acciones</th>  
            </tr>  
          </thead>  
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">  
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay participantes registrados
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (  
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>  
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.nombre || '-'}</td>  
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.apellido || '-'}</td>  
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.cedula || '-'}</td>  
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{(user.tablas || []).length}</td>  
                  <td className="px-6 py-4 text-sm">  
                    <div className="flex gap-4">  
                      <Link to={`/admin/user/${user._id}/cartones`} className="flex items-center gap-1 text-blue-600 hover:underline">  
                        <Edit className="w-4 h-4" />  
                        Ver Cartones  
                      </Link>  
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-1 text-red-600 hover:underline"
                      >  
                        <Trash2 className="w-4 h-4" />  
                        Borrar  
                      </button>  
                    </div>  
                  </td>  
                </motion.tr>  
              ))
            )}  
          </tbody>  
        </table>  
      </div>  
    </div>  
  );  
};  

export default UserList;