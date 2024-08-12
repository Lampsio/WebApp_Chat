"use client";

import { FC } from 'react';
import { User, FriendRequest } from '../utils/types';

interface RequestProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  friendRequests: FriendRequest[]; // Odbieranie friendRequests
}

const Request: FC<RequestProps> = ({ isOpen, onClose, currentUser, friendRequests }) => {
  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/friend-request/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Na razie nie aktualizujemy lokalnego stanu, ponieważ ChatBox zarządza stanem zaproszeń
      } else {
        console.error('Failed to update friend request');
      }
    } catch (error) {
      console.error('Error updating friend request:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-[#1E1E1E] p-8 rounded-lg relative w-2/3 h-3/4 overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center text-white">Friend Requests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {friendRequests.length > 0 ? (
            friendRequests.map(request => (
              <div key={request.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={request.sender.picture_profile} 
                    alt={`${request.sender.name} ${request.sender.surname}`} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{request.sender.name} {request.sender.surname}</h3>
                    <p className="text-gray-300">{request.sender.short_description}</p>
                  </div>
                </div>
                <div>
                  <button 
                    className="p-2 bg-green-500 hover:bg-green-700 text-white rounded mr-2"
                    onClick={() => handleAction(request.id, 'accept')}
                  >
                    ✓
                  </button>
                  <button 
                    className="p-2 bg-red-500 hover:bg-red-700 text-white rounded"
                    onClick={() => handleAction(request.id, 'reject')}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-3 text-center">No friend requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;
