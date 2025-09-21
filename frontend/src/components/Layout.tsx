import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  showEmergencyButton?: boolean;
}

const Layout = ({ children, currentPage, showEmergencyButton = true }: LayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage={currentPage} />

        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-[70px]'
          }`}
        >
          {children}
        </div>
      </div>

      {/* Emergency Button */}
      {showEmergencyButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <motion.button 
            onClick={() => navigate('/crisis-helpline')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all duration-200"
          >
            <Phone className="w-7 h-7 group-hover:animate-pulse" />
          </motion.button>
          <div className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Crisis Support
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Layout;