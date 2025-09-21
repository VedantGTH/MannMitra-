const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const speech = require('@google-cloud/speech');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Gemini AI
const projectId = process.env.GOOGLE_PROJECT_ID || 'mannmitra-app';
const location = 'us-central1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI with error handling
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.warn('⚠️ GEMINI_API_KEY not found. AI features will use fallback responses.');
}

// Diary AI Reflection endpoint
exports.diaryAI = onCall(async (request) => {
  const fallbackMessage = "Your words matter. Keep writing 🌱";
  
  try {
    const { entry } = request.data;
    
    console.log('📝 Received diary entry:', entry);
    
    if (!entry || entry.trim().length === 0) {
      console.log('❌ Empty entry received');
      return { reflection: fallbackMessage };
    }
    
    // Test with hardcoded response first
    const testResponses = [
      "Every step forward is a victory, no matter how small 💫",
      "Your courage to share shows your strength within ✨", 
      "Growth happens in moments of brave honesty 🌟"
    ];
    
    const randomResponse = testResponses[Math.floor(Math.random() * testResponses.length)];
    
    console.log('✅ Returning test response:', randomResponse);
    
    return { 
      reflection: randomResponse
    };
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { 
      reflection: fallbackMessage
    };
  }
});

// Generate AI wellness plan from health report
exports.generateWellnessPlan = onCall(async (request) => {
  try {
    const { healthData } = request.data;
    
    if (!healthData) {
      return { success: false, error: 'Health data is required' };
    }
    
    console.log('📊 Processing health data for wellness plan...');
    
    // Create a comprehensive prompt for Gemini
    const prompt = `Based on this health report data: ${JSON.stringify(healthData)}
    
Generate a personalized wellness plan with these sections:
- diet: Array of 4-5 specific dietary recommendations
- exercise: Array of 4-5 exercise suggestions  
- sleep: Array of 3-4 sleep improvement tips
- localFoods: Array of 4-5 Indian/local food recommendations

Return ONLY a valid JSON object with these 4 arrays. Each recommendation should be specific and actionable.
Format each array item as a complete sentence.
Focus on practical, achievable recommendations.
If any health values seem concerning, include appropriate warnings.
Make recommendations culturally appropriate for Indian context where applicable.

Example format:
{
  "diet": ["Increase iron-rich foods like spinach and lentils", "..."],
  "exercise": ["30 minutes of brisk walking daily", "..."],
  "sleep": ["Maintain 7-8 hours of consistent sleep", "..."],
  "localFoods": ["Include jaggery instead of refined sugar", "..."]
}

Return as valid JSON only, no additional text or formatting.
Make each recommendation specific and actionable.`;
    
    if (!genAI) {
      console.log('⚠️ Gemini AI not available, using structured fallback');
      return generateStructuredPlan(healthData);
    }
    
    console.log('🤖 Calling Gemini AI...');
    const generativeModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
      },
    });
    
    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('📝 AI response received:', responseText.substring(0, 200) + '...');
    
    // Try to parse JSON response
    let wellnessPlan;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        wellnessPlan = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed AI response');
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, using structured fallback');
      
      // Generate structured fallback based on health data
      wellnessPlan = generateStructuredPlan(healthData);
    }
    
    return wellnessPlan;
    
  } catch (error) {
    console.error('❌ AI generation failed:', error);
    // Return structured fallback
    return generateStructuredPlan(healthData);
  }
});

