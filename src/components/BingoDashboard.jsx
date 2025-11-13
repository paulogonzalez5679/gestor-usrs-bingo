import React, { useState } from 'react';  
import { motion } from 'framer-motion';  
import { LayoutDashboard, Plus, Trash2, Edit } from 'lucide-react';  

const BingoDashboard = ({ user, cards, onAddCard, onDeleteCard, onEditCard }) => {  
  const [showAddForm, setShowAddForm] = useState(false);  

  return (  
    <motion.div  
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"  
      initial={{ opacity: 0, y: 20 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.6 }}  
    >  
      <div className="flex items-center justify-between mb-8">  
        <div className="flex items-center gap-4">  
          <motion.div  
            className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl"  
            whileHover={{ scale: 1.05 }}  
          >  
            <LayoutDashboard className="w-6 h-6 text-white" />  
          </motion.div>  
          <div>  
            <h1 className="text-3xl font-bold text-gray-900">¡Hola, {user.name || user.email}! 🎉</h1>  
            <p className="text-gray-600">Tus cartones de bingo están listos para la acción</p>  
          </div>  
        </div>  
        <motion.button  
          onClick={() => setShowAddForm(!showAddForm)}  
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"  
          whileHover={{ scale: 1.02 }}  
        >  
          <Plus className="w-5 h-5" />  
          Nuevo Cartón  
        </motion.button>  
      </div>  

      {showAddForm && (  
        <motion.div  
          className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6"  
          initial={{ height: 0, opacity: 0 }}  
          animate={{ height: 'auto', opacity: 1 }}  
          transition={{ duration: 0.3 }}  
        >  
          <p className="text-green-800 font-medium mb-4">¡Listo! Ya generé un cartón nuevo para ti automáticamente. Solo haz clic en guardar para agregarlo a tu colección.</p>  
          <motion.button  
            onClick={() => {  
              onAddCard();  
              setShowAddForm(false);  
            }}  
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"  
            whileHover={{ scale: 1.05 }}  
          >  
            Guardar Cartón  
          </motion.button>  
        </motion.div>  
      )}  

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
        {cards.map((card, index) => (  
          <motion.div  
            key={card.id}  
            className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"  
            initial={{ opacity: 0, y: 20 }}  
            animate={{ opacity: 1, y: 0 }}  
            transition={{ delay: index * 0.1 }}  
          >  
            <div className="flex items-start justify-between mb-4">  
              <h3 className="font-bold text-lg text-gray-900">Cartón #{card.id.slice(-4)}</h3>  
              <div className="flex gap-2">  
                <motion.button  
                  onClick={() => onEditCard(card.id)}  
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"  
                  whileHover={{ scale: 1.1 }}  
                  whileTap={{ scale: 0.9 }}  
                >  
                  <Edit className="w-4 h-4" />  
                </motion.button>  
                <motion.button  
                  onClick={() => onDeleteCard(card.id)}  
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"  
                  whileHover={{ scale: 1.1 }}  
                  whileTap={{ scale: 0.9 }}  
                >  
                  <Trash2 className="w-4 h-4" />  
                </motion.button>  
              </div>  
            </div>  
            <p className="text-gray-600 mb-4">Generado el {new Date(card.createdAt).toLocaleDateString()}</p>  
            <div className="text-center">  
              <span className="text-sm text-gray-500">¡Listo para jugar!</span>  
            </div>  
          </motion.div>  
        ))}  
      </div>  

      {cards.length === 0 && (  
        <motion.div  
          className="text-center py-12"  
          initial={{ opacity: 0 }}  
          animate={{ opacity: 1 }}  
          transition={{ delay: 0.2 }}  
        >  
          <p className="text-2xl font-semibold text-gray-500 mb-4">Aún no tienes cartones</p>  
          <p className="text-gray-600">¡Haz clic en "Nuevo Cartón" para empezar la diversión!</p>  
        </motion.div>  
      )}  
    </motion.div>  
  );  
};  

export default BingoDashboard;