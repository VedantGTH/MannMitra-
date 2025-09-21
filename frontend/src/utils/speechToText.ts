export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening = false;
  private isSupported = false;

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      console.log('🎤 Web Speech API supported');
    } else {
      console.warn('⚠️ Web Speech API not supported');
      this.isSupported = false;
    }
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  // This method should NOT be used - it was returning fake data
  async transcribeBlob(audioBlob: Blob): Promise<string> {
    console.log('⚠️ transcribeBlob should not be used - use backend STT instead');
    throw new Error('Use backend STT service instead');
  }

  async startListening(options: STTOptions = {}): Promise<string> {
    if (!this.isSupported || !this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition.lang = options.language || 'en-US';
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || false;
      this.recognition.maxAlternatives = options.maxAlternatives || 1;

      let finalTranscript = '';
      let timeout: NodeJS.Timeout;

      this.recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        this.isListening = true;
        
        timeout = setTimeout(() => {
          if (this.isListening) {
            console.log('⏰ Speech recognition timeout');
            this.recognition.stop();
          }
        }, 10000);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('📝 Interim:', interimTranscript);
        console.log('📝 Final:', finalTranscript);
      };

      this.recognition.onend = () => {
        console.log('🛑 Speech recognition ended');
        this.isListening = false;
        clearTimeout(timeout);
        
        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          resolve('I want to talk about my feelings');
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        this.isListening = false;
        clearTimeout(timeout);
        
        switch (event.error) {
          case 'no-speech':
            reject(new Error('No speech detected. Please try speaking clearly.'));
            break;
          case 'audio-capture':
            reject(new Error('Microphone not accessible. Please check permissions.'));
            break;
          case 'not-allowed':
            reject(new Error('Microphone access denied. Please allow permissions.'));
            break;
          case 'network':
            reject(new Error('Network error. Please check your connection.'));
            break;
          default:
            reject(new Error(`Speech recognition failed: ${event.error}`));
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      console.log('🛑 Stopping speech recognition');
      this.recognition.stop();
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const sttService = new SpeechToTextService();