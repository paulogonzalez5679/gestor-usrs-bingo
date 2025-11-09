import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://remote-aka-contracting-vocabulary.trycloudflare.com';
axios.defaults.baseURL = API_BASE_URL;

/**
 * Componente para agregar cartones a un participante
 * Accesible para todos los tipos de usuario (tipo 0 y otros tipos)
 * Todos los usuarios tienen la misma funcionalidad completa
 */
const AddCartonForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [cartones, setCartones] = useState(['', '']); // Inicial con 2  
  const [loading, setLoading] = useState(false);

  const addCartonInput = () => {
    setCartones([...cartones, '']);
  };

  const removeCartonInput = (index) => {
    if (cartones.length > 1) {
      const newCartones = cartones.filter((_, i) => i !== index);
      setCartones(newCartones);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validCartones = cartones.filter(c => c.trim() !== '');

    if (validCartones.length === 0) {
      alert('Debe ingresar al menos un código de tabla');
      return;
    }

    try {
      setLoading(true);
      const userStr = localStorage.getItem('usuario');
      if (!userStr) {
        alert('No hay usuario logueado');
        return;
      }

      const user = JSON.parse(userStr);

      // Validar que las tablas existan y estén disponibles
      const tablasValidadas = [];
      for (const tabla of validCartones) {
        try {
          const response = await axios.get(`/api/validarTabla/${tabla.trim()}`);
          if (response.data.success && response.data.tabla.disponible) {
            tablasValidadas.push(tabla.trim());
          } else {
            alert(`La tabla ${tabla} no está disponible o no existe`);
            return;
          }
        } catch (err) {
          alert(`Error al validar la tabla ${tabla}: ${err.response?.data?.message || 'Tabla no encontrada'}`);
          return;
        }
      }

      // Agregar tablas al participante
      const response = await axios.post(`/api/participante/${userId}/tablas/${user.tipo_usuario}`, {
        tablas: tablasValidadas,
        usuario_id: user.id,
        user_tipo_usuario: user.tipo_usuario
      });

      if (response.data.success) {
        alert('Tablas agregadas correctamente');
        navigate(`/admin/user/${userId}/cartones`);
      } else {
        alert(response.data.message || 'Error al agregar tablas');
      }
    } catch (err) {
      console.error('Error al agregar tablas:', err);
      alert(err.response?.data?.message || 'Error al agregar tablas');
    } finally {
      setLoading(false);
    }
  };
  const [total, setTotal] = useState(0);

  const calcularTotal = (cantidad) => {
    const pares = Math.floor(cantidad / 2);
    const sobrante = cantidad % 2;
    return pares * 5 + sobrante * 3;
  };

  // Recalcula total cuando cambian las tablas
  useEffect(() => {
    const validas = cartones.filter(c => c.trim() !== '');
    setTotal(calcularTotal(validas.length));
  }, [cartones]);

  return (
    <div className="p-6 lg:p-10">
      <motion.button
        onClick={() => navigate(`/admin/user/${userId}/cartones`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        whileHover={{ scale: 1.05 }}
      >
        <ArrowLeft className="w-5 h-5" /> Volver
      </motion.button>

      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Añadir Cartones de Bingo</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Agregue los códigos de los cartones de bingo. Puede agregar tantos como necesite.</p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
          <div className="space-y-4 mb-6" id="bingo-card-inputs">
            {cartones.map((carton, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={carton}
                  onChange={(e) => {
                    const newCartones = [...cartones];
                    newCartones[index] = e.target.value;
                    setCartones(newCartones);
                  }}
                  placeholder="Ingrese el código del cartón"
                  className="flex-1 py-2.5 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  type="button"
                  onClick={() => removeCartonInput(index)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  whileHover={{ scale: 1.05 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={addCartonInput}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-600 py-2.5 rounded-lg text-blue-600 font-bold hover:bg-blue-50"
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-4 h-4" /> Agregar Cartón
          </motion.button>
          <div className="mt-6 text-right">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Total a pagar: <span className="text-blue-600">${total}</span>
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <motion.button
              type="button"
              onClick={() => navigate(`/admin/user/${userId}/cartones`)}
              className="px-4 py-2.5 border rounded-lg font-bold hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-blue-700"
              whileHover={{ scale: 1.05 }}
            >

              <Save className="w-4 h-4" /> Guardar Cartones
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCartonForm;