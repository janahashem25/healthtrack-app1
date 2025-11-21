import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tracker from './pages/Tracker';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState([
    { id: 1, type: 'exercise', name: 'Morning Run', duration: 30, calories: 300, date: '2024-11-18' },
    { id: 2, type: 'meal', name: 'Breakfast', calories: 450, date: '2024-11-18' }
  ]);
  const [newActivity, setNewActivity] = useState({ type: 'exercise', name: '', duration: '', calories: '' });

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} activities={activities} />}
      {currentPage === 'tracker' && (
        <Tracker 
          activities={activities}
          setActivities={setActivities}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
        />
      )}
      {currentPage === 'about' && <About />}
      {currentPage === 'features' && <Features />}
      {currentPage === 'contact' && <Contact />}
      
      <Footer />
    </div>
  );
}


export default App;