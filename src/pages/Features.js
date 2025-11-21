import React from 'react';
import { Activity, TrendingUp, Heart, Home as HomeIcon, Plus, Info } from 'lucide-react';

function Features() {
  const features = [
    { title: 'Activity Logging', desc: 'Track exercises and meals with detailed information', icon: Activity },
    { title: 'Calorie Tracking', desc: 'Monitor your daily calorie intake and expenditure', icon: TrendingUp },
    { title: 'Progress Analytics', desc: 'View your wellness journey with visual insights', icon: Heart },
    { title: 'Responsive Design', desc: 'Access your data on any device, anywhere', icon: HomeIcon },
    { title: 'Easy to Use', desc: 'Intuitive interface for quick activity logging', icon: Plus },
    { title: 'Daily Summaries', desc: 'Get quick overview of your daily wellness metrics', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Features</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <Icon className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Features;