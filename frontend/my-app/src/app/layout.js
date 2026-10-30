import './globals.css';

export const metadata = {
  title: 'Collify - Modern Classroom & Testing Platform',
  description: 'Modern Classroom & Testing Platform for collaborative learning, AI-powered quizzes, and instant grading.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

