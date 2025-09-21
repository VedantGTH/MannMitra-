import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Heart, 
  RefreshCw, 
  Music, 
  Clock, 
  Phone,
  Headphones,
  Volume2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/Sidebar';
import { MOOD_OPTIONS, type MoodData } from '../utils/moodConfig';

interface Playlist {
  id: string;
  name: string;
  description: string;
  songCount: number;
  duration: string;
  coverColor: string;
  songs: string[];
  aiReason: string;
}

const MoodToMusic = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodData | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);



  const generatePlaylists = (mood: MoodData): Playlist[] => {
    const playlistData: Record<string, Playlist[]> = {
      'Good': [
        {
          id: 'good-1',
          name: 'Sunshine Vibes',
          description: 'Uplifting tracks to amplify your positive energy',
          songCount: 25,
          duration: '1h 32m',
          coverColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
          songs: ['Good as Hell - Lizzo', 'Happy - Pharrell Williams', 'Can\'t Stop the Feeling - Justin Timberlake', 'Walking on Sunshine - Katrina & The Waves'],
          aiReason: 'These upbeat songs match your good mood with energetic rhythms and positive lyrics to keep your spirits high.'
        }
      ],
      'Great': [
        {
          id: 'great-1',
          name: 'Feel Good Classics',
          description: 'Timeless hits that never fail to make you smile',
          songCount: 30,
          duration: '2h 15m',
          coverColor: 'bg-gradient-to-br from-pink-400 to-red-500',
          songs: ['Don\'t Worry Be Happy - Bobby McFerrin', 'I Got You (I Feel Good) - James Brown', 'Good Vibrations - The Beach Boys', 'Dancing Queen - ABBA'],
          aiReason: 'Classic feel-good songs that have made people happy for decades, perfect for maintaining your joyful state.'
        }
      ],
      'Amazing': [
        {
          id: 'amazing-1',
          name: 'Pure Joy',
          description: 'High-energy celebration music',
          songCount: 28,
          duration: '1h 50m',
          coverColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
          songs: ['Celebration - Kool & The Gang', 'Uptown Funk - Mark Ronson ft. Bruno Mars', 'I Gotta Feeling - Black Eyed Peas', 'September - Earth Wind & Fire'],
          aiReason: 'These celebration anthems match your amazing mood with infectious energy and party vibes.'
        }
      ],
      'Happy': [
        {
          id: 'happy-1',
          name: 'Sunshine Vibes',
          description: 'Uplifting tracks to amplify your positive energy',
          songCount: 25,
          duration: '1h 32m',
          coverColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
          songs: ['Good as Hell - Lizzo', 'Happy - Pharrell Williams', 'Can\'t Stop the Feeling - Justin Timberlake', 'Walking on Sunshine - Katrina & The Waves'],
          aiReason: 'These upbeat songs match your happy mood with energetic rhythms and positive lyrics to keep your spirits high.'
        },
        {
          id: 'happy-2',
          name: 'Feel Good Classics',
          description: 'Timeless hits that never fail to make you smile',
          songCount: 30,
          duration: '2h 15m',
          coverColor: 'bg-gradient-to-br from-pink-400 to-red-500',
          songs: ['Don\'t Worry Be Happy - Bobby McFerrin', 'I Got You (I Feel Good) - James Brown', 'Good Vibrations - The Beach Boys', 'Dancing Queen - ABBA'],
          aiReason: 'Classic feel-good songs that have made people happy for decades, perfect for maintaining your joyful state.'
        }
      ],
      'Terrible': [
        {
          id: 'terrible-1',
          name: 'Healing Hearts',
          description: 'Gentle melodies to comfort and heal',
          songCount: 20,
          duration: '1h 18m',
          coverColor: 'bg-gradient-to-br from-blue-400 to-indigo-600',
          songs: ['Someone Like You - Adele', 'Fix You - Coldplay', 'The Sound of Silence - Simon & Garfunkel', 'Mad World - Gary Jules'],
          aiReason: 'These songs acknowledge your difficult feelings while providing emotional comfort and a path toward healing.'
        }
      ],
      'Bad': [
        {
          id: 'bad-1',
          name: 'Gentle Recovery',
          description: 'Soft acoustic songs for emotional processing',
          songCount: 18,
          duration: '1h 5m',
          coverColor: 'bg-gradient-to-br from-teal-400 to-blue-500',
          songs: ['Breathe Me - Sia', 'Hurt - Johnny Cash', 'Black - Pearl Jam', 'Tears in Heaven - Eric Clapton'],
          aiReason: 'Gentle acoustic melodies that help process difficult emotions and provide a sense of understanding.'
        }
      ],
      'Poor': [
        {
          id: 'sad-1',
          name: 'Healing Hearts',
          description: 'Gentle melodies to comfort and heal',
          songCount: 20,
          duration: '1h 18m',
          coverColor: 'bg-gradient-to-br from-blue-400 to-indigo-600',
          songs: ['Someone Like You - Adele', 'Fix You - Coldplay', 'The Sound of Silence - Simon & Garfunkel', 'Mad World - Gary Jules'],
          aiReason: 'These songs acknowledge your feelings while providing emotional comfort and a path toward healing.'
        },
        {
          id: 'sad-2',
          name: 'Gentle Recovery',
          description: 'Soft acoustic songs for emotional processing',
          songCount: 18,
          duration: '1h 5m',
          coverColor: 'bg-gradient-to-br from-teal-400 to-blue-500',
          songs: ['Breathe Me - Sia', 'Hurt - Johnny Cash', 'Black - Pearl Jam', 'Tears in Heaven - Eric Clapton'],
          aiReason: 'Gentle acoustic melodies that help process difficult emotions and provide a sense of understanding.'
        }
      ],
      'Okay': [
        {
          id: 'okay-1',
          name: 'Steady Vibes',
          description: 'Balanced music for a neutral mood',
          songCount: 22,
          duration: '1h 30m',
          coverColor: 'bg-gradient-to-br from-gray-400 to-slate-500',
          songs: ['Weightless - Marconi Union', 'Clair de Lune - Claude Debussy', 'River - Joni Mitchell', 'The Night We Met - Lord Huron'],
          aiReason: 'Balanced tracks that provide gentle emotional support without being too intense.'
        }
      ],
      'Angry': [
        {
          id: 'angry-1',
          name: 'Release & Reset',
          description: 'High-energy tracks to channel your intensity',
          songCount: 22,
          duration: '1h 25m',
          coverColor: 'bg-gradient-to-br from-red-500 to-orange-600',
          songs: ['Break Stuff - Limp Bizkit', 'Bodies - Drowning Pool', 'Killing in the Name - Rage Against the Machine', 'Chop Suey! - System of a Down'],
          aiReason: 'High-energy rock and metal tracks that help you channel anger constructively and release tension.'
        }
      ],
      'Fantastic': [
        {
          id: 'fantastic-1',
          name: 'Victory Lap',
          description: 'Triumphant songs for your fantastic mood',
          songCount: 24,
          duration: '1h 40m',
          coverColor: 'bg-gradient-to-br from-gold-400 to-yellow-500',
          songs: ['We Are The Champions - Queen', 'Eye of the Tiger - Survivor', 'Stronger - Kelly Clarkson', 'Roar - Katy Perry'],
          aiReason: 'Empowering anthems that celebrate your fantastic mood and inner strength.'
        }
      ],
      'Tired': [
        {
          id: 'tired-1',
          name: 'Peaceful Rest',
          description: 'Calming sounds for relaxation and sleep',
          songCount: 15,
          duration: '58m',
          coverColor: 'bg-gradient-to-br from-purple-400 to-indigo-500',
          songs: ['Weightless - Marconi Union', 'Clair de Lune - Claude Debussy', 'River - Joni Mitchell', 'The Night We Met - Lord Huron'],
          aiReason: 'Scientifically proven relaxing tracks that slow your heart rate and prepare your mind for rest.'
        }
      ],
      'Incredible': [
        {
          id: 'incredible-1',
          name: 'Sky High',
          description: 'Soaring melodies for incredible feelings',
          songCount: 26,
          duration: '1h 45m',
          coverColor: 'bg-gradient-to-br from-indigo-400 to-purple-500',
          songs: ['Flying - The Beatles', 'Fly Me to the Moon - Frank Sinatra', 'Higher Love - Steve Winwood', 'On Top of the World - Imagine Dragons'],
          aiReason: 'Uplifting songs that match your incredible mood with soaring melodies and inspiring lyrics.'
        }
      ],
      'Perfect': [
        {
          id: 'perfect-1',
          name: 'Pure Bliss',
          description: 'Perfect songs for a perfect mood',
          songCount: 30,
          duration: '2h 10m',
          coverColor: 'bg-gradient-to-br from-pink-400 to-rose-500',
          songs: ['Perfect - Ed Sheeran', 'What a Wonderful World - Louis Armstrong', 'Here Comes the Sun - The Beatles', 'Three Little Birds - Bob Marley'],
          aiReason: 'These perfect songs celebrate life\'s beautiful moments and match your blissful state of mind.'
        }
      ],
      'Anxious': [
        {
          id: 'anxious-1',
          name: 'Calm & Centered',
          description: 'Soothing melodies to ease anxiety',
          songCount: 20,
          duration: '1h 12m',
          coverColor: 'bg-gradient-to-br from-green-400 to-teal-500',
          songs: ['Breathe - Pink Floyd', 'Aqueous Transmission - Incubus', 'Holocene - Bon Iver', 'Spiegel im Spiegel - Arvo Pärt'],
          aiReason: 'Calming instrumental and ambient tracks designed to reduce anxiety and promote mindfulness.'
        }
      ],
      'Default': [
        {
          id: 'neutral-1',
          name: 'Discover New Sounds',
          description: 'Eclectic mix to spark new emotions',
          songCount: 28,
          duration: '1h 45m',
          coverColor: 'bg-gradient-to-br from-gray-400 to-slate-600',
          songs: ['Bohemian Rhapsody - Queen', 'Stairway to Heaven - Led Zeppelin', 'Hotel California - Eagles', 'Imagine - John Lennon'],
          aiReason: 'A diverse selection of genres and moods to help you explore different emotional landscapes.'
        }
      ]
    };

    return playlistData[mood.label] || playlistData['Default'] || [{
      id: 'default-1',
      name: 'Discover New Sounds',
      description: 'Eclectic mix to spark new emotions',
      songCount: 28,
      duration: '1h 45m',
      coverColor: 'bg-gradient-to-br from-gray-400 to-slate-600',
      songs: ['Bohemian Rhapsody - Queen', 'Stairway to Heaven - Led Zeppelin', 'Hotel California - Eagles', 'Imagine - John Lennon'],
      aiReason: 'A diverse selection of genres and moods to help you explore different emotional landscapes.'
    }];
  };

  useEffect(() => {
    // Auto-detect mood from recent entries or set default
    const recentMoods = localStorage.getItem('recent-moods');
    if (recentMoods) {
      const parsed = JSON.parse(recentMoods);
      if (parsed.length > 0) {
        const lastMood = parsed[0];
        const moodData = MOOD_OPTIONS.find(m => m.label.toLowerCase() === lastMood.label?.toLowerCase()) || MOOD_OPTIONS[4];
        setCurrentMood(moodData);
        setPlaylists(generatePlaylists(moodData));
      }
    } else {
      setCurrentMood(MOOD_OPTIONS[4]);
      setPlaylists(generatePlaylists(MOOD_OPTIONS[4]));
    }

    // Load saved playlists
    const saved = localStorage.getItem('saved-playlists');
    if (saved) {
      setSavedPlaylists(JSON.parse(saved));
    }
  }, []);

  const handleMoodSelect = (mood: MoodData) => {
    setCurrentMood(mood);
    setLoading(true);
    setTimeout(() => {
      setPlaylists(generatePlaylists(mood));
      setLoading(false);
    }, 1000);
  };

  const handleRefreshPlaylists = () => {
    if (!currentMood) return;
    setLoading(true);
    setTimeout(() => {
      setPlaylists(generatePlaylists(currentMood));
      setLoading(false);
    }, 1000);
  };

  const handleSavePlaylist = (playlistId: string) => {
    const newSaved = savedPlaylists.includes(playlistId) 
      ? savedPlaylists.filter(id => id !== playlistId)
      : [...savedPlaylists, playlistId];
    
    setSavedPlaylists(newSaved);
    localStorage.setItem('saved-playlists', JSON.stringify(newSaved));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
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

      {/* Floating music notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`note-${i}`}
            className="absolute text-blue-300/20 text-2xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
            }}
            animate={{
              y: -50,
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            ♪
          </motion.div>
        ))}
      </div>

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="Mood to Music" />

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
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              
              <div className="text-center flex-1">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
                >
                  AI Mood-to-Music Playlists
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600"
                >
                  Listen to curated playlists that match your current mood
                </motion.p>
              </div>
            </div>
          </motion.div>

          <div className="p-6 space-y-8">
            {/* Mood Selection */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling?</h2>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                {MOOD_OPTIONS.map((mood, index) => (
                  <motion.button
                    key={mood.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      currentMood?.label === mood.label
                        ? `${mood.bgColor} border-current ${mood.color} shadow-lg`
                        : 'bg-white/80 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            {/* Current Mood Display */}
            {currentMood && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`${currentMood.bgColor} rounded-2xl p-6 border border-gray-200/50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{currentMood.emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Current Mood: {currentMood.label}
                      </h3>
                      <p className="text-gray-600">AI is generating playlists for your mood...</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshPlaylists}
                    disabled={loading}
                    className="p-3 bg-white/80 hover:bg-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </motion.section>
            )}

            {/* AI Generated Playlists */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">AI Generated Playlists</h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/80 rounded-xl p-6 animate-pulse">
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                          <div 
                            className={`w-full h-32 ${playlist.coverColor} rounded-lg mb-4 flex items-center justify-center`}
                          >
                            <Music className="w-12 h-12 text-white" />
                          </div>
                          
                          <h3 className="font-bold text-lg text-gray-800 mb-2">{playlist.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{playlist.description}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Headphones className="w-4 h-4" />
                              {playlist.songCount} songs
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {playlist.duration}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPlaylist(playlist)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleSavePlaylist(playlist.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                savedPlaylists.includes(playlist.id)
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${savedPlaylists.includes(playlist.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      {/* Playlist Details Modal */}
      <AnimatePresence>
        {selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlaylist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedPlaylist.name}</h2>
                <button
                  onClick={() => setSelectedPlaylist(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className={`w-full h-40 ${selectedPlaylist.coverColor} rounded-lg mb-6 flex items-center justify-center`}>
                <Volume2 className="w-16 h-16 text-white" />
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Why this playlist?</h3>
                <p className="text-gray-600 italic">"{selectedPlaylist.aiReason}"</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Songs in this playlist:</h3>
                <div className="space-y-2">
                  {selectedPlaylist.songs.map((song, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{song}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Play on Spotify
                </button>
                <button
                  onClick={() => handleSavePlaylist(selectedPlaylist.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    savedPlaylists.includes(selectedPlaylist.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${savedPlaylists.includes(selectedPlaylist.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
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

export default MoodToMusic;