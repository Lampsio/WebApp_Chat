// components/Friends.tsx

import React from 'react';
import Image from 'next/image';
import { User } from '../utils/types';

interface FriendsProps {
  friends: User[];
  onSelectFriend: (friend: User) => void; // Add this prop
}

const Friends: React.FC<FriendsProps> = ({ friends, onSelectFriend }) => {
  const getStatusColor = (status: 'AVAILABLE' | 'BUSY' | 'AWAY') => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'BUSY':
        return 'bg-yellow-500';
      case 'AWAY':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getOnlineIndicatorColor = (online: boolean) => {
    return online ? 'bg-green-500' : 'bg-gray-500';
  };

  return (
    <div className="p-4">
      {friends.map(friend => (
        <div
          key={friend.id}
          className="relative bg-[#1E1E1E] p-3 rounded-2xl flex items-center w-[90%] mx-auto m-3 hover:bg-[#2C2C2C] cursor-pointer"
          onClick={() => onSelectFriend(friend)} // Handle click event
        >
          <div className="w-12 h-12 relative mr-2">
            <Image
              src={friend.picture_profile || '/default_profile.png'}
              alt={`${friend.name} ${friend.surname}`}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 ${getOnlineIndicatorColor(friend.online || false)} border-white`}
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">{friend.name} {friend.surname}</h2>
            <p className="text-gray-300 text-xs">{friend.short_description || ''}</p>
            <div className={`text-xs mt-1 ${getStatusColor(friend.status)}`}>
              {friend.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Friends;
