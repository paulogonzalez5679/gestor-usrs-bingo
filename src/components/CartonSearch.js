import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { Search as SearchIcon, Eye, Award , X, Loader } from 'lucide-react';  
import { Link } from 'react-router-dom';
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'http://127.0.0.1:5000';
axios.defaults.baseURL = API_BASE_URL;

/**
 * Componente para buscar y visualizar cartones
 * Accesible para todos los tipos de usuario (tipo 0 y otros tipos)
 * Todos los usuarios tienen la misma funcionalidad completa
 */
const CartonSearch = () => {  
  const [search, setSearch] = useState('');  
  const [showModal, setShowModal] = useState(false);  
  const [selectedCarton, setSelectedCarton] = useState(null);
  const [tablas, setTablas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarTablas(search);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  const cargarTablas = async (searchTerm = '') => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await axios.get('/api/tablas', { params });
      if (response.data.success) {
        setTablas(response.data.tablas || []);
      }
    } catch (err) {
      console.error('Error al cargar tablas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCartones = tablas;  

  const openModal = (carton) => {  
    setSelectedCarton(carton);  
    setShowModal(true);  
  };  

  const closeModal = () => {  
    setShowModal(false);  
    setSelectedCarton(null);  
  };  

  return (  
    <div className="p-6 lg:p-10">  
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Buscador de Cartones</h1>  
      <p className="text-gray-600 dark:text-gray-300 mb-8">Busca y visualiza los cartones de bingo.</p>  

      <div className="relative mb-6">  
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />  
        <input  
          type="text"  
          value={search}  
          onChange={(e) => setSearch(e.target.value)}  
          placeholder="Buscar por ID del cartón o nombre del participante"  
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"  
        />  
      </div>  

      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900">  
        <table className="w-full">  
          <thead className="bg-gray-50 dark:bg-gray-800">  
            <tr>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">ID Cartón</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Participante Asignado</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha de Creación</th>  
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>  
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Acciones</th>  
            </tr>  
          </thead>  
            <tbody>  
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                </td>
              </tr>
            ) : filteredCartones.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron tablas
                </td>
              </tr>
            ) : (
              filteredCartones.map((carton) => {  
                const participante = carton.participante;
                const userName = participante ? `${participante.nombre || ''} ${participante.apellido || ''}`.trim() : 'Sin asignar';  
                return (  
                  <tr key={carton._id}>  
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{carton.serial || '-'}</td>  
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{userName}</td>  
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {carton.timestamp ? new Date(carton.timestamp * 1000).toLocaleDateString() : '-'}
                    </td>  
                    <td className="px-6 py-4 text-sm">  
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${carton.won ? 'bg-green-100 text-green-500 dark:bg-green-800' : 'bg-red-100 text-red-500 dark:bg-red-800'}`}>  
                        {carton.won ? <Award className="w-3 h-3" /> : <X className="w-3 h-3" />}  
                        {carton.won ? 'Ganadora' : 'Sin Premio'}  
                      </span>  
                    </td>  
                    <td className="px-6 py-4 text-right">  
                      <Link to={`/admin/cartones/${carton._id}`}>
                        <motion.button  
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"  
                          whileHover={{ scale: 1.05 }}  
                        >  
                          <Eye className="w-4 h-4" /> Ver  
                        </motion.button>
                      </Link>
                    </td>  
                  </tr>  
                );  
              })
            )}  
          </tbody>
        </table>  
      </div>  

      {/* Modal para Vista de Cartón */}  
      {showModal && selectedCarton && (  
        <motion.div  
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"  
          initial={{ opacity: 0 }}  
          animate={{ opacity: 1 }}  
          onClick={closeModal}  
        >  
          <motion.div  
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl relative"  
            initial={{ scale: 0.95, opacity: 0 }}  
            animate={{ scale: 1, opacity: 1 }}  
            onClick={e => e.stopPropagation()}  
          >  
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={closeModal}>  
              <X className="w-5 h-5" />  
            </button>  
            <div className="text-center mb-6">  
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cartón {selectedCarton.serial}</h3>  
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Asignado a: {selectedCarton.participante ? `${selectedCarton.participante.nombre || ''} ${selectedCarton.participante.apellido || ''}`.trim() : 'Sin asignar'}
              </p>  
            </div>  

            {/* Estado */}  
            <motion.div  
              className={`flex items-center justify-center p-4 rounded-lg mb-4 ${selectedCarton.won ? 'bg-yellow-300 text-yellow-900 dark:bg-yellow-400/80' : 'bg-gray-100 text-gray-800 dark:bg-gray-700'}`}  
              initial={{ scale: 0.9 }}  
              animate={{ scale: 1 }}  
            >  
              <span className="text-3xl mr-2">{selectedCarton.won ? <Award className="w-8 h-8" /> : <X className="w-8 h-8" />}</span>  
              <div>  
                <p className="text-xl font-bold">{selectedCarton.won ? '¡GANADORA!' : 'SIN PREMIO'}</p>  
                <p className="text-sm">{selectedCarton.won ? 'Esta tabla tiene un premio.' : 'Esta tabla no tiene premio.'}</p>  
              </div>  
            </motion.div>  

            {/* Matriz */}  
            {selectedCarton.matrix && selectedCarton.matrix.length > 0 && (
              <div className="grid grid-cols-5 gap-2 text-center mb-6">  
                {['B', 'I', 'N', 'G', 'O'].map(l => (  
                  <div key={l} className="text-lg font-bold text-yellow-500">{l}</div>  
                ))}  
                {selectedCarton.matrix.flat().map((num, index) => (  
                  <div key={index} className={`h-12 w-12 rounded-lg flex justify-center items-center font-bold text-lg border ${num === null || num === 'FREE' ? 'bg-blue-600 text-yellow-500' : 'bg-gray-100 text-yellow-500 dark:bg-gray-800 '}`}>  
                    {num === null || num === 'FREE' ? 'FREE' : num}  
                  </div>  
                ))}  
              </div>
            )}  

            <button  
              onClick={closeModal}  
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"  
            >  
              Cerrar  
            </button>  
          </motion.div>  
        </motion.div>  
      )}  
    </div>  
  );  
};  

export default CartonSearch;