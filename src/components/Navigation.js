import React from 'react';  
import { motion } from 'framer-motion';  
import { Home, Gamepad2, User, LogOut, Menu } from 'lucide-react';  

const Navigation = ({ user, onLogout, currentPage, setCurrentPage }) => {  
  const navItems = [  
    { id: 'dashboard', icon: Home, label: 'Dashboard', page: 'dashboard' },  
    { id: 'game', icon: Gamepad2, label: 'Jugar', page: 'game' },  
    { id: 'profile', icon: User, label: 'Perfil', page: 'profile' }  
  ];  

  return (  
    <motion.nav  
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-4 shadow-xl fixed bottom-6 left-1/2 transform -translate-x-1/2 md:absolute md:top-6 md:right-6 md:bottom-auto w-80 md:w-auto z-50"  
      initial={{ y: 20, opacity: 0 }}  
      animate={{ y: 0, opacity: 1 }}  
      transition={{ duration: 0.5, delay: 0.2 }}  
    >  
      <div className="flex justify-around md:justify-end items-center space-x-0 md:space-x-2">  
        {navItems.map((item) => (  
          <motion.button  
            key={item.id}  
            onClick={() => setCurrentPage(item.page)}  
            className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-2 text-sm font-medium ${
              currentPage === item.page  
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'  
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'  
            }`}  
            whileHover={{ scale: 1.05 }}  
            whileTap={{ scale: 0.95 }}  
          >  
            <item.icon className={`w-6 h-6 ${currentPage === item.page ? 'fill-current' : ''}`} />  
            <span className="hidden md:block">{item.label}</span>  
          </motion.button>  
        ))}  

        <motion.button  
          onClick={onLogout}  
          className="p-3 rounded-2xl transition-all text-red-600 hover:text-red-700 hover:bg-red-50 md:ml-2"  
          whileHover={{ scale: 1.05 }}  
          whileTap={{ scale: 0.95 }}  
        >  
          <LogOut className="w-6 h-6" />  
        </motion.button>  
      </div>  

      <div className="text-center mt-4 md:hidden">  
        <p className="text-xs text-gray-500">Usuario: {user.email}</p>  
      </div>  
    </motion.nav>  
  );  
};  

export default Navigation;