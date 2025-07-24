import React, { useState } from 'react';
import { Award, Trophy, Star, Users, CheckCircle, Gift, PartyPopper } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

const courses = [
  {
    id: 'company-culture',
    title: 'Company Culture & Values',
    description: 'Learn about our mission, vision, values, and workplace culture.',
    duration: '45 minutes',
    difficulty: 'Beginner',
    points: 100,
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
  },
  {
    id: 'security-compliance',
    title: 'Security & Compliance Training',
    description: 'Essential security protocols, data protection guidelines, and compliance requirements.',
    duration: '60 minutes',
    difficulty: 'Intermediate',
    points: 150,
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  }
];

const mockLeaderboard = [
  { name: 'Veera Raghava', points: 950, avatar: 'VR' },
  { name: 'Sai Gopal', points: 900, avatar: 'SG' },
  { name: 'Priyanka Sahu', points: 850, avatar: 'PS' },
  { name: 'Teja Bemberi', points: 800, avatar: 'TB' },
  { name: 'Jasti Puneeth', points: 750, avatar: 'JP' },
];

const mockBadges = [
  { label: 'First Step', icon: <CheckCircle className="w-6 h-6 text-green-500" />, desc: 'Completed your first onboarding step!' },
  { label: 'All Documents', icon: <Gift className="w-6 h-6 text-blue-500" />, desc: 'Uploaded all required documents.' },
  { label: 'Speedster', icon: <Trophy className="w-6 h-6 text-yellow-500" />, desc: 'Completed onboarding in record time!' },
  { label: 'Rising Star', icon: <Star className="w-6 h-6 text-purple-500" />, desc: 'Earned 800+ points.' },
];

const GamifiedInduction: React.FC<{ onComplete?: () => void; isProcessing?: boolean }> = ({ onComplete, isProcessing }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const userPoints = 1000; // Example, can be dynamic
  const maxPoints = 1000;

  const handleCelebrate = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <Card className="p-8 flex items-center justify-between bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-200">
          <div>
            <h2 className="text-3xl font-bold text-indigo-800 mb-2">Welcome to the Onboarding Challenge!</h2>
            <p className="text-gray-700">Earn points, unlock badges, and climb the leaderboard as you complete your onboarding journey.</p>
            <button
              type="button"
              onClick={() => readSelectedTextOr('Welcome to the Onboarding Challenge! Earn points, unlock badges, and climb the leaderboard as you complete your onboarding journey. Induction Courses. Your Progress. Your Badges. Leaderboard.')}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Read this section aloud"
            >
              🔊 Read Aloud
            </button>
            <button
              type="button"
              onClick={stopReading}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Stop reading aloud"
            >
              ⏹ Stop
            </button>
          </div>
          <Award className="w-16 h-16 text-indigo-400" />
        </Card>

        {/* Courses Section */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Induction Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-indigo-50 rounded-lg p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-indigo-800 mb-1">{course.title}</h4>
                  <p className="text-gray-600 mb-3">{course.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>{course.duration}</span>
                    <span>{course.difficulty}</span>
                    <span>{course.points} pts</span>
                  </div>
                </div>
                <div className="flex justify-center mt-auto">
                  <Button
                    variant="outline"
                    className="mt-2 w-full max-w-[160px]"
                    onClick={() => window.open(course.videoUrl, '_blank')}
                  >
                    Watch Video
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Points & Rewards Progress */}
        <Card className="p-6 flex flex-col items-center bg-white border-blue-100">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Your Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="h-4 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(userPoints / maxPoints) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-sm text-gray-600">
            <span>{userPoints} pts</span>
            <span>{maxPoints} pts</span>
          </div>
          <Button className="mt-4" onClick={handleCelebrate}>
            Celebrate!
          </Button>
          {showCelebration && (
            <div className="mt-4 flex flex-col items-center animate-bounce">
              <PartyPopper className="w-12 h-12 text-pink-500" />
              <span className="text-lg font-bold text-pink-600 mt-2">Congratulations!</span>
            </div>
          )}
        </Card>

        {/* Badges & Achievements */}
        <Card className="p-6 bg-white border-green-100">
          <h3 className="text-xl font-semibold text-green-700 mb-4">Your Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockBadges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center bg-green-50 rounded-lg p-4 shadow-sm">
                {badge.icon}
                <span className="mt-2 font-medium text-green-800">{badge.label}</span>
                <span className="text-xs text-gray-500 text-center mt-1">{badge.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6 bg-white border-yellow-100">
          <h3 className="text-xl font-semibold text-yellow-700 mb-4">Leaderboard</h3>
          <div className="space-y-2">
            {mockLeaderboard.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between bg-yellow-50 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center font-bold text-yellow-800 mr-3">
                    {user.avatar}
                  </div>
                  <span className="font-medium text-yellow-900">{user.name}</span>
                </div>
                <span className="font-bold text-yellow-700">{user.points} pts</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Complete Button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={() => onComplete && onComplete()}
            disabled={isProcessing}
            className="px-8"
          >
            Complete Gamified Induction
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamifiedInduction;