const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bingo_db')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Modelos
const Estudiante = require('./models/Estudiante');
const Participante = require('./models/Participante');

// Rutas
app.get('/api/estudiante/:cedula', async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({ cedula: req.params.cedula });
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    res.json(estudiante);
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/participantes', async (req, res) => {
  try {
    const nuevoParticipante = new Participante(req.body);
    await nuevoParticipante.save();
    res.status(201).json(nuevoParticipante);
  } catch (error) {
    console.error('Error al crear participante:', error);
    res.status(500).json({ message: 'Error al crear el participante' });
  }
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});