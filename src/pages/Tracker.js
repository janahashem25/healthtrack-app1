import React from 'react';
import { Plus, Dumbbell, Apple } from 'lucide-react';

function Tracker({ activities, setActivities, newActivity, setNewActivity }) {
  const addActivity = () => {
    if (newActivity.name && newActivity.calories) {
      setActivities([...activities, { 
        ...newActivity, 
        id: Date.now(), 
        date: new Date().toISOString().split('T')[0],
        duration: newActivity.duration || 0
      }]);
      setNewActivity({ type: 'exercise', name: '', duration: '', calories: '' });
    }
  };

  const deleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Tracker</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={newActivity.type}
              onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="exercise">Exercise</option>
              <option value="meal">Meal</option>
            </select>
            <input
              type="text"
              placeholder="Activity name"
              value={newActivity.name}
              onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={newActivity.duration}
              onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Calories"
              value={newActivity.calories}
              onChange={(e) => setNewActivity({...newActivity, calories: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button
              onClick={addActivity}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Activities</h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex items-center">
                  {activity.type === 'exercise' ? (
                    <Dumbbell className="h-8 w-8 text-purple-600 mr-4" />
                  ) : (
                    <Apple className="h-8 w-8 text-blue-600 mr-4" />
                  )}
                  <div>
                    <h3 className="font-semibold">{activity.name}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.duration && `${activity.duration} min • `}
                      {activity.calories} cal • {activity.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Delete
                </button>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-center text-gray-500 py-8">No activities yet. Start tracking!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracker;