import React, { useState } from 'react';  
import { motion } from 'framer-motion';  
import { Play, RotateCcw, Volume2 } from 'lucide-react';  
import BingoCard from './BingoCard';  

const BingoGame = ({ user, cards }) => {  
  const [markedNumbers, setMarkedNumbers] = useState(new Set());  
  const [currentNumber, setCurrentNumber] = useState(null);  
  const [gameActive, setGameActive] = useState(false);  

  const generateRandomNumber = () => {  
    const allNumbers = [];  
    for (let i = 1; i <= 75; i++) {  
      allNumbers.push(i);  
    }  
    const shuffled = allNumbers.sort(() => Math.random() - 0.5);  
    return shuffled[0];  
  };  

  const startNewGame = () => {  
    setMarkedNumbers(new Set());  
    setCurrentNumber(null);  
    setGameActive(true);  
  };  

  const nextNumber = () => {  
    const num = generateRandomNumber();  
    setCurrentNumber(num);  
  };  

  const handleMark = (num) => {  
    const newMarked = new Set(markedNumbers);  
    newMarked.add(num);  
    setMarkedNumbers(newMarked);  
  };  

  const handleUnmark = (num) => {  
    const newMarked = new Set(markedNumbers);  
    newMarked.delete(num);  
    setMarkedNumbers(newMarked);  
  };  

  return (  
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-orange-50 py-8">  
      <div className="container mx-auto px-4 max-w-6xl">  
        <motion.div  
          className="text-center mb-12"  
          initial={{ opacity: 0, y: -20 }}  
          animate={{ opacity: 1, y: 0 }}  
        >  
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">  
            ¡Bingo Time! 🎰  
          </h1>  
          <p className="text-xl text-gray-700">¡Juega con {user.name || user.email} y gana grande!</p>  
        </motion.div>  

        {/* Current Number Display */}  
        <motion.div  
          className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 mb-8 shadow-xl text-center max-w-2xl mx-auto"  
          initial={{ scale: 0.9 }}  
          animate={{ scale: 1 }}  
        >  
          {currentNumber && (  
            <motion.div  
              className="text-8xl font-bold text-blue-600 animate-bounce"  
              key={currentNumber}  
              initial={{ scale: 0.5 }}  
              animate={{ scale: 1 }}  
              transition={{ type: "spring", stiffness: 500 }}  
            >  
              {currentNumber}  
            </motion.div>  
          )}  
          {!gameActive && !currentNumber && (  
            <motion.div  
              className="text-4xl font-semibold text-gray-500"  
              initial={{ opacity: 0 }}  
              animate={{ opacity: 1 }}  
            >  
              Presiona "Iniciar Juego" para comenzar  
            </motion.div>  
          )}  
        </motion.div>  

        {/* Controls */}  
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">  
          {!gameActive && (  
            <motion.button  
              onClick={startNewGame}  
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 hover:shadow-xl transition-all"  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.95 }}  
            >  
              <Play className="w-6 h-6" />  
              Iniciar Juego  
            </motion.button>  
          )}  

          {gameActive && (  
            <>  
              <motion.button  
                onClick={nextNumber}  
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 hover:shadow-xl transition-all"  
                whileHover={{ scale: 1.05 }}  
              >  
                Siguiente Número  
              </motion.button>  
              <motion.button  
                onClick={() => {  
                  setGameActive(false);  
                  setCurrentNumber(null);  
                  setMarkedNumbers(new Set());  
                }}  
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 hover:shadow-xl transition-all"  
                whileHover={{ scale: 1.05 }}  
              >  
                <RotateCcw className="w-6 h-6" />  
                Nuevo Juego  
              </motion.button>  
            </>  
          )}  

          <motion.button  
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"  
            whileHover={{ scale: 1.1 }}  
            whileTap={{ scale: 0.9 }}  
          >  
            <Volume2 className="w-6 h-6 text-gray-600" />  
          </motion.button>  
        </div>  

        {/* Cards Grid */}  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">  
          {cards.map((card) => (  
            <BingoCard  
              key={card.id}  
              cardId={card.id}  
              onMarkNumber={handleMark}  
              onUnmarkNumber={handleUnmark}  
              markedNumbers={markedNumbers}  
            />  
          ))}  
        </div>  

        {cards.length === 0 && (  
          <motion.div  
            className="text-center py-12"  
            initial={{ opacity: 0 }}  
            animate={{ opacity: 1 }}  
          >  
            <p className="text-2xl text-gray-500 mb-4">No tienes cartones aún</p>  
            <p className="text-gray-600">Ve al dashboard para crear algunos y vuelve aquí a jugar</p>  
          </motion.div>  
        )}  
      </div>  
    </div>  
  );  
};  

export default BingoGame;