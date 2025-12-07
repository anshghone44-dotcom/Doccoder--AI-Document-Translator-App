# DocTranslate - Document Translator & Summarizer SaaS

## Overview
Professional enterprise-grade Document Translator & Summarizer SaaS application with OpenAI GPT-5 and Claude Sonnet support.

## Features ✅
- **Enterprise UI** - White + Navy + Grey palette, high-contrast design
- **Authentication** - Email/Password signup and login with JWT
- **Document Processing** - Upload PDF, DOCX, TXT files
- **AI Operations** - Translation and Summarization
- **Model Selection** - Choose between GPT-5 and Claude Sonnet
- **Dashboard** - View stats, history, and process documents
- **MongoDB Integration** - User and document management

## Current Status: DEMO MODE

The application is currently running in **DEMO MODE** with simulated AI responses. This is because the Emergent Universal Key requires specific integration setup.

### To Enable Real AI Processing:

#### Option 1: Use OpenAI API Key (Recommended)

1. Get your API key from https://platform.openai.com/api-keys

2. Update `/app/.env`:
```bash
# Replace or add:
OPENAI_API_KEY=sk-your-real-openai-key-here
```

3. Restart the server:
```bash
sudo supervisorctl restart nextjs
```

#### Option 2: Use Anthropic API Key (for Claude)

1. Get your API key from https://console.anthropic.com/

2. Update `/app/lib/ai-service.ts` to use Anthropic's SDK

3. Update `/app/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Architecture

### Frontend
- **Landing Page** (`/`) - Hero, features, how-it-works, CTA
- **Login Page** (`/login`) - User authentication
- **Signup Page** (`/signup`) - User registration  
- **Dashboard** (`/dashboard`) - Main app interface

### Backend API Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/documents/process` - Upload and process documents
- `GET /api/documents/history` - Get user's document history
- `GET /api/documents/stats` - Get usage statistics

### Database Models
- **User** - userId (UUID), email, password (hashed), name, authProvider
- **Document** - documentId (UUID), userId, fileName, fileType, content, operation, model, result, status

## Testing the App

### 1. Access the Landing Page
```
http://localhost:3000
```

### 2. Create an Account
- Click "Get Started" or "Sign Up"
- Enter name, email, and password
- You'll be automatically logged in

### 3. Process Documents
- Upload a TXT, PDF, or DOCX file
- Choose operation (Translate or Summarize)
- Select AI model (GPT-5 or Claude Sonnet)
- For translation, select target language
- Click "Process Document"

### 4. View History and Stats
- Check the "History" tab to see processed documents
- View stats cards showing totals and success rate

## API Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Process Document
```bash
TOKEN="your-jwt-token-from-login"
curl -X POST http://localhost:3000/api/documents/process \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.txt" \
  -F "operation=summarize" \
  -F "model=gpt-5"
```

### Get Stats
```bash
TOKEN="your-jwt-token-from-login"
curl -X GET http://localhost:3000/api/documents/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Environment Variables

```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017/doc-translator

# AI Keys (add your real keys)
EMERGENT_API_KEY=sk-emergent-3A59a321a3c237bA0E
OPENAI_API_KEY=  # Add your OpenAI key here

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## File Structure
```
/app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   └── documents/
│   │       ├── process/route.ts
│   │       ├── history/route.ts
│   │       └── stats/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── page.tsx (landing)
│   └── layout.tsx
├── lib/
│   ├── mongodb.ts
│   ├── ai-service.ts
│   ├── document-parser.ts
│   └── models/
│       ├── User.ts
│       └── Document.ts
├── components/ui/
└── .env
```

## Technologies Used
- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Auth**: JWT, bcryptjs
- **Document Parsing**: mammoth (DOCX), pdf-lib (PDF)
- **AI**: OpenAI SDK (when configured)

## Known Limitations in Demo Mode
- AI responses are simulated
- PDF text extraction is basic (use DOCX or TXT for best results)
- No OAuth integration yet (email/password only)

## Production Considerations
1. Add real OpenAI or Anthropic API keys
2. Change JWT_SECRET to a secure random string
3. Enable HTTPS
4. Add rate limiting
5. Implement content filtering
6. Add file size limits and validation
7. Set up proper error logging
8. Configure CORS for production domain
9. Add database backups
10. Implement OAuth (Google, GitHub)

## Support
For issues or questions about the Emergent Universal Key integration, please consult Emergent's documentation or support team.
