import React, { useState } from 'react';  
import { motion } from 'framer-motion';  
import { CheckCircle, X, Crown } from 'lucide-react';  
import { generateBingoCard, checkBingo } from '../utils/bingoHelpers';  

const BingoCard = ({ cardId, onMarkNumber, onUnmarkNumber, markedNumbers = new Set() }) => {  
  const [numbers, setNumbers] = useState(() => {  
    const saved = localStorage.getItem(`bingoCard_${cardId}`);  
    return saved ? JSON.parse(saved) : generateBingoCard();  
  });  

  const handleNumberClick = (num) => {  
    if (num === 'FREE') return;  
    if (markedNumbers.has(num)) {  
      onUnmarkNumber(num);  
    } else {  
      onMarkNumber(num);  
    }  
  };  

  const bingoWin = checkBingo(numbers, markedNumbers);  

  React.useEffect(() => {  
    localStorage.setItem(`bingoCard_${cardId}`, JSON.stringify(numbers));  
  }, [numbers, cardId]);  

  const letters = ['B', 'I', 'N', 'G', 'O'];  

  return (  
    <motion.div  
      className="bg-white border-4 border-blue-200 rounded-2xl p-4 shadow-2xl max-w-xs mx-auto"  
      initial={{ scale: 0.9, opacity: 0 }}  
      animate={{ scale: 1, opacity: 1 }}  
      transition={{ duration: 0.5 }}  
      style={{  
        background: bingoWin ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'white'  
      }}  
    >  
      {bingoWin && (  
        <motion.div  
          className="absolute inset-0 bg-yellow-400/80 rounded-2xl flex items-center justify-center z-10"  
          initial={{ scale: 0 }}  
          animate={{ scale: 1 }}  
          transition={{ duration: 0.3 }}  
        >  
          <motion.div  
            className="text-center"  
            initial={{ scale: 0.5, opacity: 0 }}  
            animate={{ scale: 1, opacity: 1 }}  
            transition={{ delay: 0.2 }}  
          >  
            <Crown className="w-16 h-16 text-yellow-900 mx-auto mb-2 animate-bounce" />  
            <h3 className="text-2xl font-bold text-yellow-900">¡BINGO!</h3>  
            <p className="text-yellow-800">¡Ganaste con {bingoWin}!</p>  
          </motion.div>  
        </motion.div>  
      )}  

      <div className="grid grid-cols-5 gap-1 bg-gray-100 rounded-xl p-2">  
        {letters.map((letter, colIndex) => (  
          <div key={letter} className="flex justify-center items-center py-1">  
            <span className="font-bold text-lg text-blue-600 uppercase">{letter}</span>  
          </div>  
        ))}  
      </div>  

      <div className="grid grid-cols-5 gap-2 mt-2">  
        {numbers.flat().map((num, index) => {  
          const row = Math.floor(index / 5);  
          const col = index % 5;  
          const isFree = num === 'FREE';  
          const isMarked = !isFree && markedNumbers.has(num);  
          const cellKey = `${col}-${row}`;  

          return (  
            <motion.button  
              key={`${cardId}-${num}-${index}`}  
              onClick={() => handleNumberClick(num)}  
              className={`w-16 h-16 rounded-lg font-bold text-lg flex items-center justify-center border-2 transition-all duration-200 ${
                isFree 
                  ? 'bg-yellow-300 border-yellow-400 text-yellow-800' 
                  : isMarked 
                    ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                    : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}  
              whileHover={!isFree && !isMarked ? { scale: 1.05 } : {}}  
              whileTap={{ scale: 0.95 }}  
              disabled={isFree}  
            >  
              {isFree ? 'FREE' : num}  
            </motion.button>  
          );  
        })}  
      </div>  

      <div className="flex justify-center mt-4 space-x-2">  
        <span className="text-sm text-gray-600">Marcados: {markedNumbers.size}</span>  
        {bingoWin && <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />}  
      </div>  
    </motion.div>  
  );  
};  

export default BingoCard;