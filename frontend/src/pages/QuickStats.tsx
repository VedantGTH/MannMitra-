import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  TrendingUp,
  Target,
  Lightbulb,
  Calendar,
  BarChart3,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/Sidebar';
import { MOOD_OPTIONS } from '../utils/moodConfig';

interface MoodEntry {
  id: string;
  mood: number;
  label: string;
  emoji: string;
  timestamp: Date;
}

const QuickStats = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  
  // Load recent moods on component mount
  useEffect(() => {
    const loadRecentMoods = async () => {
      try {
        const response = await fetch('https://us-central1-manmitra-f60af.cloudfunctions.net/getRecentMoods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: { userId: 'anonymous', limit: 10 }
          })
        });
        
        const result = await response.json();
        
        if (result.result?.success && result.result.moods) {
          const moods = result.result.moods.map((mood: any) => ({
            id: mood.id,
            mood: mood.mood,
            label: mood.moodLabel,
            emoji: mood.moodEmoji,
            timestamp: new Date(mood.timestamp?.seconds * 1000 || mood.createdAt)
          }));
          setRecentMoods(moods);
        }
      } catch (error) {
        console.error('❌ Error loading recent moods:', error);
      }
    };
    
    loadRecentMoods();
  }, []);

  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const moodsThisWeek = recentMoods.filter(mood => mood.timestamp >= weekAgo).length;
  const averageMood = recentMoods.length > 0 
    ? (recentMoods.reduce((sum, mood) => sum + mood.mood, 0) / recentMoods.length).toFixed(1)
    : '0';
  const streakDays = recentMoods.length;

  const statItems = [
    { label: "Moods This Week", value: moodsThisWeek.toString(), icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Average Mood", value: `${averageMood}/10`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tips Viewed", value: "12", icon: Lightbulb, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Streak Days", value: `${streakDays} days`, icon: Target, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Quick Stats" />

        <div 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-[70px]'
          }`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-b border-gray-200/50 bg-white/70 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quick Stats</h1>
                <p className="text-gray-600">Your wellness journey at a glance</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* Quick Stats Grid */}
            <section>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-800 mb-6"
              >
                Your Statistics
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Recent Moods */}
            <section>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-800 mb-6"
              >
                Recent Moods
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    {recentMoods.length > 0 ? (
                      <div className="space-y-4">
                        {recentMoods.map((entry, index) => (
                          <motion.div 
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">{entry.emoji}</span>
                              <div>
                                <div className="font-semibold text-gray-800">{entry.label}</div>
                                <div className="text-sm text-gray-600">{formatDate(entry.timestamp)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-800">{entry.mood}/10</div>
                              <div className="text-xs text-gray-500">Mood Score</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No mood entries yet</p>
                        <p className="text-sm">Start tracking your mood to see insights here!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          </div>
        </div>
      </div>

      {/* Emergency Button */}
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
    </div>
  );
};

export default QuickStats;