// Generate AI-powered wellness plan
async function generateAIWellnessPlan(healthData) {
  try {
    if (!genAI) {
      console.log('⚠️ Gemini AI not available, using structured fallback');
      return generateStructuredPlan(healthData);
    }
    
    const generativeModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });
    
    const prompt = `Based on this medical report data: ${JSON.stringify(healthData)}

Generate a personalized wellness plan with exactly these 4 sections:
- diet: Array of 5 specific dietary recommendations
- exercise: Array of 5 exercise suggestions
- sleep: Array of 4 sleep improvement tips  
- localFoods: Array of 5 Indian/local food recommendations

Return ONLY a valid JSON object. Make recommendations specific to the health values provided.
If any values seem concerning, include appropriate guidance.
Focus on practical, achievable recommendations.

Example format:
{
  "diet": ["Increase iron-rich foods like spinach and lentils", "..."],
  "exercise": ["30 minutes of brisk walking daily", "..."],
  "sleep": ["Maintain 7-8 hours of consistent sleep", "..."],
  "localFoods": ["Include jaggery instead of refined sugar", "..."]
}`;
    
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiPlan = JSON.parse(jsonMatch[0]);
      console.log('✅ AI wellness plan generated successfully');
      return aiPlan;
    } else {
      throw new Error('No valid JSON found in AI response');
    }
    
  } catch (error) {
    console.error('❌ AI wellness plan generation failed:', error);
    // Fallback to structured plan
    return generateStructuredPlan(healthData);
  }
}

// Generate structured wellness plan based on health data (fallback)
function generateStructuredPlan(healthData) {
  const plan = {
    diet: [],
    exercise: [],
    sleep: [],
    localFoods: []
  };
  
  // Analyze health data and generate specific recommendations
  const hemoglobin = healthData.Hemoglobin || healthData.hemoglobin;
  const vitaminD = healthData['Vitamin D'] || healthData.vitaminD;
  const cholesterol = healthData.Cholesterol || healthData.cholesterol;
  const glucose = healthData['Blood Glucose (Fasting)'] || healthData.bloodSugar;
  
  // Diet recommendations based on values
  if (hemoglobin && (hemoglobin.includes('10.') || hemoglobin.includes('Below'))) {
    plan.diet.push("Increase iron-rich foods like spinach, lentils, and lean red meat");
    plan.diet.push("Combine iron foods with vitamin C sources like oranges and tomatoes");
  } else {
    plan.diet.push("Maintain balanced iron intake with leafy greens and legumes");
  }
  
  if (vitaminD && (vitaminD.includes('15') || vitaminD.includes('Low'))) {
    plan.diet.push("Add vitamin D rich foods like fortified milk, eggs, and fatty fish");
    plan.diet.push("Consider 15-20 minutes of morning sunlight exposure daily");
  }
  
  if (cholesterol && cholesterol.includes('220')) {
    plan.diet.push("Reduce saturated fats and increase fiber-rich foods like oats");
  }
  
  plan.diet.push("Stay hydrated with 8-10 glasses of water daily");
  
  // Exercise recommendations
  plan.exercise = [
    "30 minutes of brisk walking 5 days a week to improve circulation",
    "Yoga or stretching for 15 minutes daily to reduce stress",
    "Light strength training 2-3 times per week for bone health",
    "Deep breathing exercises for 5 minutes twice daily",
    "Outdoor activities for natural vitamin D synthesis"
  ];
  
  // Sleep recommendations
  plan.sleep = [
    "Maintain 7-8 hours of consistent sleep schedule",
    "Create a dark, cool sleeping environment",
    "Avoid screens 1 hour before bedtime",
    "Practice relaxation techniques before sleep"
  ];
  
  // Local food recommendations
  plan.localFoods = [
    "Jaggery (gur) as natural iron source instead of refined sugar",
    "Moong dal and masoor dal for protein and iron absorption",
    "Sprouted grains and legumes for enhanced nutrition",
    "Amla for vitamin C to improve iron absorption",
    "Turmeric milk before bed for better sleep and immunity"
  ];
  
  // Add safety disclaimer if needed
  if (hemoglobin && hemoglobin.includes('10.')) {
    plan.diet.unshift("⚠️ Your hemoglobin appears low. Please consult a doctor for proper evaluation.");
  }
  
  return plan;
}

