import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Heart,
  Lightbulb,
  User,
  Settings,
  Phone,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  FileText,
  ChevronRight,
  Calendar,
  BarChart3,
  Bot,
  Upload,
  BookOpen,
  Music,
  Gamepad2,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Simple types
interface MoodEntry {
  id: string;
  mood: number;
  label: string;
  emoji: string;
  timestamp: Date;
}

// Floating Particles Background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
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
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

import Sidebar from '../components/Sidebar';

import { MOOD_OPTIONS } from '../utils/moodConfig';

// Mood Entry Card
const MoodEntryCard = ({ onMoodSaved, onMoodSavedSuccess }: { onMoodSaved: (entry: MoodEntry) => void; onMoodSavedSuccess: () => void }) => {
  const [mood, setMood] = useState(7);
  const [saving, setSaving] = useState(false);

  const handleSaveMood = async () => {
    setSaving(true);
    
    try {
      const userId = 'anonymous'; // Use consistent user ID
      
      // Call the API to save mood
      const response = await fetch('https://us-central1-manmitra-f60af.cloudfunctions.net/saveMoodEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            userId,
            mood,
            moodLabel: MOOD_OPTIONS[mood - 1]?.label || 'Unknown',
            moodEmoji: MOOD_OPTIONS[mood - 1]?.emoji || '😐',
            note: ''
          }
        })
      });
      
      const result = await response.json();
      
      if (result.result?.success) {
        const newEntry: MoodEntry = {
          id: result.result.id,
          mood,
          label: MOOD_OPTIONS[mood - 1]?.label || 'Unknown',
          emoji: MOOD_OPTIONS[mood - 1]?.emoji || '😐',
          timestamp: new Date()
        };
        
        onMoodSaved(newEntry);
        onMoodSavedSuccess();
        console.log('✅ Mood saved successfully');
      } else {
        throw new Error('Failed to save mood');
      }
    } catch (error) {
      console.error('❌ Error saving mood:', error);
      // Still add to local state as fallback
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        mood,
        label: MOOD_OPTIONS[mood - 1]?.label || 'Unknown',
        emoji: MOOD_OPTIONS[mood - 1]?.emoji || '😐',
        timestamp: new Date()
      };
      onMoodSaved(newEntry);
      onMoodSavedSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-xl">How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center">
          <div className="text-8xl mb-4">{MOOD_OPTIONS[mood - 1]?.emoji}</div>
          <div className="text-2xl font-medium text-gray-700">{MOOD_OPTIONS[mood - 1]?.label}</div>
        </div>
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
        <button 
          onClick={handleSaveMood}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 text-lg rounded-lg font-medium transition-all duration-200 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Mood Entry'}
        </button>
      </CardContent>
    </Card>
  );
};

