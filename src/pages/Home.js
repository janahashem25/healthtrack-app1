import React from 'react';
import { Dumbbell, Apple, TrendingUp } from 'lucide-react';

function Home({ setCurrentPage, activities }) {
  const totalCalories = activities.reduce((sum, a) => sum + Number(a.calories), 0);
  const exerciseTime = activities.filter(a => a.type === 'exercise').reduce((sum, a) => sum + Number(a.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome to HealthTrack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal wellness companion for tracking daily activities, meals, and exercise routines
          </p>
          <button
            onClick={() => setCurrentPage('tracker')}
            className="mt-8 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Tracking Now
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Exercise</h3>
            <p className="text-gray-600">Log your workouts and monitor your fitness progress</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Apple className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Monitor Nutrition</h3>
            <p className="text-gray-600">Keep track of your daily meals and calorie intake</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Progress</h3>
            <p className="text-gray-600">Analyze your wellness journey with detailed insights</p>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Total Activities</p>
              <p className="text-3xl font-bold text-purple-600">{activities.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Calories Burned</p>
              <p className="text-3xl font-bold text-blue-600">{totalCalories}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Exercise Time (min)</p>
              <p className="text-3xl font-bold text-green-600">{exerciseTime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;