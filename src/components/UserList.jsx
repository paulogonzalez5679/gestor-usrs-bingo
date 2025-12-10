import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { Search, Plus, Edit, Trash2, Loader } from 'lucide-react';  
import { Link, useNavigate } from 'react-router-dom';  
import { API_BASE_URL } from '../config';
import axios from 'axios';

axios.defaults.baseURL = API_BASE_URL;

const UserList = () => {  
  const [search, setSearch] = useState('');  
  const [participantes, setParticipantes] = useState([]);
  const [usuarioDoc, setUsuarioDoc] = useState(null);
  const [reserveCount, setReserveCount] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('usuario');
  const user = userStr ? JSON.parse(userStr) : null;

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
      // Usaremos el endpoint que retorna usuario y sus participantes
      const resp = await axios.get(`/api/participantes/por-usuario/${user.id}`);
      if (resp.data.success) {
        setParticipantes(resp.data.participantes || []);
        setUsuarioDoc(resp.data.usuario || {});
      } else {
        setError(resp.data.message || 'Error al cargar participantes');
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

  // -------------------------------------------------------------------
  // NUEVA LÓGICA PARA CREAR PARTICIPANTES CON CONTROL DE TABLAS
  // -------------------------------------------------------------------
  const handleAddClick = async () => {
    try {
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        alert("No hay usuario logueado");
        return;
      }

      const user = JSON.parse(userStr);

      // Obtener datos del usuario desde backend
      const resp = await axios.get(`/api/participantes/por-usuario/${user.id}`);

      if (!resp.data.success) {
        alert(resp.data.message || 'Error al obtener datos del usuario');
        return;
      }

      const usuarioDoc = resp.data.usuario || {};
      setUsuarioDoc(usuarioDoc);

      const totalTables = usuarioDoc.totalTables || 0;
      const usedTables = usuarioDoc.usedTables || 0;
      const remaining = totalTables - usedTables;

      // Si no tiene tablas disponibles → bloquear
      if (totalTables > 0 && remaining <= 0) {
        alert("Ya no tienes tablas disponibles para asignar.");
        return;
      }

      // Si no tiene tablas reservadas y es admin, permitir reservar directamente desde "Añadir"
      if (totalTables === 0) {
          if (user.tipo_usuario === 0 || user.tipo_usuario === '0') {
          // Si ya escribió una cantidad en el campo, la usamos; de lo contrario pedimos cantidad mediante prompt
          if (reserveCount && String(reserveCount).replace(/[^0-9]/g, '') !== '') {
            // Sanitize again and use
            const sanitizedCount = parseInt(String(reserveCount).replace(/[^0-9]/g, ''), 10);
            console.log('[handleAddClick] Using reserveCount sanitized:', sanitizedCount);
            setReserveError(null);
            const ok = await handleReserve(sanitizedCount);
            if (!ok) return;
          } else {
            const input = prompt("Ingrese la cantidad total de tablas a reservar (ej: 161) — Pulse Aceptar para usar 1 por defecto:");
            if (input === null) {
              // usuario canceló el prompt → asumimos 1
              const ok = await handleReserve(1);
              if (!ok) return;
            } else {
              const digits = String(input || '').replace(/[^0-9]/g, '');
              if (!digits) {
                // invalid input: show inline error and return
                setReserveError('Ingrese una cantidad válida');
                return;
              }
              const cantidad = parseInt(digits, 10);
              if (!cantidad || cantidad <= 0) {
                setReserveError('Ingrese una cantidad válida');
                return;
              }
              const ok = await handleReserve(cantidad);
              if (!ok) return;
            }
          }
          // recargar usuarioDoc y proceed con la navegación si la reserva fue exitosa
          const newUserResp = await axios.get(`/api/participantes/por-usuario/${user.id}`);
          if (newUserResp.data.success) {
            const newUserDoc = newUserResp.data.usuario || {};
            setUsuarioDoc(newUserDoc);
            // recalcular total y used
            const totalTablesNew = newUserDoc.totalTables || 0;
            const usedTablesNew = newUserDoc.usedTables || 0;
            const remainingNew = totalTablesNew - usedTablesNew;
            if (totalTablesNew > 0 && remainingNew > 0) {
              // todo bien, continúa a crear participante
            } else {
              alert('No se pudieron reservar las tablas o no hay tablas disponibles.');
              return;
            }
          }
        } else {
          alert('No tienes tablas reservadas. Pide a un administrador que reserve tablas.');
          return;
        }
      }

      // Todo bien → ir a crear participante
      navigate('/admin/add-user', {
        state: {
          fromSerial: usuarioDoc.fromSerial,
          toSerial: usuarioDoc.toSerial
        }
      });

    } catch (err) {
      console.error("Error en handleAddClick:", err);
      alert(err.response?.data?.message || "Error inesperado al crear participante");
    }
  };

  // handleReserve ahora acepta opcionalmente una cantidad para evitar prompts adicionales
  const handleReserve = async (cantidadParam = null) => {
    try {
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        alert('No hay usuario logueado');
        return;
      }
      const user = JSON.parse(userStr);

      // Sanitizar y parsear la entrada para evitar separadores (1.560, 1,560) u otros caracteres
      const rawCantidad = cantidadParam != null ? String(cantidadParam) : String(reserveCount || '');
      const digitsOnly = rawCantidad.replace(/[^0-9]/g, '');

      console.log('[handleReserve] rawCantidad:', rawCantidad, 'digitsOnly:', digitsOnly);

      if (!digitsOnly) {
        console.log(digitsOnly);
        
        // show inline error (safer) and log
        setReserveError('Ingrese una cantidad válida');
        console.warn('[handleReserve] invalid quantity:', rawCantidad);
        return false;
      }
      const cantidad = parseInt(digitsOnly, 10);
      if (!cantidad || cantidad <= 0) {
        setReserveError('Ingrese una cantidad válida');
        return false;
      }

      setIsReserving(true);
      const resp = await axios.post(`/api/users/${user.id}/assign_tables`, {
        totalTables: cantidad,
        requesting_user_id: user.id
      });

      if (!resp.data.success) {
        setReserveError(resp.data.message || 'Error al reservar tablas');
        return false;
      } else {
        setReserveError(null);
        alert(`Tablas reservadas desde ${resp.data.from} hasta ${resp.data.to}`);
        setReserveCount('');
        cargarParticipantes();
        return true;
      }
    } catch (err) {
      console.error('Error en handleReserve:', err);
      const msg = err.response?.data?.message || 'Error al reservar tablas';
      setReserveError(msg);
      return false;
    } finally {
      setIsReserving(false);
    }
  }
  // -------------------------------------------------------------------


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

        <div className='flex items-center gap-4'>
          {/* Si es admin y totalTables === 0 mostrar campo para reservar tablas */}
          {user && (user.tipo_usuario === 0 || user.tipo_usuario === '0') && (
            <div className='flex items-center gap-2'>
              <input
                type='text'
                inputMode='numeric'
                value={reserveCount}
                onChange={(e) => {
                  // For UX: only keep digits as the user types (no separators)
                  const sanitized = String(e.target.value || '').replace(/[^0-9]/g, '');
                  setReserveCount(sanitized);
                  setReserveError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setReserveError(null);
                    handleReserve();
                  }
                }}
                placeholder='Cantidad tablas'
                className='w-36 p-2 border rounded-lg'
              />
              {reserveError && (
                <div className='text-xs text-red-500 mt-1'>{reserveError}</div>
              )}
              <button
                onClick={() => {
                  setReserveError(null);
                  handleReserve();
                }}
                className='px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                disabled={isReserving || (usuarioDoc && usuarioDoc.totalTables > 0)}
              >
                {isReserving ? 'Reservando...' : 'Reservar tablas'}
              </button>
            </div>
          )}

          {/* Mostrar información de tablas reservadas si ya existen */}
          {usuarioDoc && usuarioDoc.totalTables > 0 && (
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              Reservadas: <strong>{usuarioDoc.totalTables}</strong> | Usadas: <strong>{usuarioDoc.usedTables || 0}</strong>
              {usuarioDoc.fromSerial && usuarioDoc.toSerial && (
                <span> | Rango: {usuarioDoc.fromSerial} → {usuarioDoc.toSerial}</span>
              )}
            </div>
          )}

          

          <motion.button  
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"  
            whileHover={{ scale: 1.05 }}  
            onClick={handleAddClick}
            disabled={usuarioDoc && usuarioDoc.totalTables === 0 && (!user || (user.tipo_usuario !== 0 && user.tipo_usuario !== '0'))}
          >  
            <Plus className="w-4 h-4" />  
            Añadir Participante  
          </motion.button>  
        </div>
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
              
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nivel</th> 
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Paralelo</th> 
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
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.nivelCurso || '-'}</td> 
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.paralelo || '-'}</td> 
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
