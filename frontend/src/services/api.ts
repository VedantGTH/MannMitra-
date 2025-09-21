import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

// Types
export interface MoodEntry {
  id?: string;
  mood: number;
  label: string;
  emoji: string;
  note?: string;
  timestamp: Date;
  moodLabel?: string;
  moodEmoji?: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface CurrentMood {
  value: string;
  label: string;
  emoji: string;
}

// Firebase function references
const getChatResponse = httpsCallable(functions, 'getChatResponse');
const saveMoodEntry = httpsCallable(functions, 'saveMoodEntry');
const getRecentMoods = httpsCallable(functions, 'getRecentMoods');
const getWellnessTips = httpsCallable(functions, 'getWellnessTips');
const getQuickStats = httpsCallable(functions, 'getQuickStats');
const speechToText = httpsCallable(functions, 'speechToText');
const textToSpeech = httpsCallable(functions, 'textToSpeech');

export const apiService = {
  // Send chat message to backend
  async sendChatMessage(
    message: string, 
    currentMood?: CurrentMood, 
    recentMessages?: ChatMessage[],
    userId?: string
  ): Promise<string> {
    console.log('🚀 Calling AI backend...');
    
    try {
      const result = await getChatResponse({
        text: message,
        currentMood: currentMood,
        userId: userId || 'anonymous',
        sessionId: userId || 'anonymous'
      });
      
      console.log('✅ Backend response received:', result);
      
      if (result.data && (result.data as any).response) {
        const response = (result.data as any).response;
        const source = (result.data as any).source || 'unknown';
        
        console.log(`📝 AI Response (${source}):`, response);
        return response;
      }
      
      throw new Error('No response received from backend');
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      throw new Error('I\'m having trouble connecting right now. Please try again.');
    }
  },

  // Save mood entry
  async saveMoodEntry(moodData: Omit<MoodEntry, 'id' | 'timestamp'>, userId: string = 'anonymous'): Promise<MoodEntry> {
    try {
      console.log('🚀 API: Calling saveMoodEntry with:', { userId, moodData });
      
      const result = await saveMoodEntry({
        userId,
        mood: moodData.mood,
        note: moodData.note,
        moodLabel: moodData.label,
        moodEmoji: moodData.emoji
      });
      
      console.log('📥 API: Received result:', result);
      
      if (result.data && (result.data as any).success) {
        console.log('✅ API: Mood saved successfully');
        return (result.data as any).entry;
      }
      
      throw new Error('Backend returned unsuccessful response');
    } catch (error) {
      console.error('❌ API: Error saving mood:', error);
      throw new Error('Failed to save mood entry: ' + (error as Error).message);
    }
  },

  // Fetch recent moods
  async getRecentMoods(userId: string = 'anonymous', limitCount: number = 5): Promise<MoodEntry[]> {
    try {
      const result = await getRecentMoods({ userId, limit: limitCount });
      
      if (result.data && (result.data as any).success) {
        return (result.data as any).moods || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent moods:', error);
      return [];
    }
  },

  // Get wellness tips
  async getWellnessTips(): Promise<string[]> {
    try {
      console.log('🚀 API: Calling getWellnessTips');
      const result = await getWellnessTips({});
      
      console.log('📥 API: Wellness tips result:', result);
      
      if (result.data && (result.data as any).success) {
        const tips = (result.data as any).tips || [];
        console.log('✅ API: Got', tips.length, 'wellness tips');
        return tips;
      }
      
      console.log('⚠️ API: No tips received, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ API: Error fetching wellness tips:', error);
      return [];
    }
  },

  // Get quick stats
  async getQuickStats(userId: string = 'anonymous'): Promise<any> {
    try {
      const result = await getQuickStats({ userId });
      
      if (result.data && (result.data as any).success) {
        return (result.data as any).stats;
      }
      
      return {
        moodsThisWeek: 0,
        averageMood: '0/10',
        wellnessTipsViewed: 0,
        reportsUploaded: 0,
        streakDays: 0
      };
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return {
        moodsThisWeek: 0,
        averageMood: '0/10',
        wellnessTipsViewed: 0,
        reportsUploaded: 0,
        streakDays: 0
      };
    }
  },

  // Emergency contact function
  async triggerEmergency(): Promise<void> {
    try {
      console.log('Emergency button triggered');
      window.open('tel:988', '_self');
    } catch (error) {
      console.error('Error triggering emergency:', error);
    }
  },

  // Speech-to-Text function
  async speechToText(audioBlob: Blob): Promise<string> {
    try {
      console.log('🎤 Converting speech to text...', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      // Validate audio blob
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Empty audio blob');
      }
      
      if (audioBlob.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Audio file too large');
      }
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('📤 Sending audio to backend STT service...');
      
      const result = await speechToText({
        audioData: base64Audio,
        audioType: audioBlob.type || 'audio/webm'
      });
      
      const data = result.data as any;
      
      if (data && data.transcription) {
        const transcription = data.transcription.trim();
        const confidence = data.confidence || 0;
        const isFromFallback = data.fallback || data.error;
        
        console.log('✅ Transcription received:', {
          text: transcription,
          confidence: confidence,
          fallback: isFromFallback
        });
        
        // Log quality metrics
        if (confidence < 0.7 && !isFromFallback) {
          console.warn('⚠️ Low confidence transcription:', confidence);
        }
        
        return transcription;
      }
      
      throw new Error('No transcription in response');
      
    } catch (error) {
      console.error('❌ Speech-to-text failed:', error);
      
      return "Sorry, I couldn't catch that. Please try again.";
    }
  },

  // Text-to-Speech function
  async textToSpeech(text: string): Promise<{ audioContent?: string; useBrowserTTS: boolean }> {
    try {
      console.log('🔊 Converting text to speech...');
      
      // Always use browser TTS for better performance and reliability
      return { useBrowserTTS: true };
      
    } catch (error) {
      console.error('❌ Text-to-speech failed:', error);
      return { useBrowserTTS: true };
    }
  }
};

export default apiService;