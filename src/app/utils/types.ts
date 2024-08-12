export type User = {
    id: number;
    email: string;
    name: string;
    surname: string;
    picture_profile: string;
    short_description?: string;
    status: 'AVAILABLE' | 'BUSY' | 'AWAY';  // Ensure this matches your status values
    online?: boolean;
  };

export interface UserWithRequestStatus extends User {
    requestStatus?: 'PENDING' | 'SENT' | 'NONE';
}

export interface FriendRequest {
  id: number;
  sender: User;
  status: string; // Możesz zmienić typ, jeśli masz inne statusy
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  senderName: string; // Dodane
  senderSurname: string; // Dodane
  senderProfilePicture: string; // URL do zdjęcia profilowego
}