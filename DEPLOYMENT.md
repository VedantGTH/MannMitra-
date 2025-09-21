# 🚀 MannMitra+ Deployment Guide

## Quick Deploy

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Google Cloud Project with APIs enabled
- Node.js 18+

### 1. Setup Environment
```bash
# Clone and install
git clone <your-repo-url>
cd mannmitra-plus
cd frontend && npm install
cd ../functions && npm install
```

### 2. Configure Firebase
```bash
# Login to Firebase
firebase login

# Set project (replace with your project ID)
firebase use your-project-id
```

### 3. Environment Variables
```bash
# Copy environment template
cp functions/.env.example functions/.env

# Edit functions/.env with your keys:
# GEMINI_API_KEY=your-key
# GOOGLE_PROJECT_ID=your-project-id
```

### 4. Deploy
```bash
# Build frontend
cd frontend && npm run build

# Deploy everything
cd .. && firebase deploy

# Or deploy separately
firebase deploy --only functions
firebase deploy --only hosting
```

## 🔧 Required Google Cloud APIs

Enable these in Google Cloud Console:
- Cloud Functions API
- Cloud Speech-to-Text API  
- Generative AI API
- Document AI API
- Cloud Storage API

## 🌐 Custom Domain (Optional)

```bash
# Add custom domain in Firebase Console
firebase hosting:channel:deploy live --expires 30d
```

## 📊 Monitoring

- **Firebase Console**: Monitor functions and hosting
- **Google Cloud Console**: Check API usage and quotas
- **Analytics**: Track user engagement

## 🔒 Security

- Keep API keys secure in environment variables
- Review Firestore security rules
- Monitor usage to prevent quota overruns

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (18+)
2. **Functions timeout**: Increase timeout in firebase.json
3. **API quota exceeded**: Check Google Cloud quotas
4. **CORS errors**: Verify Firebase hosting configuration

### Logs:
```bash
# View function logs
firebase functions:log

# View hosting logs  
firebase hosting:channel:list
```

## 📈 Scaling

- **Functions**: Auto-scale based on usage
- **Hosting**: Global CDN included
- **Database**: Firestore scales automatically
- **APIs**: Monitor quotas and upgrade as needed

---

**🎉 Your MannMitra+ app is now live and helping users!**