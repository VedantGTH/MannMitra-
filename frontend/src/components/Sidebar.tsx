import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Heart,
  MessageSquare,
  FileText,
  BookOpen,
  Phone,
  Music,
  User,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentPage?: string;
}

const Sidebar = ({ isOpen, setIsOpen, currentPage = "Dashboard" }: SidebarProps) => {
  const [selected, setSelected] = useState(currentPage);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Main menu items (top section)
  const mainMenuItems = [
    { icon: Home, label: "Dashboard", route: "/dashboard" },
    { icon: MessageSquare, label: "AI Chatbot", route: "/ai-chatbot" },
    { icon: FileText, label: "Report Upload", route: "/report-upload" },
    { icon: BookOpen, label: "Secret Diary", route: "/secret-diary" },
    { icon: Music, label: "Mood to Music", route: "/mood-to-music" },
  ];

  // Bottom section items
  const bottomMenuItems = [
    { icon: Phone, label: "Crisis Support", route: "/crisis-helpline", isEmergency: true },
    { icon: User, label: "Account Details", route: "/dashboard" },
  ];

  const handleNavigation = (route: string, label: string) => {
    setSelected(label);
    window.location.href = route;
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 250 : 70 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:block fixed left-0 top-0 h-screen bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-50"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 mt-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="MannMitra Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="font-bold text-lg text-gray-800"
                >
                  MannMitra+
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Menu Items */}
          <nav className="space-y-2 flex-1">
            {mainMenuItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => handleNavigation(item.route, item.label)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selected === item.label
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                whileHover={{ x: 3 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-2 pt-4 border-t border-gray-200/50">
            {bottomMenuItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => handleNavigation(item.route, item.label)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  item.isEmergency
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : selected === item.label
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                whileHover={{ x: 3 }}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.isEmergency ? 'animate-pulse' : ''}`} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isMobileMenuOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-50"
      >
        <div className="p-4 h-full flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="MannMitra Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="font-bold text-lg text-gray-800">
              MannMitra+
            </div>
          </div>

          {/* Main Menu Items */}
          <nav className="space-y-2 flex-1">
            {mainMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.route, item.label)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selected === item.label
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-2 pt-4 border-t border-gray-200/50">
            {bottomMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.route, item.label)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  item.isEmergency
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : selected === item.label
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200/50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.isEmergency ? 'animate-pulse' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;