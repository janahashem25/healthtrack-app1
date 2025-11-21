import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About HealthTrack</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-700 mb-4">
            HealthTrack is a comprehensive wellness tracking application designed to help you maintain a healthy lifestyle
            by monitoring your daily activities, meals, and exercise routines.
          </p>
          <p className="text-gray-700 mb-4">
            Our mission is to empower individuals to take control of their health and wellness journey through
            easy-to-use tracking tools and insightful analytics.
          </p>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-gray-700">
              This project was developed as part of CSCI426: Advanced Web Programming course at the Department of
              Computer Science and Information Technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;