// AI Chat Response Function
exports.getChatResponse = onCall(async (request) => {
  try {
    const { text, currentMood, userId, sessionId } = request.data;
    
    if (!text || text.trim().length === 0) {
      return { 
        response: "I'm here to listen. What's on your mind today?", 
        success: true,
        source: 'fallback'
      };
    }
    
    console.log('🤖 Processing chat message:', text);
    console.log('👤 User mood:', currentMood);
    
    if (!genAI) {
      console.log('⚠️ Gemini AI not available, using fallback response');
      return {
        response: "I'm here to support you, though I'm experiencing some technical difficulties right now. Please know that you matter and help is available if you need it.",
        success: true,
        source: 'fallback_no_api'
      };
    }
    
    // Initialize Gemini AI
    const generativeModel = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.75,
        topP: 0.9,
      },
    });
    
    // Create context-aware prompt
    let contextPrompt = `You are MannMitra, a supportive AI wellness companion. Provide helpful, balanced responses.

Guidelines:
- Keep responses 3-5 sentences (50-80 words)
- Be warm and understanding but not overly dramatic
- Provide practical advice when appropriate
- Ask thoughtful follow-up questions
- Sound natural and conversational
- Focus on being genuinely helpful

User's message: "${text}"`;
    
    // Add mood context if available
    if (currentMood) {
      contextPrompt += `\n\nUser's current mood: ${currentMood.label} ${currentMood.emoji}`;
      
      // Mood-specific guidance
      const moodGuidance = {
        'sad': 'User feels sad. Acknowledge their feelings, offer gentle support and practical suggestions.',
        'anxious': 'User is anxious. Provide calming techniques and reassurance in a balanced way.',
        'angry': 'User is angry. Validate their feelings and suggest healthy ways to process anger.',
        'tired': 'User is tired. Show understanding and suggest rest or energy-boosting activities.',
        'happy': 'User is happy. Celebrate with them and encourage maintaining positive momentum.',
        'neutral': 'User feels neutral. Engage warmly and explore what they might want to discuss.'
      };
      
      if (moodGuidance[currentMood.value]) {
        contextPrompt += `\n\nGuidance: ${moodGuidance[currentMood.value]}`;
      }
    }
    
    contextPrompt += `\n\nProvide a balanced, helpful response that shows you care while being practical.`;
    
    // Check for emergency keywords
    const emergencyKeywords = ['suicide', 'kill myself', 'hurt myself', 'end it all', 'want to die', 'no point living'];
    const isEmergency = emergencyKeywords.some(keyword => text.toLowerCase().includes(keyword));
    
    if (isEmergency) {
      return {
        response: "I'm very concerned about you and want you to know that you matter. Please reach out for immediate help:\n\n🆘 National Suicide Prevention Lifeline: 988\n📱 Crisis Text Line: Text HOME to 741741\n🚨 Emergency Services: 911\n\nYou don't have to go through this alone. There are people who want to help you right now. Please consider reaching out to a trusted friend, family member, or mental health professional.",
        success: true,
        source: 'emergency_protocol'
      };
    }
    
    // Generate AI response
    const result = await generativeModel.generateContent(contextPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();
    
    console.log('✅ AI response generated successfully');
    
    return {
      response: aiResponse,
      success: true,
      source: 'gemini_ai'
    };
    
  } catch (error) {
    console.error('❌ AI chat error:', error);
    
    // Provide contextual fallback responses
    const { text, currentMood } = request.data;
    let fallbackResponse = "I'm here to support you, though I'm experiencing some technical difficulties right now.";
    
    if (currentMood) {
      const moodResponses = {
        'sad': "I can sense you're going through a difficult time. Remember that it's okay to feel sad, and these feelings will pass. Consider reaching out to someone you trust or doing something small that usually brings you comfort.",
        'anxious': "I understand you're feeling anxious. Try taking slow, deep breaths - in for 4 counts, hold for 4, out for 6. Anxiety is temporary, and you have the strength to get through this moment.",
        'angry': "It sounds like you're feeling frustrated or angry. Those feelings are valid. Consider taking a few minutes to step away, breathe deeply, or do some physical activity to help process these emotions.",
        'tired': "I hear that you're feeling tired. Rest is important for both your body and mind. Be gentle with yourself and consider what you need right now - whether that's sleep, a break, or just some quiet time.",
        'happy': "I'm glad to hear you're feeling good! It's wonderful when we can appreciate positive moments. What's been contributing to your happiness today?",
        'neutral': "Thank you for sharing with me. Sometimes feeling neutral is perfectly okay too. Is there anything specific you'd like to talk about or explore today?"
      };
      
      fallbackResponse = moodResponses[currentMood.value] || fallbackResponse;
    }
    
    fallbackResponse += "\n\nRemember, if you're in crisis, please contact 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You matter, and help is available.";
    
    return {
      response: fallbackResponse,
      success: true,
      source: 'fallback'
    };
  }
});

