import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { ArrowLeft, Star, Loader } from 'lucide-react';  
import { useParams, Link } from 'react-router-dom';  
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'http://127.0.0.1:5000';
axios.defaults.baseURL = API_BASE_URL;

/**
 * Componente para ver un cartón de bingo individual
 * Accesible para todos los tipos de usuario (tipo 0 y otros tipos)
 * Todos los usuarios tienen la misma funcionalidad completa
 */
const BingoCardView = () => {  
  const { cartonId } = useParams();  
  const [tabla, setTabla] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTabla();
  }, [cartonId]);

  const cargarTabla = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tablas/${cartonId}`);
      if (response.data.success) {
        setTabla(response.data.tabla);
      } else {
        alert('Tabla no encontrada');
      }
    } catch (err) {
      console.error('Error al cargar tabla:', err);
      alert('Error al cargar la tabla');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!tabla) return <div className="min-h-screen flex items-center justify-center p-4">Cartón no encontrado</div>;  

  const matriz = tabla.matrix || [];  
  const esGanadora = tabla.won || false;
  const participante = tabla.participante;  

  const letters = ['B', 'I', 'N', 'G', 'O'];  

  return (  
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">  
      <div className="w-full max-w-sm text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">  
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Cartón {participante ? `de ${participante.nombre || ''} ${participante.apellido || ''}`.trim() : 'Sin asignar'}
        </h1>  
        <p className="text-gray-600 dark:text-gray-300 mb-8">Serial: {tabla.serial}</p>  

        <div className="space-y-3">  
          {/* Encabezado de letras */}  
          <div className="grid grid-cols-5 gap-1">  
            {letters.map(letter => (  
              <div key={letter} className="text-2xl font-bold text-blue-600 flex justify-center items-center">  
                {letter}  
              </div>  
            ))}  
          </div>  

          {/* Matriz */}  
          {matriz.length > 0 && (
            <div className="grid grid-cols-5 gap-3">  
              {matriz.flat().map((num, index) => {  
                const row = Math.floor(index / 5);  
                const col = index % 5;  
                return (  
                  <div key={`${row}-${col}`} className={`h-14 w-14 rounded-lg flex justify-center items-center font-bold text-lg border-2 border-gray-300 dark:border-gray-600 ${num === null || num === 'FREE' ? 'bg-blue-600 text-white rounded-full' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200'}`}>  
                    {num === null || num === 'FREE' ? <Star className="w-8 h-8" /> : num}  
                  </div>  
                );  
              })}  
            </div>
          )}  
        </div>  

        {/* Estado */}  
        <motion.div  
          className={`mt-8 p-4 rounded-lg ${esGanadora ? 'bg-yellow-300 text-yellow-900 dark:bg-yellow-400/80' : 'bg-gray-100 text-gray-800 dark:bg-gray-700'}`}  
          initial={{ scale: 0.9, opacity: 0 }}  
          animate={{ scale: 1, opacity: 1 }}  
        >  
          <h3 className="text-xl font-bold">{esGanadora ? '¡GANADORA!' : 'SIN PREMIO'}</h3>  
          <p className="text-sm">{esGanadora ? 'Esta tabla tiene un premio.' : 'Esta tabla no tiene premio.'}</p>  
        </motion.div>  

        <Link to="/admin/cartones" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg mt-8 hover:bg-blue-700">  
          <ArrowLeft className="w-4 h-4" /> Volver al buscador  
        </Link>  
      </div>  
    </div>  
  );  
};  

export default BingoCardView;