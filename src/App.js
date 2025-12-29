import React, { useState, useEffect } from 'react';
import { Activity, Home, Info, Mail, Plus, TrendingUp, Apple, Dumbbell, Heart, Menu, X, LogOut } from 'lucide-react';
import * as api from './api/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ type: 'exercise', name: '', duration: '', calories: '', date: new Date().toISOString().split('T')[0] });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_activities: 0, total_calories: 0, total_exercise_time: 0 });

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadActivities();
      loadStatistics();
    }
  }, []);

  const loadActivities = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data.statistics || { total_activities: 0, total_calories: 0, total_exercise_time: 0 });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      let result;
      if (authMode === 'signup') {
        result = await api.signup(authForm.name, authForm.email, authForm.password);
      } else {
        result = await api.login(authForm.email, authForm.password);
      }

      if (result.user) {
        setUser(result.user);
        setAuthForm({ name: '', email: '', password: '' });
        setCurrentPage('home');
        loadActivities();
        loadStatistics();
      } else {
        setAuthError(result.message || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActivities([]);
    setStats({ total_activities: 0, total_calories: 0, total_exercise_time: 0 });
    setCurrentPage('home');
  };

  const addActivity = async () => {
    if (!newActivity.name || !newActivity.calories) return;

    try {
      const result = await api.createActivity(newActivity);
      if (result.activity) {
        await loadActivities();
        await loadStatistics();
        setNewActivity({ type: 'exercise', name: '', duration: '', calories: '', date: new Date().toISOString().split('T')[0] });
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const deleteActivity = async (id) => {
    try {
      await api.deleteActivity(id);
      await loadActivities();
      await loadStatistics();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleContactSubmit = () => {
    if (contactForm.name && contactForm.email && contactForm.message) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setContactForm({ name: '', email: '', message: '' });
      }, 3000);
    }
  };

  const pages = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'tracker', name: 'Tracker', icon: Activity },
    { id: 'about', name: 'About', icon: Info },
    { id: 'features', name: 'Features', icon: TrendingUp },
    { id: 'contact', name: 'Contact', icon: Mail }
  ];

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #9333ea, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '40px', maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Heart style={{ height: '48px', width: '48px', color: '#9333ea', margin: '0 auto 16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>HealthTrack</h1>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Your wellness companion</p>
          </div>

          {authError && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {authError}
            </div>
          )}

          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: authMode === 'login' ? '#9333ea' : '#6b7280',
                borderBottom: authMode === 'login' ? '2px solid #9333ea' : 'none',
                marginBottom: '-2px'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: authMode === 'signup' ? '#9333ea' : '#6b7280',
                borderBottom: authMode === 'signup' ? '2px solid #9333ea' : 'none',
                marginBottom: '-2px'
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Name</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  required={authMode === 'signup'}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="Your name"
                />
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
                minLength="6"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#d1d5db' : '#9333ea',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px'
              }}
            >
              {loading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <nav style={{ background: 'linear-gradient(to right, #9333ea, #2563eb)', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Heart style={{ height: '32px', width: '32px', marginRight: '8px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>HealthTrack</span>
            <span style={{ marginLeft: '16px', fontSize: '14px', opacity: 0.9 }}>Hi, {user.name}!</span>
          </div>
          
          <div style={{ display: 'none' }} className="desktop-menu">
            {pages.map(page => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    margin: '0 4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: currentPage === page.id ? 'white' : 'transparent',
                    color: currentPage === page.id ? '#9333ea' : 'white'
                  }}
                >
                  <Icon style={{ height: '16px', width: '16px', marginRight: '4px' }} />
                  {page.name}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '0 4px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              <LogOut style={{ height: '16px', width: '16px', marginRight: '4px' }} />
              Logout
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'block', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} className="mobile-menu-btn">
            {mobileMenuOpen ? <X style={{ height: '24px', width: '24px' }} /> : <Menu style={{ height: '24px', width: '24px' }} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ backgroundColor: '#7c3aed', padding: '8px' }}>
            {pages.map(page => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => { setCurrentPage(page.id); setMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px',
                    fontWeight: '500',
                    backgroundColor: currentPage === page.id ? 'white' : 'transparent',
                    color: currentPage === page.id ? '#9333ea' : 'white'
                  }}
                >
                  <Icon style={{ height: '20px', width: '20px', marginRight: '8px' }} />
                  {page.name}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              <LogOut style={{ height: '20px', width: '20px', marginRight: '8px' }} />
              Logout
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .desktop-menu { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>

      {currentPage === 'home' && (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(to bottom right, #faf5ff, #eff6ff)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Welcome to HealthTrack
              </h1>
              <p style={{ fontSize: '20px', color: '#4b5563', maxWidth: '672px', margin: '0 auto 32px' }}>
                Your personal wellness companion for tracking daily activities, meals, and exercise routines
              </p>
              <button
                onClick={() => setCurrentPage('tracker')}
                style={{
                  backgroundColor: '#9333ea',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Start Tracking Now
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '48px' }}>
              {[
                { icon: Dumbbell, title: 'Track Exercise', desc: 'Log your workouts and monitor your fitness progress', color: '#9333ea', bg: '#f3e8ff' },
                { icon: Apple, title: 'Monitor Nutrition', desc: 'Keep track of your daily meals and calorie intake', color: '#2563eb', bg: '#dbeafe' },
                { icon: TrendingUp, title: 'View Progress', desc: 'Analyze your wellness journey with detailed insights', color: '#16a34a', bg: '#dcfce7' }
              ].map((item, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', textAlign: 'center' }}>
                  <div style={{ backgroundColor: item.bg, borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <item.icon style={{ height: '32px', width: '32px', color: item.color }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#4b5563' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '48px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Today's Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Total Activities', value: stats.total_activities || 0, color: '#9333ea', bg: '#faf5ff' },
                  { label: 'Calories Burned', value: stats.total_calories || 0, color: '#2563eb', bg: '#eff6ff' },
                  { label: 'Exercise Time (min)', value: stats.total_exercise_time || 0, color: '#16a34a', bg: '#f0fdf4' }
                ].map((stat, idx) => (
                  <div key={idx} style={{ backgroundColor: stat.bg, borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#4b5563', fontSize: '14px' }}>{stat.label}</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'tracker' && (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>
              Activity Tracker
            </h1>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                <Plus style={{ height: '20px', width: '20px', marginRight: '8px' }} />
                Add New Activity
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="exercise">Exercise</option>
                  <option value="meal">Meal</option>
                </select>
                <input
                  type="text"
                  placeholder="Activity name"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={newActivity.calories}
                  onChange={(e) => setNewActivity({...newActivity, calories: e.target.value})}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
                <button
                  onClick={addActivity}
                  style={{ backgroundColor: '#9333ea', color: 'white', padding: '8px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Your Activities</h2>
              <div>
                {activities.map(activity => (
                  <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {activity.type === 'exercise' ? (
                        <Dumbbell style={{ height: '32px', width: '32px', color: '#9333ea', marginRight: '16px' }} />
                      ) : (
                        <Apple style={{ height: '32px', width: '32px', color: '#2563eb', marginRight: '16px' }} />
                      )}
                      <div>
                        <h3 style={{ fontWeight: '600' }}>{activity.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                          {activity.duration ? `${activity.duration} min • ` : ''}
                          {activity.calories} cal • {activity.date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      style={{ color: '#dc2626', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                    No activities yet. Start tracking!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'about' && (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>About HealthTrack</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              <p style={{ fontSize: '18px', color: '#374151', marginBottom: '16px' }}>
                HealthTrack is a comprehensive wellness tracking application designed to help you maintain a healthy lifestyle
                by monitoring your daily activities, meals, and exercise routines.
              </p>
              <p style={{ color: '#374151', marginBottom: '16px' }}>
                Our mission is to empower individuals to take control of their health and wellness journey through
                easy-to-use tracking tools and insightful analytics.
              </p>
              <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Our Team</h2>
                <p style={{ color: '#374151' }}>
                  This project was developed as part of CSCI426: Advanced Web Programming course at the Department of
                  Computer Science and Information Technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'features' && (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Features</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Activity Logging', desc: 'Track exercises and meals with detailed information', icon: Activity },
                { title: 'Calorie Tracking', desc: 'Monitor your daily calorie intake and expenditure', icon: TrendingUp },
                { title: 'Progress Analytics', desc: 'View your wellness journey with visual insights', icon: Heart },
                { title: 'User Authentication', desc: 'Secure login and personalized experience', icon: Home },
                { title: 'Easy to Use', desc: 'Intuitive interface for quick activity logging', icon: Plus },
                { title: 'Daily Summaries', desc: 'Get quick overview of your daily wellness metrics', icon: Info }
              ].map((feature, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                  <feature.icon style={{ height: '48px', width: '48px', color: '#9333ea', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ color: '#4b5563' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentPage === 'contact' && (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#f9fafb', padding: '32px 16px' }}>
          <div style={{ maxWidth: '672px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Contact Us</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
              {submitted && (
                <div style={{ marginBottom: '24px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '16px', borderRadius: '8px' }}>
                  Thank you! Your message has been sent successfully.
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="Your name"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="your.email@example.com"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Message</label>
                <textarea
                  rows="4"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                onClick={handleContactSubmit}
                style={{ width: '100%', backgroundColor: '#9333ea', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                Send Message
              </button>
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Get in Touch</h3>
                <div style={{ color: '#4b5563' }}>
                  <p style={{ marginBottom: '8px' }}>📧 Email: support@healthtrack.com</p>
                  <p style={{ marginBottom: '8px' }}>📱 Phone: +1 (555) 123-4567</p>
                  <p>📍 Address: Department of Computer Science, University Campus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '24px 0', marginTop: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <p>© 2025 HealthTrack - CSCI426 Advanced Web Programming Project</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            Built with React, Node.js & MySQL
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;