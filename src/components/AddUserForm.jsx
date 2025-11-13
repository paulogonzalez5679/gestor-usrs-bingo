import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Save, Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configuración base de axios
import { API_BASE_URL } from '../config';
axios.defaults.baseURL = API_BASE_URL;

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    tipo: 'alumno',
    animador: '',
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    nivelCurso: '',
    paralelo: '',
    tablas: [''],
    grupoAdetitss: '',
  });

  const showAcademic = formData.tipo === 'alumno';
  const showDocente = formData.tipo === 'docente';
  const showExterno = formData.tipo === 'externo';

  const [isLoading, setIsLoading] = useState(false);
  const [tablasCount, setTablasCount] = useState(1);
  const [totalPagar, setTotalPagar] = useState(0);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('usuario');
  const user = JSON.parse(userStr);
  let nivelCurso = '';

useEffect(() => {
  // Recalcular total
  const total = calcularTotal(formData.tablas.filter(t => t.trim() !== '').length);
  setTotalPagar(total);

  // Limpiar si es docente y aún tiene valores académicos
  if (
    formData.tipo === 'docente' &&
    (formData.nivelCurso !== '' || formData.paralelo !== '' || formData.animador !== '')
  ) {
    setFormData(prev => ({
      ...prev,
      nivelCurso: '',
      paralelo: '',
      animador: ''
    }));
  }
}, [formData.tablas, formData.tipo]);


  const buscarDatosEstudiante = async (cedula) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/estudiante/${cedula}`);
      if (response.data && response.data.success && response.data.estudiante) {
        console.log('Datos del estudiante encontrados:', response.data);
        const estudiante = response.data.estudiante;

        // Construir el nivel del curso

        if (estudiante.Curso === 'BACHILLERATO') {
          if (estudiante.Nivel == 1) {
            nivelCurso = 'Primero de Bachillerato';
          } else if (estudiante.Nivel == 2) {
            nivelCurso = 'Segundo de Bachillerato';
          } else if (estudiante.Nivel == 3) {
            nivelCurso = 'Tercero de Bachillerato';
          }
        } else if (estudiante.Curso === 'Educación General Básica') {

          nivelCurso = `${estudiante.Nivel}° de Básica`;
          console.log(estudiante.nivelCurso);
        }

        // Construir el nombre completo

        const apellido = `${estudiante["Primer Apellido"] || ''} ${estudiante["Segundo Apellido"] || ''}`.trim();

        console.log('====================================');
        console.log(estudiante.Curso);
        console.log(estudiante.nivelCurso);
        console.log('====================================');

        setFormData(prev => ({
          ...prev,
          nombre: estudiante.Nombre,
          apellido: apellido,
          nivelCurso: nivelCurso,
          paralelo: estudiante.Paralelo || '',
          cedula: estudiante["Num documento"] || cedula
        }));
      }
    } catch (error) {
      console.error('Error al buscar estudiante:', error);
      if (error.response?.status === 404) {
        alert('No se encontró ningún estudiante con esta cédula');
      } else {
        alert('Error al conectar con el servidor. Por favor, intente nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };
    const buscarDatosDocente = async (cedula) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/docente/${cedula}`);
      if (response.data && response.data.success && response.data.docente) {
        console.log('Datos del docente encontrados:', response.data);
        const docente = response.data.docente;

        setFormData(prev => ({
          ...prev,
          nombre: docente.Nombre,
          apellido: docente.Apellidos,
          cedula: docente["Cedula"] || cedula
        }));
      }
    } catch (error) {
      console.error('Error al buscar docente:', error);
      if (error.response?.status === 404) {
        alert('No se encontró ningún docente con esta cédula');
      } else {
        alert('Error al conectar con el servidor. Por favor, intente nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, index = null) => {
    if (index !== null) {
      const newTablas = [...formData.tablas];
      newTablas[index] = e.target.value;
      setFormData(prev => ({ ...prev, tablas: newTablas }));
    } else {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      // Ya no buscamos automáticamente al escribir la cédula
    }
  };

  const addTabla = () => {
    setFormData(prev => ({ ...prev, tablas: [...prev.tablas, ''] }));
    setTablasCount(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Obtener usuario logueado

      if (!userStr) {
        alert('No hay usuario logueado');
        return;
      }
      const user = JSON.parse(userStr);
      // Filtrar tablas vacías
      const tablasValidas = formData.tablas.filter(t => t.trim() !== '');

      if (tablasValidas.length === 0) {
        alert('Debe ingresar al menos una tabla');
        return;
      }

      // Validar tablas antes de enviar
      const tablasValidadas = [];
      for (const tabla of tablasValidas) {
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

      // Preparar datos para enviar
      const datosEnvio = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        celular: formData.celular,
        tipo: formData.tipo,
        nivelCurso: formData.nivelCurso,
        paralelo: formData.paralelo,
        animador: user?.nombres,
        grupoAdetitss: formData.grupoAdetitss,
        tablas: tablasValidadas,
        registrado_por: user.id
      };

      const response = await axios.post('/api/CreateParticipantes', datosEnvio);
      if (response.data.success) {
        alert('Participante creado exitosamente');
        navigate('/admin/users');
      } else {
        alert(response.data.message || 'Error al crear el participante');
      }
    } catch (error) {
      console.error('Error al crear participante:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error al crear el participante. Por favor, intente nuevamente.');
      }
    }
  };

  const handleTipoChange = (e) => {
  const nuevoTipo = e.target.value;

  // Reinicia el formulario completamente
  setFormData({
    tipo: nuevoTipo,
    animador: '',
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    nivelCurso: '',
    paralelo: '',
    tablas: [''],
    grupoAdetitss: '',
  });

  // Reinicia también contadores y totales
  setTablasCount(1);
  setTotalPagar(0);
};


  const calcularTotal = (numTablas) => {
    return Math.floor(numTablas / 2) * 5 + (numTablas % 2) * 3;
  };


  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4">
      <motion.div className="w-full max-w-2xl space-y-8 bg-white dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <motion.button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-gray-500 hover:text-yellow-500"
          whileHover={{ scale: 1.05 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </motion.button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nuevo Participante</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Complete el formulario para registrar un nuevo jugador.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Usuario */}
          <fieldset>
            <legend className="text-lg font-semibold text-yellow-500  mb-4">Tipo de Participante</legend>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleTipoChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="alumno">Alumno</option>
              <option value="docente">Docente</option>
              <option value="externo">Externo</option>
            </select>
          </fieldset>
          {!showDocente && !showExterno && (
            <fieldset>
              <legend className="text-lg font-semibold text-yellow-500 mb-4">
                Nombre del Animador
              </legend>
              <input
                name="animador"
                value={user?.nombres || ''}
                readOnly
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              />
            </fieldset>
          )}
          {showDocente && (
          <fieldset>
            {/* 🆕 Campo de grupo Adetits */}
            <legend className="text-lg font-semibold text-yellow-500 mb-4">Número de grupo ADETITSS</legend>
            <input
              name="grupoAdetitss"
              value={formData.grupoAdetitss}
              onChange={handleInputChange}
              placeholder="(Ej. 5)"
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
              type="number"
            />
          </fieldset>
          )}


          {/* Datos Personales */}
          <fieldset>
            <legend className="text-lg font-semibold text-yellow-500  mb-4">Datos Personales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    placeholder="Cédula (Ej. 0123456789)"
                    className="p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  {isLoading  && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-500">Cargando...</span>
                    </div>
                  )}
                </div>
                {showAcademic && (<motion.button
                  type="button"
                  onClick={() => formData.cedula.length >= 10 && buscarDatosEstudiante(formData.cedula)}
                  className={`px-4 py-3 rounded-lg flex items-center justify-center ${formData.cedula.length >= 10
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  whileHover={formData.cedula.length >= 10 ? { scale: 1.05 } : {}}
                  disabled={formData.cedula.length < 10}
                >
                  <Search className="w-5 h-5" />
                </motion.button>)}

                {showDocente && (<motion.button
                  type="button"
                  onClick={() => formData.cedula.length >= 10 && buscarDatosDocente(formData.cedula)}
                  className={`px-4 py-3 rounded-lg flex items-center justify-center ${formData.cedula.length >= 10
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}
                  whileHover={formData.cedula.length >= 10 ? { scale: 1.05 } : {}}
                  disabled={formData.cedula.length < 10}
                >
                  <Search className="w-5 h-5" />
                </motion.button>)}
              </div>
              
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre (Ej. Sofía)"
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              <input
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Apellido (Ej. Rodríguez)"
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
              />

              <input
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="Número de Celular (Ej. 0987654321)"
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                type="tel"
              />
            </div>
          </fieldset>

          {showAcademic && (
            <fieldset>
              <legend className="text-lg font-semibold text-yellow-500  mb-4">Información Académica</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="nivelCurso"
                  value={formData.nivelCurso}
                  onChange={handleInputChange}
                  placeholder="Nivel del Curso (Ej. Primero de Básica)"
                  readOnly
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  name="paralelo"
                  readOnly
                  value={formData.paralelo}
                  onChange={handleInputChange}
                  placeholder="Paralelo (Ej. A)"
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </fieldset>
          )}

          {/* Tablas de Bingo */}
          <fieldset>
            <legend className="text-lg font-semibold text-yellow-500  mb-4">Tablas de Bingo</legend>
            <div className="space-y-4">
              {formData.tablas.map((tabla, index) => (
                <div key={index} className="flex items-end gap-4">
                  <input
                    name={`tabla_${index}`}
                    value={tabla}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Ingrese el código de la tabla"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              ))}
            </div>
            <motion.button
              type="button"
              onClick={addTabla}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
              whileHover={{ scale: 1.05 }}
            >
              <PlusCircle className="w-5 h-5" />
              Agregar Otra Tabla
            </motion.button>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-yellow-500 mb-4">Resumen de Pago</legend>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Total a pagar: <span className="font-bold text-green-600">${totalPagar}</span>
            </p>
          </fieldset>

          <motion.button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
            whileHover={{ scale: 1.02 }}
          >
            <Save className="w-5 h-5" />
            Crear Participante
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddUserForm;