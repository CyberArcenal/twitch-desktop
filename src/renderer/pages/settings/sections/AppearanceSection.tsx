// sections/AppearanceSection.tsx
import React from 'react';
const AppearanceSection: React.FC = () => (
  <div className="max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold text-white">Appearance</h1>
    <p className="text-sm text-[#adadb8] mt-1">Theme and visual preferences</p>
    <div className="mt-6 p-6 bg-[#1f1f23] rounded-xl text-center text-[#adadb8]">
      Theme switcher and appearance settings will appear here.
    </div>
  </div>
);
export default AppearanceSection;