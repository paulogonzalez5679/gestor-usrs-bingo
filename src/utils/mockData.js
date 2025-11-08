export const mockUsers = [  
  {  
    id: '1',  
    nombre: 'Ana',  
    apellido: 'Rodríguez',  
    cedula: '123456789',  
    celular: '0987654321',  
    tipo: 'alumno',  
    nivelCurso: 'Primero de Básica',  
    paralelo: 'A',  
    animador: null,  
    cartones: ['B-1A34C', 'G-5D78E', 'N-9F21H']  
  },  
  {  
    id: '2',  
    nombre: 'Carlos',  
    apellido: 'Pérez',  
    cedula: '987654321',  
    celular: '0998765432',  
    tipo: 'docente',  
    nivelCurso: null,  
    paralelo: null,  
    animador: 'Carlos "El Showman" Ramírez',  
    cartones: ['I-2B45D', 'O-7E89F']  
  },  
  {  
    id: '3',  
    nombre: 'Sofía',  
    apellido: 'García',  
    cedula: '456789123',  
    celular: '0976543210',  
    tipo: 'alumno',  
    nivelCurso: 'Tercero de Bachillerato',  
    paralelo: 'B',  
    animador: null,  
    cartones: ['B-3C56G', 'I-8D90H', 'N-4E12I', 'G-9F34J', 'O-5G56K']  
  },  
  {  
    id: '4',  
    nombre: 'Luis',  
    apellido: 'Martínez',  
    cedula: '789123456',  
    celular: '0965432109',  
    tipo: 'alumno',  
    nivelCurso: 'Segundo de Bachillerato',  
    paralelo: 'C',  
    animador: null,  
    cartones: ['G-6H78L']  
  },  
  {  
    id: '5',  
    nombre: 'Elena',  
    apellido: 'Sánchez',  
    cedula: '321654987',  
    celular: '0954321098',  
    tipo: 'docente',  
    nivelCurso: null,  
    paralelo: null,  
    animador: 'Valentina "La Voz" Torres',  
    cartones: ['N-0I23M', 'O-1J45N', 'B-2K67P', 'I-3L89Q']  
  }  
];  

export const mockCartones = [  
  {  
    id: 'B-1A34C',  
    usuarioId: '1',  
    codigo: 'B-1A34C',  
    fechaRegistro: '2023-10-26',  
    estado: 'ganadora',  
    matriz: [  
      [8, 22, 34, 51, 72],  
      [14, 18, 45, 59, 63],  
      [3, 28, 'FREE', 48, 75],  
      [11, 20, 31, 60, 68],  
      [5, 25, 42, 55, 70]  
    ]  
  },  
  {  
    id: 'G-5D78E',  
    usuarioId: '1',  
    codigo: 'G-5D78E',  
    fechaRegistro: '2023-10-25',  
    estado: 'sin-premio',  
    matriz: [  
      [1, 16, 30, 46, 61],  
      [7, 21, 35, 50, 65],  
      [12, 26, 'FREE', 52, 67],  
      [9, 24, 38, 54, 69],  
      [4, 19, 33, 47, 62]  
    ]  
  },  
  {  
    id: 'N-9F21H',  
    usuarioId: '1',  
    codigo: 'N-9F21H',  
    fechaRegistro: '2023-10-24',  
    estado: 'sin-premio',  
    matriz: [  
      [2, 17, 29, 44, 60],  
      [13, 23, 36, 49, 64],  
      [6, 27, 'FREE', 53, 66],  
      [10, 25, 39, 56, 71],  
      [15, 20, 32, 58, 73]  
    ]  
  },  
  // Más cartones para otros usuarios... (agregar similar para completar)  
  {  
    id: 'I-2B45D',  
    usuarioId: '2',  
    codigo: 'I-2B45D',  
    fechaRegistro: '2023-10-27',  
    estado: 'ganadora',  
    matriz: [  
      [5, 19, 31, 47, 62],  
      [11, 24, 37, 52, 68],  
      [14, 28, 'FREE', 55, 70],  
      [8, 22, 34, 59, 64],  
      [3, 16, 40, 57, 74]  
    ]  
  },  
  // ... Continuar con al menos 10-15 más para simular  
  {  
    id: 'O-7E89F',  
    usuarioId: '2',  
    codigo: 'O-7E89F',  
    fechaRegistro: '2023-10-26',  
    estado: 'sin-premio',  
    matriz: [  
      [9, 21, 33, 48, 65],  
      [12, 26, 39, 54, 69],  
      [7, 20, 'FREE', 50, 72],  
      [4, 18, 35, 56, 61],  
      [13, 29, 41, 53, 75]  
    ]  
  }  
  // Añadir más según sea necesario para los ejemplos  
];  

export const generateBingoMatrix = () => {  
  const letters = ['B', 'I', 'N', 'G', 'O'];  
  const ranges = [[1,15], [16,30], [31,45], [46,60], [61,75]];  
  const matrix = [];  
  for (let col = 0; col < 5; col++) {  
    const column = [];  
    for (let row = 0; row < 5; row++) {  
      if (col === 2 && row === 2) {  
        column.push('FREE');  
      } else {  
        let num;  
        do {  
          num = Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];  
        } while (column.includes(num));  
        column.push(num);  
      }  
    }  
    column.sort((a, b) => a - b);  
    matrix.push(column);  
  }  
  return matrix;  
};