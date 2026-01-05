
const API_URL = 'https://lebelleshop-backend-development.up.railway.app/api/';
// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Auth APIs
export const signup = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    console.log('Signup response:', data); // Debug log
    
    if (response.ok) {
      // Handle different response formats
      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      } else if (data.message?.includes('success') || data.message?.includes('registered')) {
        // If signup successful but no token returned, try to login
        console.log('Signup successful, attempting auto-login...');
        return await login(email, password);
      } else {
        return { user: null, error: 'Signup successful but login failed. Please login manually.' };
      }
    } else {
      return { error: data.message || data.error || 'Signup failed' };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Network error. Please try again.' };
  }
};
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    console.log('Login response status:', response.status, response.ok);
    console.log('Login response data:', result);

    const token = result?.data?.token;
    const user = result?.data?.user;

    console.log('Has token?', !!token);
    console.log('Has user?', !!user);

    if (response.ok && token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } else {
      return { error: result.message || result.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Network error. Please try again.' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


// Activities APIs
export const getActivities = async () => {
  const response = await fetch(`${API_URL}/activities`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return await response.json();
};

export const createActivity = async (activity) => {
  const response = await fetch(`${API_URL}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(activity)
  });
  return await response.json();
};

export const deleteActivity = async (id) => {
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return await response.json();
};

export const getStatistics = async () => {
  const response = await fetch(`${API_URL}/activities/stats/summary`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return await response.json();
};