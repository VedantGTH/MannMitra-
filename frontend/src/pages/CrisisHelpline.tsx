import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Phone, 
  Copy, 
  Heart, 
  Wind, 
  Eye, 
  Hand, 
  MessageCircle,
  User,
  BookOpen,
  Smile,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CrisisHelpline = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const helplines = [
    {
      name: "Suicide Prevention Helpline",
      number: "988",
      description: "24/7 Crisis Support",
      country: "India",
      type: "call"
    },
    {
      name: "Mental Health Support",
      number: "1800-599-0019",
      description: "Free Mental Health Helpline",
      country: "India", 
      type: "call"
    },
    {
      name: "National Suicide Prevention Lifeline",
      number: "1-800-273-8255",
      description: "24/7 Crisis Support",
      country: "USA",
      type: "call"
    },
    {
      name: "Samaritans",
      number: "116 123",
      description: "Free to call anytime",
      country: "UK",
      type: "call"
    },
    {
      name: "Lifeline Australia",
      number: "13 11 14",
      description: "24 hour crisis support",
      country: "Australia",
      type: "call"
    }
  ];

  const groundingTips = [
    {
      icon: Wind,
      title: "Deep Breathing",
      description: "Inhale for 4s, hold 4s, exhale 6s",
      detail: "This activates your body's relaxation response and helps calm your nervous system."
    },
    {
      icon: Eye,
      title: "5-4-3-2-1 Method",
      description: "5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
      detail: "This grounding technique helps bring your focus back to the present moment."
    },
    {
      icon: Hand,
      title: "Move Your Body",
      description: "Stretch or walk around for 2–3 minutes",
      detail: "Physical movement helps release tension and endorphins that improve mood."
    },
    {
      icon: MessageCircle,
      title: "Reach Out",
      description: "Text/call a trusted friend or family member",
      detail: "Connection with others is one of the most powerful tools for emotional support."
    }
  ];

  const nextSteps = [
    {
      icon: User,
      title: "Contact a professional therapist or counselor",
      description: "Professional support can provide long-term strategies and healing"
    },
    {
      icon: MessageCircle,
      title: "Use the AI chatbot for mental wellness support",
      description: "Our AI assistant is available 24/7 for immediate emotional support"
    },
    {
      icon: BookOpen,
      title: "Keep a journal or mood diary",
      description: "Writing helps process emotions and track your mental health journey"
    },
    {
      icon: Smile,
      title: "Take a short break, hydrate, and practice mindfulness",
      description: "Small self-care actions can make a significant difference in how you feel"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
            }}
            animate={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Crisis Support" />

        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-[70px]'
          }`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 p-6"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
              >
                You're Not Alone
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg"
              >
                Help is Available 24/7
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-500 mt-2"
              >
                If you're in distress or feeling unsafe, please reach out immediately. You matter.
              </motion.p>
            </div>
          </motion.div>

          <div className="p-6 space-y-12">
          {/* Emergency Helplines */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Emergency Helplines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helplines.map((helpline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{helpline.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{helpline.country}</p>
                    <p className="text-sm text-gray-500">{helpline.description}</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-blue-600 mb-3">{helpline.number}</div>
                    
                    <div className="flex gap-2 justify-center">
                      <a
                        href={`tel:${helpline.number}`}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </a>
                      
                      <button
                        onClick={() => copyToClipboard(helpline.number)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {copiedNumber === helpline.number ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Quick Grounding Techniques */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Grounding Techniques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groundingTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/80 p-3 rounded-full">
                      <tip.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{tip.title}</h3>
                      <p className="text-gray-700 mb-3 font-medium">{tip.description}</p>
                      <p className="text-sm text-gray-600">{tip.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Next Steps */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">If You're Feeling Overwhelmed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-full">
                      <step.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Assistant Message */}
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 border border-blue-200/50">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">I'm here to help you</h3>
              <p className="text-gray-600 mb-4">
                Click any helpline above or try the grounding techniques. Remember, seeking help is a sign of strength, not weakness.
              </p>
              <button
                onClick={() => navigate('/ai-chatbot')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Chat with AI Support
              </button>
            </div>
          </motion.section>
          </div>
        </div>
      </div>

      {/* Emergency Button - Always visible */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <a
          href="tel:988"
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Phone className="w-7 h-7" />
        </a>
      </motion.div>
    </div>
  );
};

export default CrisisHelpline;