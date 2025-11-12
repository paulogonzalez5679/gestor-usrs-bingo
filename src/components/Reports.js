import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Award, DollarSign, Trophy, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'http://127.0.0.1:5000';
axios.defaults.baseURL = API_BASE_URL;

const Reports = () => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [reportes, setReportes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.tipo_usuario === 0 || user.tipo_usuario === '0') {
        setHasAccess(true);
        cargarReportes();
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reportes');
      if (response.data.success) {
        setReportes(response.data.reportes);
      }
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-screen">
        <motion.div
          className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-red-200 dark:border-red-800 max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos para ver los reportes.
          </p>
          <motion.button
            onClick={() => navigate('/admin/users')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Volver al inicio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!reportes) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No se pudieron cargar los reportes.
        </div>
      </div>
    );
  }

  // ===================
  // 📊 Variables del backend
  // ===================
  const {
    total_tablas,
    tablas_ganadoras,
    total_participantes,
    participantes_con_ganadores,
    tasa_ganadores,
    ventas_por_usuario,
    ventas_por_grupo,
    conteo_por_nivel,
    conteo_por_curso,
    conteo_por_paralelo,
    conteo_por_especialidad,
    total_vendido,
    grupo_top,
    usuario_top,
  } = reportes;

  // === Datos para gráficos ===
  const chartUsuarios = {
    labels: Object.keys(ventas_por_usuario || {}),
    datasets: [
      {
        label: 'Ventas por Usuario ($)',
        data: Object.values(ventas_por_usuario || {}),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const chartGrupos = {
    labels: Object.keys(ventas_por_grupo || {}),
    datasets: [
      {
        label: 'Ventas por Grupo ($)',
        data: Object.values(ventas_por_grupo || {}),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
    ],
  };

  const chartCursos = {
    labels: Object.keys(conteo_por_curso || {}),
    datasets: [
      {
        label: 'Participantes por Curso',
        data: Object.values(conteo_por_curso || {}),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
      },
    ],
  };

  const chartParalelo = {
    labels: Object.keys(conteo_por_paralelo || {}),
    datasets: [
      {
        label: 'Participantes por paralelo',
        data: Object.values(conteo_por_paralelo || {}),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
      },
    ],
  };

  const chartEspecialidad = {
    labels: Object.keys(conteo_por_especialidad || {}),
    datasets: [
      {
        label: 'Participantes por paralelo',
        data: Object.values(conteo_por_especialidad || {}),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
      },
    ],
  };

  // ===========================
  // 🎨 Render
  // ===========================
  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Reportes y Ventas Generales
      </h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card icon={<BarChart3 />} title="Total Tablas" value={total_tablas} color="blue" />
        <Card icon={<Award />} title="Ganadoras" value={tablas_ganadoras} color="green" />
        <Card icon={<Users />} title="Total Participantes" value={total_participantes} color="purple" />
        <Card icon={<Award />} title="Con Ganadores" value={participantes_con_ganadores} color="yellow" />
      </div>

      {/* Tarjetas de dinero y top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card
          icon={<DollarSign />}
          title="Total Vendido"
          value={`$${Number(total_vendido).toLocaleString()}`}
          color="emerald"
        />
        <Card
          icon={<Trophy />}
          title="Grupo con Más Ventas"
          value={`${grupo_top?.nombre || 'N/A'} (${grupo_top?.total || 0} ventas)`}
          color="orange"
        />
        <Card
          icon={<Trophy />}
          title="Usuario con Más Ventas"
          value={`${usuario_top?.nombre || 'N/A'} (${usuario_top?.total || 0} ventas)`}
          color="pink"
        />
      </div>

      {/* Tasa de ganadores */}
      <motion.div
        className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Estadísticas Generales
        </h2>
        <p className="text-gray-600">Tasa de ganadores: {tasa_ganadores}%</p>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 font-bold text-gray-900 dark:text-white">
        <ChartCard title="Ventas por Usuario" data={chartUsuarios} />
        <ChartCard title="Ventas por Grupo" data={chartGrupos} />
       {/* <ChartCard title="Participantes por Curso" data={chartCursos} />
        <ChartCard title="Participantes por Paralelo" data={chartParalelo} />
        <ChartCard title="Participantes por Especialidad" data={chartEspecialidad} />*/}
      </div>
    </div>
  );
};

// --- Componentes auxiliares ---
const Card = ({ icon, title, value, color }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white break-words">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const ChartCard = ({ title, data }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 p-6 rounded-lg border shadow-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <h3 className="text-lg font-bold mb-4">{title}</h3>
    <Bar data={data} options={{ responsive: true, plugins: { legend: { display: true } } }} />
  </motion.div>
);

export default Reports;
