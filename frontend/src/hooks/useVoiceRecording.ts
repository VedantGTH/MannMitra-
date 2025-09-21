import { useState, useRef, useCallback } from 'react';

export interface VoiceRecordingHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  isSupported: boolean;
}

export const useVoiceRecording = (): VoiceRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if voice recording is supported
  const isSupported = typeof navigator !== 'undefined' && 
    typeof window !== 'undefined' && 
    !!navigator.mediaDevices && 
    !!navigator.mediaDevices.getUserMedia && 
    typeof (window as any).MediaRecorder !== 'undefined';

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in this browser');
      return;
    }

    try {
      setError(null);
      console.log('🎤 Starting voice recording...');
      
      // Request microphone with optimal settings for speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Determine best audio format with priority for Google Cloud Speech compatibility
      let mimeType = 'audio/webm;codecs=opus'; // Best for Google Cloud Speech
      let recordingOptions: MediaRecorderOptions = { mimeType };
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log('⚠️ WEBM/Opus not supported, trying alternatives...');
        
        const alternatives = [
          'audio/webm',
          'audio/mp4',
          'audio/wav',
          'audio/ogg;codecs=opus'
        ];
        
        let foundFormat = false;
        for (const alt of alternatives) {
          if (MediaRecorder.isTypeSupported(alt)) {
            recordingOptions = { mimeType: alt };
            console.log('✅ Using audio format:', alt);
            foundFormat = true;
            break;
          }
        }
        
        if (!foundFormat) {
          console.log('⚠️ Using default audio format');
          recordingOptions = {};
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, recordingOptions);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('📊 Audio chunk:', event.data.size, 'bytes, type:', event.data.type);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
      };
      
      mediaRecorder.onstart = () => {
        console.log('✅ Recording started with format:', mediaRecorder.mimeType);
        setIsRecording(true);
      };
      
      // Start recording with smaller chunks for better responsiveness
      mediaRecorder.start(250); // Collect data every 250ms
      mediaRecorderRef.current = mediaRecorder;
      
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Microphone access denied. Please allow microphone permissions and refresh the page.');
            break;
          case 'NotFoundError':
            setError('No microphone found. Please connect a microphone and try again.');
            break;
          case 'NotReadableError':
            setError('Microphone is being used by another application. Please close other apps and try again.');
            break;
          case 'OverconstrainedError':
            setError('Microphone settings not supported. Trying with basic settings...');
            // Retry with basic settings
            setTimeout(() => startRecordingBasic(), 1000);
            return;
          default:
            setError('Failed to access microphone. Please check your browser settings.');
        }
      } else {
        setError('Unknown error occurred while accessing microphone.');
      }
      
      setIsRecording(false);
    }
  }, [isSupported]);
  
  // Fallback recording with basic settings
  const startRecordingBasic = useCallback(async () => {
    try {
      console.log('🔄 Retrying with basic audio settings...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true // Basic audio constraints
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log('✅ Basic recording started');
        setIsRecording(true);
        setError(null);
      };
      
      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
      
    } catch (basicError) {
      console.error('❌ Basic recording also failed:', basicError);
      setError('Unable to access microphone. Please check browser permissions.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      const stream = streamRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        console.log('⚠️ No active recording to stop');
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped');
        
        if (chunksRef.current.length === 0) {
          console.warn('⚠️ No audio data recorded');
          setError('No audio was recorded. Please try speaking louder or check your microphone.');
          resolve(null);
          return;
        }
        
        // Create blob with proper MIME type
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        console.log('🎤 Audio blob created:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: chunksRef.current.length
        });
        
        // Validate audio blob size
        if (audioBlob.size < 1000) { // Less than 1KB is likely empty
          console.warn('⚠️ Audio blob too small:', audioBlob.size, 'bytes');
          setError('Recording too short or quiet. Please try speaking for at least 2 seconds.');
          resolve(null);
          return;
        }
        
        // Clean up resources
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('🔇 Audio track stopped');
          });
        }
        
        setIsRecording(false);
        mediaRecorderRef.current = null;
        streamRef.current = null;
        setError(null); // Clear any previous errors
        
        resolve(audioBlob);
      };

      console.log('🛑 Stopping recording...');
      try {
        mediaRecorder.stop();
      } catch (stopError) {
        console.error('❌ Error stopping recording:', stopError);
        setIsRecording(false);
        resolve(null);
      }
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    isSupported
  };
};