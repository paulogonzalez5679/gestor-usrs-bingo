import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { Search, Plus, Eye, Trash2, ArrowLeft, Award, X, Loader } from 'lucide-react';  
import { useParams, Link, useNavigate } from 'react-router-dom';  
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'https://remote-aka-contracting-vocabulary.trycloudflare.com';
axios.defaults.baseURL = API_BASE_URL;

/**
 * Componente para ver los cartones de un participante
 * Accesible para todos los tipos de usuario (tipo 0 y otros tipos)
 * Todos los usuarios tienen la misma funcionalidad completa
 */
const UserCartons = () => {  
  const { userId } = useParams();  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartones, setCartones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');  

  useEffect(() => {
    cargarDatos();
  }, [userId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Obtener tablas del participante
      const response = await axios.get(`/api/obtenerTablasParticipante/${userId}`);
      if (response.data.success) {
        setCartones(response.data.tablas || []);
        // Obtener información del participante desde la lista
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const participantesResponse = await axios.get('/api/participantes', {
            params: {
              usuario_id: currentUser.id,
              tipo_usuario: currentUser.tipo_usuario
            }
          });
          if (participantesResponse.data.success) {
            const participante = participantesResponse.data.participantes.find(p => p._id === userId);
            if (participante) {
              setUser(participante);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar los cartones del participante');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tablaId) => {
    if (!window.confirm('¿Está seguro de eliminar esta tabla del participante?')) {
      return;
    }

    try {
      const userStr = localStorage.getItem('usuario');
      const user = JSON.parse(userStr);
      
      const response = await axios.delete(`/api/participante/${userId}/tabla/${tablaId}/${user.tipo_usuario}`, {
        data: { usuario_id: user.id }
      });

      if (response.data.success) {
        alert('Tabla eliminada correctamente');
        cargarDatos();
      } else {
        alert(response.data.message || 'Error al eliminar tabla');
      }
    } catch (err) {
      console.error('Error al eliminar tabla:', err);
      alert(err.response?.data?.message || 'Error al eliminar tabla');
    }
  };

  const filteredCartones = cartones.filter(c => 
    (c.serial || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return <div className="p-6 lg:p-10">Participante no encontrado</div>;  

  return (  
    <div className="p-6 lg:p-10">  
      <div className="mb-8">  
        <Link to="/admin/users" className="flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-500 mb-4">  
          <ArrowLeft className="w-4 h-4" /> Volver a Participantes  
        </Link>  
        <div className="flex items-center justify-between">  
          <div>  
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cartones de {user.nombre || ''} {user.apellido || ''}</h1>  
            <p className="text-gray-600 dark:text-gray-300">Cédula: {user.cedula || '-'}</p>  
          </div>  
          <Link to={`/admin/user/${userId}/add-carton`}>  
            <motion.button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">  
              <Plus className="w-4 h-4" /> Añadir Cartón  
            </motion.button>  
          </Link>  
        </div>  
      </div>  

      <div className="mb-6">  
        <div className="relative">  
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />  
          <input  
            type="text"  
            value={search}  
            onChange={(e) => setSearch(e.target.value)}  
            placeholder="Buscar por código de cartón"  
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"  
          />  
        </div>  
      </div>  

      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900">  
        <table className="w-full">  
          <thead className="bg-gray-50 dark:bg-gray-800">  
            <tr>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-500">Código del Cartón</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-500">Estado</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-yellow-500">Acciones</th>  
            </tr>  
          </thead>  
          <tbody>  
            {filteredCartones.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No hay cartones asignados a este participante
                </td>
              </tr>
            ) : (
              filteredCartones.map((carton) => {
                // Usar _id de la tabla
                const tablaId = carton._id;
                return (
                  <tr key={tablaId}>  
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{carton.serial || '-'}</td>  
                    <td className="px-6 py-4 text-sm">  
                      <span className={`inline-flex px-2 py-1 rounded-full text-s font-medium ${carton.won ? 'bg-green-100 text-green-500 dark:bg-green-800' : 'bg-red-100 text-red-500 dark:bg-red-800'}`}>  
                        {carton.won ? <Award className="w-5 h-5" /> : <X className="w-5 h-5" />}  
                        {carton.won ? 'Ganadora' : 'Sin Premio'}  
                      </span>  
                    </td>  
                    <td className="px-6 py-4">  
                      <div className="flex gap-4">  
                        <Link to={`/admin/cartones/${tablaId}`} className="flex items-center gap-1 text-blue-600 hover:underline">  
                          <Eye className="w-4 h-4" /> Ver  
                        </Link>  
                        <button 
                          onClick={() => handleDelete(tablaId)}
                          className="flex items-center gap-1 text-red-600 hover:underline"
                        >  
                          <Trash2 className="w-4 h-4" /> Borrar  
                        </button>  
                      </div>  
                    </td>  
                  </tr>
                );
              })
            )}  
          </tbody>  
        </table>  
      </div>  
    </div>  
  );  
};  

export default UserCartons;