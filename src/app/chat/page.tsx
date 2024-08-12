"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import UserProfile from '../components/UserProfile';
import AddPerson from '../components/AddPerson';
import Request from '../components/Request';
import Friends from '../components/Friends';
import Messages from '../components/Messages';
import { User, FriendRequest} from '../utils/types';

// Initialize Socket.io
const socket = io();
console.log('Socket.IO client initialized:', socket);

const ChatBox = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: User = await response.json();
          setUser(data);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      socket.emit('join', `user_${user.id}`); // Join WebSocket room

      // Set interval to poll friend requests and friends every 30 seconds
      const intervalId = setInterval(() => {
        fetchFriendRequests();
        fetchFriends();
      }, 1000);

      // Fetch data immediately on load
      fetchFriendRequests();
      fetchFriends();

      return () => {
        socket.emit('leave', `user_${user.id}`); // Leave WebSocket room
        clearInterval(intervalId); // Clear the interval on cleanup
      };
    }
  }, [user]);

  useEffect(() => {
    socket.on('friend_request_updated', (updatedRequest: FriendRequest) => {
      setFriendRequests(prevRequests =>
        prevRequests
          .filter(req => req.id !== updatedRequest.id) // Remove old request
          .concat(updatedRequest) // Add updated request
          .sort((a, b) => a.id - b.id) // Sort requests
      );
    });

    return () => {
      socket.off('friend_request_updated');
    };
  }, []);

  const fetchFriendRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/friend-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: FriendRequest[] = await response.json();
        setFriendRequests(data);
      } else {
        console.error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: User[] = await response.json();
        setFriends(data);
      } else {
        console.error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleStatusChange = async (newStatus: 'AVAILABLE' | 'BUSY' | 'AWAY') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || !selectedFriend || !user) return;

    try {
      // Wysyłamy wiadomość za pomocą API
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedFriend.id,
          content: message,
        }),
      });

      if (response.ok) {
        // Wyczyść pole wiadomości po wysłaniu
        setMessage('');

        // Emituj wiadomość przez socket.io
        socket.emit('send_message', {
          senderId: user.id,
          receiverId: selectedFriend.id,
          content: message,
        });

        // Opcjonalnie, można zaktualizować lokalne wiadomości
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const openAddPersonModal = () => {
    setIsAddPersonOpen(true);
  };

  const closeAddPersonModal = () => {
    setIsAddPersonOpen(false);
  };

  const openRequestModal = () => {
    setIsRequestOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestOpen(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      {/* First column */}
      <div className="w-2/12 flex flex-col">
        <div className="bg-[#A91D3A] h-[10%] flex items-center justify-center">
          <div className="flex space-x-4">
            <div 
              className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 hover:bg-gray-300 transition-transform transform hover:scale-110 hover:shadow-lg cursor-pointer"
            >
              <img src="/icon/home.ico" alt="Icon 1" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div 
              className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 hover:bg-gray-300 transition-transform transform hover:scale-110 hover:shadow-lg cursor-pointer"
              onClick={openAddPersonModal}
            >
              <img src="/icon/addperson.ico" alt="Icon 2" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 hover:bg-gray-300 transition-transform transform hover:scale-110 hover:shadow-lg">
              <img src="/icon/friend.ico" alt="Icon 3" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 hover:bg-gray-300 transition-transform transform hover:scale-110 hover:shadow-lg cursor-pointer"
              onClick={openRequestModal}
            >
              <img src="/icon/mailbox.ico" alt="Icon 4" className="absolute inset-0 w-full h-full object-cover" />
              {friendRequests.length > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {friendRequests.length}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-[#C73659] flex-1">
          <Friends friends={friends} onSelectFriend={setSelectedFriend}></Friends>
        </div>
        <div className="bg-[#A91D3A] h-[10%]">
          <UserProfile
            picture_profile={user.picture_profile || ''}
            name={user.name}
            surname={user.surname}
            short_description={user.short_description || ''}
            status={user.status}
            onStatusChange={handleStatusChange}
            onLogout={handleLogout}
          />
        </div>
      </div>
      {/* Second column */}
      <div className="w-10/12 flex flex-col">
        <div className="bg-[#151515] flex-1">
          {selectedFriend && (
            <Messages friendId={selectedFriend.id} userId={user.id}></Messages>
          )}
        </div>
        <div className="bg-[#151515] h-[10%] flex items-center px-4">
          <input 
              type="text" 
              className="flex-1 px-4 py-2 text-black" 
              placeholder="Write a message..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
          <button
            onClick={handleSendMessage}
            className="ml-2 p-2 rounded-full bg-red-500 hover:bg-red-600"
          >
            <img src="/icon/mailbox.ico" alt="Send" className="w-6 h-6" />
          </button>
        </div>
      </div>
      {/* Add Person Modal */}
      <AddPerson isOpen={isAddPersonOpen} onClose={closeAddPersonModal} />
      {/* Request Modal */}
      <Request 
        isOpen={isRequestOpen} 
        onClose={closeRequestModal} 
        currentUser={user} 
        friendRequests={friendRequests} // Pass friendRequests to Request component
      />
    </div>
  );
};

export default ChatBox;
