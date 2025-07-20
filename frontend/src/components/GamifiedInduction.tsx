import React, { useState, useEffect } from 'react';
import { Award, Play, CheckCircle, Clock, Star, Trophy, Target, BookOpen, Users, Shield } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import ProgressBar from './ProgressBar';

interface GamifiedInductionProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  completed: boolean;
  progress: number;
  modules: string[];
  estimatedTime: string;
}

const GamifiedInduction: React.FC<GamifiedInductionProps> = ({ onComplete, isProcessing }) => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'company-culture',
      title: 'Company Culture & Values',
      description: 'Learn about our mission, vision, values, and workplace culture. Understand what makes our company unique and how you can contribute to our success.',
      duration: '45 minutes',
      difficulty: 'Beginner',
      points: 100,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      completed: false,
      progress: 0,
      modules: [
        'Company History & Mission',
        'Core Values & Principles',
        'Workplace Culture',
        'Diversity & Inclusion',
        'Success Stories'
      ],
      estimatedTime: '45 min'
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance Training',
      description: 'Essential security protocols, data protection guidelines, and compliance requirements. Learn to protect company and customer data.',
      duration: '60 minutes',
      difficulty: 'Intermediate',
      points: 150,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      completed: false,
      progress: 0,
      modules: [
        'Information Security Basics',
        'Password Management',
        'Phishing & Social Engineering',
        'Data Protection & GDPR',
        'Incident Reporting'
      ],
      estimatedTime: '60 min'
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);

  const startCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course && !course.completed) {
      setSelectedCourse(course);
      simulateCourseProgress(courseId);
    }
  };

  const simulateCourseProgress = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Simulate course progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, progress } : c
      ));
    }

    // Mark as completed
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, completed: true, progress: 100 } : c
    ));

    setTotalPoints(prev => prev + course.points);
    setCompletedCourses(prev => prev + 1);
    setSelectedCourse(null);

    // Check if all courses completed
    const updatedCourses = courses.map(c => 
      c.id === courseId ? { ...c, completed: true } : c
    );
    
    if (updatedCourses.every(c => c.completed)) {
      setShowCongratulations(true);
      setTimeout(() => {
        setShowCongratulations(false);
      }, 3000);
    }
  };

  const allCoursesCompleted = courses.every(course => course.completed);
  const overallProgress = (completedCourses / courses.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-100';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'Advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gamified Induction Program
        </h2>
        <p className="text-gray-600">
          Complete mandatory courses to unlock your full potential and earn rewards
        </p>
      </div>

      {/* Congratulations Modal */}
      {showCongratulations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
            <p className="text-gray-600 mb-4">
              You've completed all mandatory courses and earned {totalPoints} points!
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">Induction Champion</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">{totalPoints} Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900">{completedCourses}/{courses.length} Completed</span>
            </div>
          </div>
        </div>
        
        <ProgressBar progress={overallProgress} className="mb-4" />
        <p className="text-sm text-gray-600">
          {Math.round(overallProgress)}% complete • {courses.length - completedCourses} courses remaining
        </p>
      </Card>

      {/* Course Selection */}
      {!selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className={`p-6 transition-all duration-200 hover:shadow-lg ${
              course.completed ? 'ring-2 ring-green-200 bg-green-50' : 'hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${course.bgColor}`}>
                  <course.icon className={`w-6 h-6 ${course.color}`} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  {course.completed && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{course.points} points</span>
                  </div>
                </div>

                {course.progress > 0 && !course.completed && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{course.progress}%</span>
                    </div>
                    <ProgressBar progress={course.progress} />
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-900">Course Modules:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {course.modules.slice(0, 3).map((module, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span>{module}</span>
                    </li>
                  ))}
                  {course.modules.length > 3 && (
                    <li className="text-gray-500 text-xs">+{course.modules.length - 3} more modules</li>
                  )}
                </ul>
              </div>

              <Button
                onClick={() => startCourse(course.id)}
                disabled={course.completed || course.progress > 0}
                className={`w-full ${course.completed ? 'bg-green-600' : ''}`}
                variant={course.completed ? 'primary' : 'primary'}
              >
                {course.completed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : course.progress > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    In Progress...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Course
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Course Player */}
      {selectedCourse && (
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${selectedCourse.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <selectedCourse.icon className={`w-8 h-8 ${selectedCourse.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h3>
            <p className="text-gray-600">{selectedCourse.description}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 mb-6 text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-white text-lg font-semibold mb-2">Course in Progress</h4>
              <p className="text-gray-300 text-sm">Learning modules are being processed...</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Course Progress</span>
                <span className="text-gray-900">{selectedCourse.progress}%</span>
              </div>
              <ProgressBar progress={selectedCourse.progress} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{selectedCourse.modules.length} Modules</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{selectedCourse.points} Points</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Complete Induction */}
      {allCoursesCompleted && (
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Induction Complete! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              Congratulations! You've successfully completed all mandatory courses and earned {totalPoints} points.
              You're now ready to start your journey with us!
            </p>
            
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedCourses}</div>
                <div className="text-sm text-gray-600">Courses Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>

            <Button
              onClick={() => onComplete({ 
                coursesCompleted: completedCourses, 
                totalPoints, 
                completedAt: new Date().toISOString() 
              })}
              disabled={isProcessing}
              size="lg"
              className="px-8"
            >
              {isProcessing ? 'Processing...' : 'Complete Onboarding Journey'}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GamifiedInduction;