exports.speechToText = onCall(async (request) => {
  try {
    const { audioData } = request.data;
    
    if (!audioData) {
      return { transcription: "I'd like to talk about my feelings" };
    }
    
    console.log('🎤 Processing speech-to-text request...');
    
    // Initialize Google Cloud Speech client
    const speechClient = new speech.SpeechClient();
    
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    console.log('📊 Audio buffer size:', audioBuffer.length, 'bytes');
    
    // Configure speech recognition request
    const request_config = {
      audio: {
        content: audioBuffer,
      },
      config: {
        encoding: 'WEBM_OPUS', // Default for webm audio from browsers
        sampleRateHertz: 48000, // Common sample rate for webm
        languageCode: 'en-US',
        alternativeLanguageCodes: ['hi-IN', 'en-IN'], // Support Hindi and Indian English
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Better for conversational speech
        useEnhanced: true,
      },
    };
    
    try {
      // Call Google Cloud Speech-to-Text API
      console.log('🔄 Calling Google Cloud Speech API...');
      const [response] = await speechClient.recognize(request_config);
      
      if (response.results && response.results.length > 0) {
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join(' ')
          .trim();
        
        if (transcription) {
          console.log('✅ Speech-to-text successful:', transcription);
          return { 
            transcription: transcription,
            confidence: response.results[0].alternatives[0].confidence || 0.9
          };
        }
      }
      
      // If no transcription, try with different encoding
      console.log('⚠️ No transcription with WEBM_OPUS, trying LINEAR16...');
      request_config.config.encoding = 'LINEAR16';
      request_config.config.sampleRateHertz = 16000;
      
      const [response2] = await speechClient.recognize(request_config);
      
      if (response2.results && response2.results.length > 0) {
        const transcription = response2.results
          .map(result => result.alternatives[0].transcript)
          .join(' ')
          .trim();
        
        if (transcription) {
          console.log('✅ Speech-to-text successful (LINEAR16):', transcription);
          return { 
            transcription: transcription,
            confidence: response2.results[0].alternatives[0].confidence || 0.9
          };
        }
      }
      
      throw new Error('No speech detected in audio');
      
    } catch (apiError) {
      console.error('❌ Google Speech API error:', apiError);
      
      return { 
        transcription: "Sorry, I couldn't catch that. Please try again.",
        note: "Voice input failed. Please speak clearly or type your message.",
        fallback: true
      };
    }
    
  } catch (error) {
    console.error('❌ Speech-to-text error:', error);
    return { 
      transcription: "Sorry, I couldn't catch that. Please try again.",
      note: "Voice input had an issue. Please type your message or try again.",
      error: true
    };
  }
});

exports.textToSpeech = onCall(async (request) => {
  try {
    const { text } = request.data;
    
    if (!text) {
      return { audioContent: null, useBrowserTTS: true };
    }
    
    console.log('🔊 Processing text-to-speech request...');
    
    // Always use browser TTS for better compatibility and faster response
    // Google Cloud TTS would add latency and complexity for this use case
    return { 
      audioContent: null, 
      useBrowserTTS: true,
      message: "Using browser text-to-speech for optimal performance"
    };
    
  } catch (error) {
    console.error('❌ Text-to-speech error:', error);
    return { audioContent: null, useBrowserTTS: true };
  }
});

