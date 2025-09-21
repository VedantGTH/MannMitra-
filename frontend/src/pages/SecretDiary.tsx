import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, Sparkles, Calendar, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/Sidebar';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DiaryEntry {
  id: string;
  text: string;
  timestamp: Date;
  reflection?: string;
}

const SecretDiary = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [aiReflection, setAiReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const saved = localStorage.getItem('diary-entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
    }
  };

  const saveEntry = async () => {
    if (!currentEntry.trim()) return;

    setSaving(true);
    
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      text: currentEntry,
      timestamp: new Date()
    };

    try {
      // Call Firebase function for AI reflection
      const functions = getFunctions();
      const diaryAI = httpsCallable(functions, 'diaryAI');
      
      const result = await diaryAI({ entry: currentEntry });
      const data = result.data as { reflection: string };
      
      if (data.reflection) {
        newEntry.reflection = data.reflection;
        setAiReflection(data.reflection);
      }
    } catch (error) {
      console.error('AI reflection failed:', error);
      const fallback = "Your words matter. Keep writing 🌱";
      newEntry.reflection = fallback;
      setAiReflection(fallback);
    }

    // Save to localStorage
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('diary-entries', JSON.stringify(updatedEntries));
    
    setCurrentEntry('');
    setSaving(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSnippet = (text: string) => {
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Secret Diary" />

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
              <h1 className="text-4xl font-bold text-gray-800 mb-1">My Secret Diary ✨</h1>
              <p className="text-gray-600">Your private space for thoughts and reflections</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6 space-y-8">
            {/* New Entry Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">What's on your mind today?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    placeholder="Write your thoughts, feelings, or experiences here..."
                    className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50"
                    disabled={saving}
                  />
                  <button
                    onClick={saveEntry}
                    disabled={!currentEntry.trim() || saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Reflection Section */}
            {aiReflection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      AI Reflection for Today 💙
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 italic leading-relaxed text-lg">
                      "{aiReflection}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Past Entries Section */}
            {entries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Past Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.timestamp)}
                            </span>
                            <button
                              onClick={() => setExpandedEntry(
                                expandedEntry === entry.id ? null : entry.id
                              )}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedEntry === entry.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          <p className="text-gray-700 mb-2">
                            {expandedEntry === entry.id ? entry.text : getSnippet(entry.text)}
                          </p>
                          
                          {entry.reflection && expandedEntry === entry.id && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-300">
                              <p className="text-purple-700 italic text-sm">
                                💙 "{entry.reflection}"
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
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

export default SecretDiary;