const API_URL = 'https://healthtrack-backend.onrender.com/api';

// ===================== Token Management =====================
function getToken() {
  try {
    return localStorage.getItem('token') || '';
  } catch (error) {
    console.error('localStorage not available:', error);
    return '';
  }
}

function setToken(token) {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

function removeToken() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

// ===================== Centralized Fetch =====================
const authFetch = async (url, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${url}`, { 
      ...options, 
      headers 
    });

    // ✅ Check response status BEFORE parsing JSON
    if (!response.ok) {
      let errorMessage = 'Server error';
      
      try {
        const data = await response.json();
        errorMessage = data.error || data.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login'; // Redirect to login
        return { error: 'Session expired. Please login again.' };
      }

      return { error: errorMessage };
    }

    // ✅ Only parse JSON if response is OK
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Network error:', error);
    return { error: 'Network error. Please check your connection.' };
  }
};

// ===================== Auth APIs =====================
export const signup = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Signup failed';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }
      return { error: errorMessage };
    }

    const data = await response.json();

    if (data.token) {
      setToken(data.token);
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (e) {
        console.error('Failed to save user data:', e);
      }
    }

    return data;
  } catch (error) {
    console.error('Signup failed:', error);
    return { error: 'Network error' };
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }
      return { error: errorMessage };
    }

    const data = await response.json();

    if (data.token) {
      setToken(data.token);
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (e) {
        console.error('Failed to save user data:', e);
      }
    }

    return data;
  } catch (error) {
    console.error('Login failed:', error);
    return { error: 'Network error' };
  }
};

// ✅ Logout with server notification
export const logout = async () => {
  try {
    // Notify server to invalidate session
    await authFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    // Always clear local data
    removeToken();
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

// ✅ Verify token validity
export const verifyToken = async () => {
  const result = await authFetch('/auth/verify');
  if (result.error) {
    removeToken();
    return false;
  }
  return true;
};

// ===================== Activities APIs =====================
export const getActivities = () => authFetch('/activities');

export const createActivity = (activity) =>
  authFetch('/activities', { 
    method: 'POST', 
    body: JSON.stringify(activity) 
  });

export const updateActivity = (id, activity) =>
  authFetch(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(activity)
  });

export const deleteActivity = (id) =>
  authFetch(`/activities/${id}`, { method: 'DELETE' });

export const getStatistics = () => authFetch('/activities/stats/summary');

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};