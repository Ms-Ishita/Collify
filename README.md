# 📚 Collify — Modern Classroom & Testing Platform

<div align="center">

  <h1>🎓 Collify</h1>
  <p>
    <strong>Next-Generation EdTech & Classroom Workspace</strong><br />
    Smart Classrooms • AI-Powered Quiz Generation • Automated Grading • Real-time Attendance • Cloud Learning Materials
  </p>

  <p>
    <a href="https://github.com/Ms-Ishita/Collify/stargazers">
      <img src="https://img.shields.io/github/stars/Ms-Ishita/Collify?style=for-the-badge&color=7c3aed" alt="Stars" />
    </a>
    <a href="https://github.com/Ms-Ishita/Collify/network/members">
      <img src="https://img.shields.io/github/forks/Ms-Ishita/Collify?style=for-the-badge&color=6366f1" alt="Forks" />
    </a>
    <a href="https://github.com/Ms-Ishita/Collify/issues">
      <img src="https://img.shields.io/github/issues/Ms-Ishita/Collify?style=for-the-badge&color=06b6d4" alt="Issues" />
    </a>
    <a href="https://github.com/Ms-Ishita/Collify/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License" />
    </a>
  </p>

</div>

---

## 🌟 Overview

**Collify** is an all-in-one EdTech and classroom platform inspired by Google Classroom, engineered to elevate modern education. It seamlessly bridges teachers and students with smart course feeds, automated instant MCQ evaluations, class analytics leaderboards, attendance tracking, and **Google Gemini AI quiz authoring**.

---

## ✨ Key Features

### 👨‍🏫 For Teachers
- 🏫 **Classroom Creation:** Instantly spin up virtual classrooms with unique 6-character join codes.
- 🤖 **AI-Assisted Quiz Generation:** Generate comprehensive MCQ assessments in seconds using Google Gemini (`@google/genai`) by providing topic, question count (1–15), and difficulty (*Easy, Medium, Hard*).
- ✍️ **Manual Quiz Authoring:** Full question drafting with options, point values, answer keys, and explanations.
- 🏆 **Classroom Leaderboard & Analytics:** View ranked submission reports, class average percentage, top scores, and inspect individual student answers.
- 📅 **Daily Attendance Roster:** Mark student presence with single-click status toggles (`Present`, `Late`, `Absent`), "Mark All Present" shortcut, and historical logs.
- 📁 **Rich Material & Announcement Feeds:** Publish notices, upload study PDFs directly to Cloudinary (up to 10MB), and share Google Meet links.

### 👨‍🎓 For Students
- 🔑 **Simple Code Enrollment:** Join any classroom using a 6-character code.
- ⏱️ **Interactive Quiz Attempts:** Timed MCQ assessments with live countdown timers, question navigator grids, and auto-submit on timeout.
- 📊 **Instant Score & Exam Reports:** Circular score gauges, breakdown of correct vs. wrong answers, and pedagogical explanations for every question.
- 📈 **Personal Attendance Dashboard:** Circular attendance meter, alert notifications (e.g. `< 75%` warning), and session history.
- 💻 **Resource Access:** Download lecture notes, review class announcements, and launch Google Meet video calls with one click.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | **Next.js 14+ (App Router)** | Server & Client Components, React 19, Lucide Icons |
| **Styling** | **CSS Modules & Pure CSS** | Premium dark theme, glassmorphism, responsive design |
| **Backend** | **Node.js & Express.js** | RESTful modular routing, error handling, CORS |
| **Database** | **MongoDB Atlas & Mongoose** | Document modeling, compound indexes, pre-save hooks |
| **Authentication** | **JWT & bcryptjs** | Secure stateless token authentication & password encryption |
| **AI Integration** | **Google GenAI SDK** | `@google/genai` (Gemini 2.0 / 3.8 Flash models) |
| **File Storage** | **Multer & Cloudinary** | Cloud-based PDF document upload & streaming |

---

## 📁 Repository Structure

```
Collify/
├── backend/
│   ├── config/             # Database connection (MongoDB Atlas)
│   ├── middleware/         # Auth verification & Cloudinary Multer upload
│   ├── models/             # Mongoose schemas (User, Classroom, Quiz, Question, Attempt, Post, Attendance)
│   ├── routes/             # Express API routes (auth, classroom, quiz, attempt, post, attendance)
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Server entry point & CORS configuration
│
├── frontend/
│   └── my-app/
│       ├── public/         # Static assets
│       ├── src/
│       │   ├── app/        # Next.js App Router (dashboard, classrooms, quiz attempt & results)
│       │   └── components/ # Reusable UI components (Navbar, Tabs, PostForm, etc.)
│       ├── package.json    # Frontend dependencies
│       └── next.config.mjs # Next.js configuration
│
├── .gitignore              # Git ignore rules for node_modules, .env, and build files
└── README.md               # Project documentation
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB instance)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- **Cloudinary** account (optional for PDF uploads)

---

### 2. Clone the Repository
```bash
git clone https://github.com/Ms-Ishita/Collify.git
cd Collify
```

---

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (refer to `.env.example`):
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collify?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend development server:
```bash
npm start
```
*Backend runs on `http://localhost:5000`.*

---

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend/my-app
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

Open your browser and navigate to `http://localhost:3000`.

---

## 🔒 Security Best Practices
- **No Secrets in Repo:** Sensitive environment variables (`.env`) are strictly ignored via `.gitignore`.
- **Role-Based Protection:** Protected endpoints verify teacher permissions before enabling quiz creation, post deletion, or grading.
- **Answer Key Masking:** Quiz attempt initiation strips answer keys from response payloads to prevent client-side answer sniffing.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Ms-Ishita/Collify/issues).

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
