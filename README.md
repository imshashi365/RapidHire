# 🧠 AI Interviewer SaaS – Smart Screening for Hiring Agencies

An AI-powered screening interview platform built using the **MERN stack** (MongoDB, Express.js, React, Node.js). Designed specifically for hiring agencies to automate and streamline the candidate pre-screening process.

**Test Credentials**

**Candidate:**
Email: shashi@gmail.com
Password: 123

**Company**
Email: RapidHire@gmail.com
Password: 123


## 🚀 Features

### 🎯 For Companies:
- Upload candidate **resumes** and add **custom interview questions**.
- AI automatically:
  - Analyzes the resume.
  - Generates follow-up questions based on candidate profile.
- Generate a **unique interview link** to share with the candidate.
- View:
  - **Recorded video and audio** of candidate’s response.
  - **AI-generated score out of 100** based on:
    - Grammar
    - Speaking clarity
    - Accuracy & relevance of answers
- Shortlist candidates for **manual interviews**.

### 👤 For Candidates:
- Use the unique link to join and complete the **15-minute AI interview**.
- Record answers directly via webcam and microphone.
- Seamless and intuitive interview experience.

### 🔐 Authentication:
- **Two-role login system**:
  - Company
  - Candidate

## 🛠 Tech Stack

| Tech         | Description                  |
|--------------|------------------------------|
| MongoDB      | Database                     |
| Express.js   | Backend framework            |
| React        | Frontend framework           |
| Node.js      | Runtime environment          |
| WebRTC       | Video/audio recording        |
| OpenAI API / NLP Models | Resume analysis, question generation, scoring logic |


## 🧪 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/imshashi365/RapidHire/
   cd RapidHire
2. **Install dependencies**
   npm install


**Environment Variables**

**Database**
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/your_db?retryWrites=true&w=majority

**Clerk Authentication (Frontend)**
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

**Clerk Authentication (Backend)**
CLERK_SECRET_KEY=your_clerk_secret_key

**NextAuth (if used)**
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

**AI & Speech APIs**
OPENAI_API_KEY=sk-your_openai_api_key
ELEVEN_LABS_API_KEY=sk-your_elevenlabs_api_key
TOGETHER_API_KEY=your_together_ai_api_key

**AWS (for audio/video storage)**
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name

**VAPI (Video/Audio API)**
NEXT_PUBLIC_VAPI_KEY=your_vapi_public_key
VAPI_KEY=your_vapi_secret_key

🧠 **Future Improvements**
1. Integration with cloud storage (AWS S3 / Firebase)
2. Multi-language support
3. Custom AI models for industry-specific interviews
4. Analytics dashboard for company HRs

📄 **License**
This project is licensed under the MIT License

