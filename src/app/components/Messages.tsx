import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Message } from '../utils/types';

interface MessagesProps {
  friendId: number;
  userId: number;
}

const socket = io();

interface ExtendedMessage extends Message {
  sender?: {
    id: number;
    name: string;
    surname: string;
    picture_profile: string;
  };
}

const Messages: React.FC<MessagesProps> = ({ friendId, userId }) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [friendDetails, setFriendDetails] = useState<{
    name: string;
    surname: string;
    picture_profile: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const room = `chat_${Math.min(friendId, userId)}_${Math.max(friendId, userId)}`;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/fetch-messages?friendId=${friendId}&userId=${userId}`);
        if (response.ok) {
          const data: ExtendedMessage[] = await response.json();
          setMessages(data);
          scrollToBottom();
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchFriendDetails = async () => {
      try {
        const response = await fetch(`/api/user-info/${friendId}`);
        if (response.ok) {
          const data = await response.json();
          setFriendDetails(data);
        } else {
          console.error('Failed to fetch friend details');
        }
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    };

    fetchFriendDetails();

    const fetchSenderDetails = async (senderId: number) => {
      try {
        const response = await fetch(`/api/user-info/${senderId}`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error('Error fetching sender details:', error);
      }
      return null;
    };

    socket.emit('join', room);

    socket.on('new_message', async (newMessage: ExtendedMessage) => {
      if (!newMessage.sender) {
        const senderDetails = await fetchSenderDetails(newMessage.senderId);
        if (senderDetails) {
          newMessage.sender = senderDetails;
        }
      }
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
    });

    fetchMessages();

    return () => {
      socket.emit('leave', room);
      socket.off('new_message');
    };
  }, [friendId, userId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      {friendDetails && (
        <div className="sticky top-0 z-10 flex items-center justify-center p-4 bg-[#1E1E1E] shadow m-2">
          <img
            src={friendDetails.picture_profile || '/default-profile.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <p className="font-bold text-lg">{friendDetails.name} {friendDetails.surname}</p>
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div
        className="p-4 space-y-2 overflow-y-auto flex-1"
        style={{ maxHeight: '850px' }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-4 p-2 rounded-lg ${
              msg.sender?.id === userId ? 'bg-[#1E1E1E] text-white' : 'bg-[#C73659]'
            }`}
          >
            <img
              src={msg.sender?.picture_profile || '/default-profile.png'}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-bold">
                {msg.sender?.name} {msg.sender?.surname}
              </p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Dummy div to allow scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;
