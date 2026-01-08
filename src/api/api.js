// src/api/api.js

const API_URL = 'https://healthtrack-backend-t2xk.onrender.com/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Save token and user to localStorage
const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data
const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Signup
export const signup = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.status === 'success') {
      saveAuth(data.data.token, data.data.user);
      return { user: data.data.user };
    } else {
      return { message: data.message };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { message: 'Server error. Please try again.' };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.status === 'success') {
      saveAuth(data.data.token, data.data.user);
      return { user: data.data.user };
    } else {
      return { message: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { message: 'Server error. Please try again.' };
  }
};

// Logout
export const logout = () => {
  clearAuth();
};

// Get Activities
export const getActivities = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/activities`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.status === 'success') {
      // Map backend format to frontend format
      const activities = data.data.activities.map(activity => ({
        id: activity.id,
        type: 'exercise', // Default type since backend doesn't have type
        name: activity.title,
        duration: '', // Backend doesn't have duration
        calories: '', // Backend doesn't have calories
        date: activity.created_at ? new Date(activity.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: activity.description,
        created_at: activity.created_at
      }));

      return { activities };
    } else {
      return { activities: [] };
    }
  } catch (error) {
    console.error('Get activities error:', error);
    return { activities: [] };
  }
};

// Create Activity
export const createActivity = async (activityData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    // Map frontend format to backend format
    const backendData = {
      title: activityData.name,
      description: `${activityData.type} - ${activityData.duration ? activityData.duration + ' min - ' : ''}${activityData.calories} cal`
    };

    const response = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      return { activity: data.data.activity };
    } else {
      return { message: data.message };
    }
  } catch (error) {
    console.error('Create activity error:', error);
    return { message: 'Server error. Please try again.' };
  }
};

// Delete Activity
export const deleteActivity = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.status === 'success') {
      return { success: true };
    } else {
      return { message: data.message };
    }
  } catch (error) {
    console.error('Delete activity error:', error);
    return { message: 'Server error. Please try again.' };
  }
};

// Get Statistics
export const getStatistics = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/activities/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.status === 'success') {
      // Map backend statistics to frontend format
      const stats = {
        total_activities: data.data.statistics.total_activities || 0,
        total_calories: 0, // Backend doesn't track this, would need to calculate
        total_exercise_time: 0, // Backend doesn't track this, would need to calculate
        activities_today: data.data.statistics.activities_today || 0,
        activities_this_week: data.data.statistics.activities_this_week || 0,
        activities_this_month: data.data.statistics.activities_this_month || 0
      };

      return { statistics: stats };
    } else {
      return { statistics: { total_activities: 0, total_calories: 0, total_exercise_time: 0 } };
    }
  } catch (error) {
    console.error('Get statistics error:', error);
    return { statistics: { total_activities: 0, total_calories: 0, total_exercise_time: 0 } };
  }
};