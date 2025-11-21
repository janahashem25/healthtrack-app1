import React from 'react';
import { Activity, Home, Info, Mail, TrendingUp, Heart, Menu, X } from 'lucide-react';

function NavBar({ currentPage, setCurrentPage, mobileMenuOpen, setMobileMenuOpen }) {
  const pages = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'tracker', name: 'Tracker', icon: Activity },
    { id: 'about', name: 'About', icon: Info },
    { id: 'features', name: 'Features', icon: TrendingUp },
    { id: 'contact', name: 'Contact', icon: Mail }
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Heart className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl">HealthTrack</span>
          </div>
          
          <div className="hidden md:block">
            <div className="flex space-x-4">
              {pages.map(page => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      currentPage === page.id ? 'bg-white text-purple-600' : 'hover:bg-purple-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {page.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {pages.map(page => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => { setCurrentPage(page.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    currentPage === page.id ? 'bg-white text-purple-600' : 'hover:bg-purple-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {page.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;