// Recent Moods Card
const RecentMoodsCard = ({ moods }: { moods: MoodEntry[] }) => {
  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="h-fit min-h-[200px]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Moods
        </CardTitle>
      </CardHeader>
      <CardContent>
        {moods.length > 0 ? (
          <div className="space-y-4">
            {moods.slice(0, 5).map((entry, index) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{entry.emoji}</span>
                  <span className="text-gray-600">{formatDate(entry.timestamp)}</span>
                </div>
                <span className="font-bold text-lg text-gray-700">{entry.mood}/10</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No mood entries yet</p>
            <p className="text-sm">Save your first mood to see it here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Stats Card
const QuickStatsCard = ({ moods, tipsViewed }: { moods: MoodEntry[], tipsViewed: number }) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const moodsThisWeek = moods.filter(mood => mood.timestamp >= weekAgo).length;
  const averageMood = moods.length > 0 
    ? (moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length).toFixed(1)
    : '0';

  const statItems = [
    { label: "Moods This Week", value: moodsThisWeek.toString(), icon: Heart, color: "text-pink-600" },
    { label: "Average Mood", value: `${averageMood}/10`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Tips Viewed", value: tipsViewed.toString(), icon: Lightbulb, color: "text-yellow-600" },
    { label: "Streak Days", value: `${Math.max(1, moods.length)} days`, icon: Target, color: "text-green-600" },
  ];

  return (
    <Card className="h-fit min-h-[200px]">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statItems.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
            >
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <div className="font-bold text-lg text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Daily Wellness Tip Card
const WellnessTipCard = ({ onTipViewed }: { onTipViewed: () => void }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  const tips = [
    "Take 5 deep breaths when feeling stressed - inhale for 4 counts, hold for 4, exhale for 6",
    "Drink a glass of water every hour to stay hydrated and boost energy levels",
    "Step outside for 10 minutes of fresh air and natural sunlight daily",
    "Practice gratitude by writing down 3 good things that happened today",
    "Do a quick 2-minute stretch to release tension in your neck and shoulders",
    "Listen to your favorite song and let yourself feel the emotions it brings",
    "Call or text someone you care about - connection boosts mental wellbeing",
    "Take a 5-minute walk, even if it's just around your room or office",
    "Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
    "Set a small, achievable goal for today and celebrate when you complete it",
    "Spend 2 minutes organizing your immediate space - a tidy environment can calm the mind",
    "Practice progressive muscle relaxation: tense and release each muscle group for 5 seconds",
    "Write down one worry, then write one action you can take about it today",
    "Look at photos that make you smile or remind you of happy memories",
    "Do something creative for 10 minutes - draw, write, sing, or craft something"
  ];

  const getNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    onTipViewed();
  };

  return (
    <Card className="h-fit min-h-[300px] bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg">
      <CardHeader>
        <motion.div 
          className="flex items-center gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </motion.div>
          <CardTitle className="text-center text-xl">Daily Wellness Tip</CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="text-center flex flex-col justify-center pb-6">
        <motion.p 
          key={currentTipIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 leading-relaxed mb-6 text-lg min-h-[3rem]"
        >
          {tips[currentTipIndex]}
        </motion.p>
        <button 
          onClick={getNextTip}
          className="bg-white/80 hover:bg-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 mx-auto"
        >
          Next Tip
          <ChevronRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, onClick, gradient }: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <div className={`p-6 rounded-2xl ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-200`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/60 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  </motion.div>
);

// Future Feature Card Component
const FutureFeatureCard = ({ icon: Icon, title, description }: {
  icon: any;
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
  >
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <div className="mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full inline-block">
        Coming Soon
      </div>
    </div>
  </motion.div>
);

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  
  // Load recent moods on component mount
  useEffect(() => {
    const loadRecentMoods = async () => {
      try {
        const userId = 'anonymous'; // Use consistent user ID
        const response = await fetch('https://us-central1-manmitra-f60af.cloudfunctions.net/getRecentMoods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: { userId, limit: 5 }
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
  const [tipsViewed, setTipsViewed] = useState(0);
  const [moodSaved, setMoodSaved] = useState(false);

  const handleMoodSaved = (newEntry: MoodEntry) => {
    setRecentMoods(prev => [newEntry, ...prev.slice(0, 4)]);
  };

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  const tips = [
    "Take 5 deep breaths when feeling stressed - inhale for 4 counts, hold for 4, exhale for 6",
    "Drink a glass of water every hour to stay hydrated and boost energy levels",
    "Step outside for 10 minutes of fresh air and natural sunlight daily",
    "Practice gratitude by writing down 3 good things that happened today",
    "Do a quick 2-minute stretch to release tension in your neck and shoulders",
    "Listen to your favorite song and let yourself feel the emotions it brings",
    "Call or text someone you care about - connection boosts mental wellbeing",
    "Take a 5-minute walk, even if it's just around your room or office",
    "Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
    "Set a small, achievable goal for today and celebrate when you complete it",
    "Spend 2 minutes organizing your immediate space - a tidy environment can calm the mind",
    "Practice progressive muscle relaxation: tense and release each muscle group for 5 seconds",
    "Write down one worry, then write one action you can take about it today",
    "Look at photos that make you smile or remind you of happy memories",
    "Do something creative for 10 minutes - draw, write, sing, or craft something"
  ];

  const handleTipViewed = () => {
    setCurrentTipIndex(prev => (prev + 1) % tips.length);
    setTipsViewed(prev => prev + 1);
  };

  const features = [
    {
      icon: Bot,
      title: "AI Chatbot",
      description: "Chat with your empathetic AI companion for mental wellness support 24/7",
      onClick: () => navigate('/ai-chatbot'),
      gradient: "bg-gradient-to-br from-blue-100 to-cyan-100 text-gray-800"
    },
    {
      icon: Upload,
      title: "Report Upload + AI Wellness Plan",
      description: "Upload medical reports and get personalized AI-generated wellness recommendations",
      onClick: () => navigate('/report-upload'),
      gradient: "bg-gradient-to-br from-green-100 to-emerald-100 text-gray-800"
    },
    {
      icon: BookOpen,
      title: "AI Secret Diary",
      description: "Write private thoughts and get AI reflections to help process your emotions",
      onClick: () => navigate('/secret-diary'),
      gradient: "bg-gradient-to-br from-purple-100 to-violet-100 text-gray-800"
    },
    {
      icon: Phone,
      title: "Crisis Helpline",
      description: "Immediate access to mental health crisis support and emergency resources",
      onClick: () => navigate('/crisis-helpline'),
      gradient: "bg-gradient-to-br from-red-100 to-pink-100 text-gray-800"
    },
    {
      icon: Music,
      title: "AI Mood-to-Music Playlists",
      description: "Get personalized music recommendations based on your current emotional state",
      onClick: () => navigate('/mood-to-music'),
      gradient: "bg-gradient-to-br from-orange-100 to-yellow-100 text-gray-800"
    }
  ];

  const futureFeatures = [
    {
      icon: Sparkles,
      title: "Digital Pet/Avatar",
      description: "A virtual companion that grows and evolves with your mental wellness journey"
    },
    {
      icon: Gamepad2,
      title: "Gamification",
      description: "Earn points, badges, and rewards for maintaining healthy mental wellness habits"
    },
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with others on similar wellness journeys in a safe, supportive environment"
    },
    {
      icon: GraduationCap,
      title: "Exam Buddy Mode",
      description: "Specialized support and stress management tools for students during exam periods"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      <FloatingParticles />
      
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Dashboard" />

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
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">Welcome to MannMitra+</h1>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6 space-y-12">
            {/* Mood Entry Section */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Mood Entry - Same Size */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="h-[400px]"
                >
                  <MoodEntryCard onMoodSaved={handleMoodSaved} onMoodSavedSuccess={() => {
                    setMoodSaved(true);
                    setTimeout(() => setMoodSaved(false), 3000);
                  }} />
                </motion.div>

                {/* Quick Stats Button - Same Size */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="h-[400px]"
                >
                  <Card className="bg-white shadow-lg border-0 h-full flex flex-col">
                    <CardContent className="p-6 text-center flex-1 flex flex-col justify-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-6 text-blue-600" />
                      <h3 className="text-2xl font-semibold text-gray-800 mb-3">View Your Progress</h3>
                      <p className="text-gray-600 mb-6 text-lg">Check your mood trends and wellness statistics</p>
                      <button 
                        onClick={() => navigate('/quick-stats')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-lg"
                      >
                        Quick Stats
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Daily Wellness Tip - Long Strip Below */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white/80 rounded-xl">
                        <Lightbulb className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Daily Wellness Tip</h3>
                        <motion.p 
                          key={currentTipIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="text-gray-700 text-lg leading-relaxed"
                        >
                          {tips[currentTipIndex]}
                        </motion.p>
                      </div>
                      <button 
                        onClick={handleTipViewed}
                        className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                      >
                        Next Tip
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Mood Saved Confirmation */}
            {moodSaved && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-green-600 font-semibold text-lg">✅ Mood Saved!</div>
                  <div className="text-green-700 text-sm mt-1">Your mood has been recorded successfully</div>
                </div>
              </motion.div>
            )}

            {/* Features Section */}
            <section>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800 mb-6 text-center"
              >
                Explore MannMitra Features
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Future Scope Section */}
            <section>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-2xl font-bold text-gray-800 mb-2 text-center"
              >
                Future Scope
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-gray-600 text-center mb-8"
              >
                Exciting features coming soon to enhance your wellness journey
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {futureFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                  >
                    <FutureFeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>
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

export default Dashboard;