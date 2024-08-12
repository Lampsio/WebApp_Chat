"use client";

import Image from 'next/image';
import { useState } from 'react';

interface UserProfileProps {
  picture_profile: string;
  name: string;
  surname: string;
  short_description: string;
  status: 'AVAILABLE' | 'BUSY' | 'AWAY';
  onStatusChange: (status: 'AVAILABLE' | 'BUSY' | 'AWAY') => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  picture_profile,
  name,
  surname,
  short_description,
  status,
  onStatusChange,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStatusChange = (newStatus: 'AVAILABLE' | 'BUSY' | 'AWAY') => {
    onStatusChange(newStatus);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative bg-[#1E1E1E] p-3 rounded-2xl flex items-center w-[90%] mx-auto m-3 hover:bg-[#2C2C2C] cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
      <div className="w-12 h-12 relative mr-2">
        <Image
          src={picture_profile}
          alt="Profile Picture"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${status === 'AVAILABLE' ? 'bg-green-500' : status === 'BUSY' ? 'bg-yellow-500' : 'bg-red-500'} border-white`} />
      </div>
      <div>
        <h2 className="text-white font-bold text-sm">{name} {surname}</h2>
        <p className="text-gray-300 text-xs">{short_description}</p>
      </div>

      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-[#1E1E1E] rounded-lg shadow-lg border border-gray-600 w-full">
          <button
            className="block px-4 py-2 text-white hover:bg-[#2C2C2C] w-full text-left"
            onClick={() => handleStatusChange('AVAILABLE')}
          >
            Available
          </button>
          <button
            className="block px-4 py-2 text-white hover:bg-[#2C2C2C] w-full text-left"
            onClick={() => handleStatusChange('BUSY')}
          >
            Busy
          </button>
          <button
            className="block px-4 py-2 text-white hover:bg-[#2C2C2C] w-full text-left"
            onClick={() => handleStatusChange('AWAY')}
          >
            Away
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            className="block px-4 py-2 text-white hover:bg-[#2C2C2C] w-full text-left"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
