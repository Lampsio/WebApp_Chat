"use client"; // Dodaj to na początku pliku

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          surname,
          email,
          password,
        }),
      });

      if (response.ok) {
        router.push('/login');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#151515]">
      <div className="bg-[#A91D3A] p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Register Page</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block mb-1 text-white" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-white" htmlFor="surname">Surname</label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
              placeholder="Enter your surname"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-white" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-white" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#C73659] text-white py-2 rounded-md hover:bg-[#EB6082] mt-6"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