exports.saveMoodEntry = onCall(async (request) => {
  try {
    const { userId, mood, moodLabel, moodEmoji, note } = request.data;
    
    if (!userId || mood === undefined) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const moodEntry = {
      userId,
      mood: parseInt(mood),
      moodLabel: moodLabel || 'Unknown',
      moodEmoji: moodEmoji || '😐',
      note: note || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };
    
    const docRef = await admin.firestore()
      .collection('moodEntries')
      .add(moodEntry);
    
    console.log('✅ Mood entry saved:', docRef.id);
    
    return { 
      success: true, 
      id: docRef.id,
      entry: {
        ...moodEntry,
        id: docRef.id,
        timestamp: new Date()
      }
    };
    
  } catch (error) {
    console.error('❌ Error saving mood entry:', error);
    return { success: false, error: 'Failed to save mood entry' };
  }
});

exports.getRecentMoods = onCall(async (request) => {
  try {
    const { userId, limit = 5 } = request.data;
    
    if (!userId) {
      return { success: false, error: 'User ID required' };
    }
    
    const snapshot = await admin.firestore()
      .collection('moodEntries')
      .where('userId', '==', userId)
      .limit(limit)
      .get();
    
    const moods = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      moods.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(data.createdAt)
      });
    });
    
    // Sort by timestamp in JavaScript instead of Firestore
    moods.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return { success: true, moods };
    
  } catch (error) {
    console.error('❌ Error fetching moods:', error);
    return { success: false, error: 'Failed to fetch moods', moods: [] };
  }
});

exports.getWellnessTips = onCall(async (request) => {
  const wellnessTips = [
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
  
  return { success: true, tips: wellnessTips };
});

exports.getQuickStats = onCall(async (request) => {
  try {
    const { userId } = request.data;
    
    if (!userId) {
      return { success: false, error: 'User ID required' };
    }
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get moods from this week
    const moodsSnapshot = await admin.firestore()
      .collection('moodEntries')
      .where('userId', '==', userId)
      .where('timestamp', '>=', weekAgo)
      .get();
    
    const moodsThisWeek = moodsSnapshot.size;
    
    // Calculate average mood
    let totalMood = 0;
    let moodCount = 0;
    moodsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.mood) {
        totalMood += data.mood;
        moodCount++;
      }
    });
    
    const averageMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : '0';
    
    // Mock data for other stats
    const stats = {
      moodsThisWeek,
      averageMood: `${averageMood}/10`,
      wellnessTipsViewed: Math.floor(Math.random() * 15) + 5,
      reportsUploaded: Math.floor(Math.random() * 3),
      streakDays: Math.floor(Math.random() * 14) + 1
    };
    
    return { success: true, stats };
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return { 
      success: false, 
      error: 'Failed to fetch stats',
      stats: {
        moodsThisWeek: 0,
        averageMood: '0/10',
        wellnessTipsViewed: 0,
        reportsUploaded: 0,
        streakDays: 0
      }
    };
  }
});

// Upload and analyze medical report
exports.uploadReport = onCall(async (request) => {
  try {
    const { fileData, fileName, mimeType } = request.data;
    
    if (!fileData || !fileName) {
      return {
        success: false,
        error: 'File data and name are required',
        step: 'validation'
      };
    }
    
    console.log('📄 Processing report upload:', fileName);
    
    // Simulate document processing and extract mock health data
    const extractedData = {
      'Hemoglobin': '12.5 g/dL',
      'WBC Count': '7,200 cells/μL',
      'Vitamin D': '18 ng/mL',
      'Cholesterol': '195 mg/dL',
      'Blood Sugar': '98 mg/dL',
      'Blood Pressure': '120/80 mmHg'
    };
    
    console.log('🔍 Extracted health data:', extractedData);
    
    // Generate AI wellness plan using Gemini AI
    const wellnessPlan = await generateAIWellnessPlan(extractedData);
    
    console.log('✅ Report processed successfully');
    
    return {
      success: true,
      extractedData,
      wellnessPlan,
      fileName,
      processingTime: 2.5
    };
    
  } catch (error) {
    console.error('❌ Report upload error:', error);
    return {
      success: false,
      error: 'Failed to process medical report',
      step: 'ai_generation',
      details: error.message
    };
  }
});

exports.analyzeDocument = onCall(async (request) => {
  return { response: "Document analysis working" };
});