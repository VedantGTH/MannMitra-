export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeVoices();
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      // Get voices immediately if available
      this.voices = this.synthesis.getVoices();
      
      if (this.voices.length > 0) {
        this.isInitialized = true;
        console.log('🔊 TTS voices loaded:', this.voices.length);
        resolve();
      } else {
        // Wait for voices to load
        const handleVoicesChanged = () => {
          this.voices = this.synthesis.getVoices();
          if (this.voices.length > 0) {
            this.isInitialized = true;
            console.log('🔊 TTS voices loaded:', this.voices.length);
            this.synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            resolve();
          }
        };
        
        this.synthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Fallback timeout
        setTimeout(() => {
          if (!this.isInitialized) {
            this.isInitialized = true;
            console.log('🔊 TTS initialized without voices');
            resolve();
          }
        }, 2000);
      }
    });
  }

  private selectBestVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;
    
    // Priority order for mental health context
    const preferences = [
      // Female voices (more empathetic for mental health)
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('woman'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('susan')),
      // High quality voices
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('enhanced'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('premium'),
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'),
      // Local voices (better quality)
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.localService,
      // Any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      // Fallback to any voice
      () => true
    ];
    
    for (const preference of preferences) {
      const voice = this.voices.find(preference);
      if (voice) {
        console.log('🔊 Selected voice:', voice.name, voice.lang);
        return voice;
      }
    }
    
    return this.voices[0] || null;
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    // Ensure voices are initialized
    if (!this.isInitialized) {
      await this.initializeVoices();
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Stop any current speech
        this.stop();
        
        // Clean text for better speech
        const cleanText = text
          .replace(/[*_~`]/g, '') // Remove markdown
          .replace(/\n+/g, '. ') // Replace newlines with pauses
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (!cleanText) {
          resolve();
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        this.currentUtterance = utterance;
        
        // Set empathetic speech parameters
        utterance.rate = options.rate || 0.85; // Slightly slower for empathy
        utterance.pitch = options.pitch || 1.0; // Natural pitch
        utterance.volume = options.volume || 0.9; // Slightly softer
        
        // Select best voice
        const selectedVoice = options.voice || this.selectBestVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Speech started:', cleanText.substring(0, 50));
        };
        
        utterance.onend = () => {
          console.log('🔊 Speech completed');
          this.currentUtterance = null;
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event.error);
          this.currentUtterance = null;
          
          // Don't reject for common errors, just resolve
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
          } else {
            reject(new Error(`Speech synthesis failed: ${event.error}`));
          }
        };
        
        // Handle browser-specific issues
        utterance.onpause = () => {
          console.log('⏸️ Speech paused');
        };
        
        utterance.onresume = () => {
          console.log('▶️ Speech resumed');
        };
        
        // Start speaking
        console.log('🔊 Starting speech synthesis...');
        this.synthesis.speak(utterance);
        
        // Fallback timeout for stuck synthesis
        setTimeout(() => {
          if (this.currentUtterance === utterance && this.synthesis.speaking) {
            console.warn('⚠️ Speech synthesis timeout, stopping...');
            this.stop();
            resolve();
          }
        }, 30000); // 30 second timeout
        
      } catch (error) {
        console.error('❌ TTS setup error:', error);
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.synthesis.speaking || this.synthesis.pending) {
      console.log('🔇 Stopping speech synthesis');
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  isSupported(): boolean {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  // Test speech synthesis
  async test(): Promise<boolean> {
    try {
      await this.speak('Test', { rate: 1.5, volume: 0.1 });
      return true;
    } catch (error) {
      console.error('❌ TTS test failed:', error);
      return false;
    }
  }
}

export const ttsService = new TextToSpeechService();