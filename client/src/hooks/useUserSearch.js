import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DUMMY_USER = {
  _id: '6867e15f3bb3b9227b61fc17',
  email: 'dummy2@gmail.com',
  fullName: 'dummy',
  profilePic: '',
  bio: 'Hello Welcome to my chatapp, test if it is working on this bot',
};

export const useUserSearch = (input, users = []) => {
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const trimmed = input.trim().toLowerCase();

    if (!trimmed) {
      const alreadyIncluded = users.some((u) => u._id === DUMMY_USER._id);
      const updated = alreadyIncluded ? users : [...users, DUMMY_USER];
      setFilteredUsers(updated);
      return;
    }

    const localMatches = [...users, DUMMY_USER].filter(
      (user) =>
        user.fullName.toLowerCase().includes(trimmed) ||
        user.email?.toLowerCase() === trimmed
    );

    if (localMatches.length > 0) {
      setFilteredUsers(localMatches);
      return;
    }

    // Check if email-like input
    if (!trimmed.includes('@')) {
      setFilteredUsers([]);
      return;
    }

    const fetchUserByEmail = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`/api/auth/find-by-email?email=${trimmed}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const foundUser = res.data.user;
        const alreadyInList = users.some((u) => u._id === foundUser._id);
        setFilteredUsers(alreadyInList ? users.filter((u) => u._id === foundUser._id) : [foundUser]);
      } catch (err) {
        setFilteredUsers([]);
        if (err.response?.status !== 404) {
          toast.error('Failed to fetch user');
        }
      }
    };

    fetchUserByEmail();
  }, [input, users]);

  return { filteredUsers };
};
