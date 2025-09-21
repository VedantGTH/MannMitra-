import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, Send, User, Loader2, Mic, MicOff, Volume2, VolumeX, Phone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { apiService, type ChatMessage, type CurrentMood } from '../services/api';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { ttsService } from '../utils/textToSpeech';

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

// AI Robot Component
const AIRobot: React.FC = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="absolute top-20 right-20 opacity-20"
      animate={{
        y: mousePosition.y + (Math.sin(Date.now() * 0.001) * 10),
        rotate: [0, 5, -5, 0],
        x: mousePosition.x,
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        x: { type: "spring", stiffness: 50, damping: 20 },
        y: { type: "spring", stiffness: 50, damping: 20 },
      }}
    >
      <Bot className="w-32 h-32 text-blue-500" />
    </motion.div>
  );
};

// Chatbot Card Component
const ChatbotCard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'bot', text: 'Hello! I\'m MannMitra, your AI mental wellness companion. How can I help you today?', timestamp: new Date() },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<CurrentMood | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const { isRecording, startRecording, stopRecording, error: recordingError, isSupported: micSupported } = useVoiceRecording();

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message immediately
    const newUserMessage: ChatMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      console.log('📤 Sending message to AI:', userMessage);
      
      // Send to backend
      const response = await apiService.sendChatMessage(
        userMessage, 
        currentMood || undefined, 
        messages,
        userId
      );
      
      console.log('📥 Received AI response:', response);
      
      // Add bot response
      const botMessage: ChatMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage: ChatMessage = {
        type: 'bot',
        text: 'I\'m having trouble connecting right now, but I\'m here for you. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = async () => {
    if (!micSupported) {
      const errorMessage: ChatMessage = {
        type: 'bot',
        text: 'Voice input is not supported in this browser. Please type your message instead.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (isRecording) {
      // Stop recording and transcribe
      try {
        console.log('🛑 Stopping voice recording...');
        setIsTranscribing(true);
        
        const audioBlob = await stopRecording();
        
        if (audioBlob && audioBlob.size > 0) {
          console.log('🎤 Processing audio...', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          // Add processing message
          const processingMessage: ChatMessage = {
            type: 'bot',
            text: '🎤 Processing your voice input...',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, processingMessage]);
          
          // Use backend speech-to-text service
          const transcription = await apiService.speechToText(audioBlob);
          
          console.log('📝 Transcription received:', transcription);
          
          if (transcription && transcription.trim()) {
            setMessage(transcription);
            
            // Remove processing message and show transcription preview
            setMessages(prev => {
              const filtered = prev.filter(msg => !msg.text.includes('Processing your voice'));
              return [...filtered, {
                type: 'bot',
                text: `I heard: "${transcription}"\n\nYou can edit this text above or send it as is. 🎤`,
                timestamp: new Date()
              }];
            });
            
            // Auto-focus the text input for editing
            setTimeout(() => {
              const textArea = document.querySelector('textarea');
              if (textArea) {
                textArea.focus();
                textArea.setSelectionRange(transcription.length, transcription.length);
              }
            }, 100);
            
          } else {
            throw new Error('Empty transcription received');
          }
        } else {
          throw new Error('No audio recorded or audio too short');
        }
        
      } catch (error) {
        console.error('❌ Voice input error:', error);
        
        // Remove processing message if it exists
        setMessages(prev => prev.filter(msg => !msg.text.includes('Processing your voice')));
        
        let errorText = 'I couldn\'t understand your voice input. ';
        
        if (error instanceof Error) {
          if (error.message.includes('too short')) {
            errorText += 'Please try speaking for at least 2-3 seconds.';
          } else if (error.message.includes('Empty')) {
            errorText += 'No audio was detected. Please check your microphone.';
          } else if (error.message.includes('network') || error.message.includes('timeout')) {
            errorText += 'Network issue detected. Please try again.';
          } else {
            errorText += 'Please try speaking more clearly or type your message.';
          }
        } else {
          errorText += 'Please try again or type your message.';
        }
        
        const errorMessage: ChatMessage = {
          type: 'bot',
          text: errorText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Start recording
      console.log('🎤 Starting voice recording...');
      
      // Clear any previous errors
      if (recordingError) {
        // Don't show error in chat, just clear it
        console.log('Clearing previous recording error');
      }
      
      try {
        await startRecording();
        
        // Show recording started message
        const recordingMessage: ChatMessage = {
          type: 'bot',
          text: '🎤 Recording started! Speak clearly and click the microphone again when finished.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, recordingMessage]);
        
      } catch (startError) {
        console.error('❌ Failed to start recording:', startError);
        
        const startErrorMessage: ChatMessage = {
          type: 'bot',
          text: 'Unable to start recording. Please check your microphone permissions and try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, startErrorMessage]);
      }
    }
  };

  const handleTextToSpeech = async (text: string, messageIndex: number) => {
    if (!ttsService.isSupported()) {
      const errorMessage: ChatMessage = {
        type: 'bot',
        text: 'Text-to-speech is not supported in this browser.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      // Stop any current speech
      ttsService.stop();
      
      if (speakingMessageIndex === messageIndex) {
        setSpeakingMessageIndex(null);
        return;
      }
      
      setSpeakingMessageIndex(messageIndex);
      console.log('🔊 Starting TTS for message:', text.substring(0, 50));
      
      // Use browser TTS (more reliable than backend)
      await ttsService.speak(text);
      
      setSpeakingMessageIndex(null);
      
    } catch (error) {
      console.error('❌ Text-to-speech error:', error);
      setSpeakingMessageIndex(null);
      
      const errorMessage: ChatMessage = {
        type: 'bot',
        text: 'I couldn\'t read that message aloud. Please check your browser\'s audio settings.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-4xl mx-auto bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden"
    >


      {/* Mood Selector */}
      <div className="p-4 border-b border-white/20">
        <p className="text-sm text-gray-600 mb-2">How are you feeling today?</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'happy', label: 'Happy', emoji: '😊' },
            { value: 'sad', label: 'Sad', emoji: '😢' },
            { value: 'anxious', label: 'Anxious', emoji: '😰' },
            { value: 'angry', label: 'Angry', emoji: '😡' },
            { value: 'tired', label: 'Tired', emoji: '😴' },
            { value: 'neutral', label: 'Neutral', emoji: '😐' },
          ].map((mood) => (
            <button
              key={mood.value}
              onClick={() => setCurrentMood(mood)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                currentMood?.value === mood.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/30 text-gray-700 hover:bg-white/50'
              }`}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-96 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
              {msg.type === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className={`p-3 rounded-2xl whitespace-pre-wrap ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/50 text-gray-800 border border-white/30'
                }`}>
                  {msg.text}
                </div>
                {msg.type === 'bot' && ttsService.isSupported() && (
                  <button
                    onClick={() => handleTextToSpeech(msg.text, index)}
                    className="self-start p-1 rounded-full bg-white/30 hover:bg-white/50 transition-colors duration-200 border border-white/30"
                    title={speakingMessageIndex === index ? 'Stop speaking' : 'Read aloud'}
                  >
                    {speakingMessageIndex === index ? (
                      <VolumeX className="w-3 h-3 text-gray-600" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
              {msg.type === 'user' && (
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 rounded-2xl bg-white/50 border border-white/30">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MannMitra is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/20 bg-white/10">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isRecording ? "🎤 Recording... Click mic to stop" : 
              isTranscribing ? "🔄 Converting speech to text..." :
              "Share your thoughts or feelings..."
            }
            disabled={isLoading || isTranscribing}
            className="flex-1 p-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 resize-none min-h-[48px] max-h-32 disabled:opacity-50"
            rows={1}
          />
          
          {/* Voice Input Button */}
          {micSupported && (
            <button
              onClick={handleVoiceInput}
              disabled={isLoading || isTranscribing}
              className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-white/30 hover:bg-white/50 text-gray-700 border border-white/30'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim() || isRecording || isTranscribing}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Status Messages */}
        <div className="mt-2 space-y-1">
          {currentMood && (
            <p className="text-xs text-gray-500">
              Current mood: {currentMood.emoji} {currentMood.label}
            </p>
          )}
          {recordingError && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {recordingError}
            </p>
          )}
          {isRecording && (
            <p className="text-xs text-blue-600 animate-pulse bg-blue-50 p-2 rounded border border-blue-200">
              🎤 Recording in progress... Click the red microphone button to stop
            </p>
          )}
          {isTranscribing && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
              🔄 Converting your speech to text... Please wait
            </p>
          )}
          {!micSupported && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
              📱 Voice input not supported in this browser. Please use the text input instead.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AIChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 relative" style={{margin: 0, padding: 0}}>
      <FloatingParticles />
      
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
      
      <AIRobot />

      <div className="flex relative z-10 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentPage="AI Chatbot" />

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
              <h1 className="text-4xl font-bold text-gray-800 mb-1">AI Mental Wellness Companion</h1>
              <p className="text-gray-600">Your confidential support system, available 24/7</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
            <div className="w-full">
              <ChatbotCard />
            </div>
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

export default AIChatbot;