// components/AddPerson.tsx

import { FC, useState } from 'react';
import { User } from '../utils/types';

interface AddPersonProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPerson: FC<AddPersonProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<number[]>([]); // Przechowuj wysłane zaproszenia

  const searchUsers = async (query: string): Promise<User[]> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data: User[] = await response.json();
        return data;
      } else {
        console.error('Failed to fetch users');
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: number) => {
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ receiverId }),
      });

      if (response.ok) {
        setSentRequests([...sentRequests, receiverId]);
      } else {
        console.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleSearch = async () => {
    if (query.trim()) {
      const users = await searchUsers(query);
      setResults(users);
    } else {
      setResults([]);
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
        <h2 className="text-lg font-semibold mb-4 text-center text-white">Add Person</h2>
        <div className="flex items-center space-x-4 w-full justify-center mb-4">
          <input 
            type="text" 
            placeholder="Name or Surname" 
            className="w-2/3 p-2 border border-gray-400 rounded text-black"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            className="p-2 bg-[#A91D3A] hover:bg-[#C73659] text-white rounded"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.length > 0 ? (
            results.map(user => (
              <div key={user.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={user.picture_profile} 
                    alt={`${user.name} ${user.surname}`} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{user.name} {user.surname}</h3>
                    <p className="text-gray-300">{user.short_description}</p>
                  </div>
                </div>
                <button 
                  className={`p-2 rounded ${sentRequests.includes(user.id) ? 'bg-yellow-500' : 'bg-[#A91D3A] hover:bg-[#C73659]'} text-white`}
                  onClick={() => sendFriendRequest(user.id)}
                  disabled={sentRequests.includes(user.id)}
                >
                  {sentRequests.includes(user.id) ? 'Sent' : 'Add'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-3 text-center">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPerson;
