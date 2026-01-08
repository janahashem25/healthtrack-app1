const API_URL = 'https://healthtrack-backend-t2xk.onrender.com/api';

const getToken = () => localStorage.getItem('token');

const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

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

export const logout = () => {
  clearAuth();
};

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
      const activities = data.data.activities.map(activity => ({
        id: activity.id,
        type: 'exercise',
        name: activity.title,
        duration: '',
        calories: '',
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

export const createActivity = async (activityData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

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
      const stats = {
        total_activities: data.data.statistics.total_activities || 0,
        total_calories: 0,
        total_exercise_time: 0,
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