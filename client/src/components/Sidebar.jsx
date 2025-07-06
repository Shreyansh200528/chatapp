import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// 🔒 fallback dummy user (in case not fetched from server)
const DUMMY_USER = {
  _id: '6867e15f3bb3b9227b61fc17',
  email: 'dummy2@gmail.com',
  fullName: 'dummy',
  profilePic: '', // optionally add an image URL
  bio: 'Hello Welcome to my chatapp, test if it is working on this bot',
};

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const navigate = useNavigate();

  // Fetch all users & ensure dummy2 is added if not present
  useEffect(() => {
    const ensureDummyUser = () => {
      const alreadyIncluded = users.some((u) => u._id === DUMMY_USER._id);
      const updated = alreadyIncluded ? users : [...users, DUMMY_USER];
      setFilteredUsers(updated);
    };

    ensureDummyUser();
  }, [users]);

  // Search functionality
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

    // Query by email (if it looks valid)
    if (!trimmed.includes('@')) {
      setFilteredUsers([]);
      return;
    }

    const fetchUserByEmail = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          `/api/users/find-by-email?email=${trimmed}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const foundUser = res.data.user;
        const alreadyInList = users.some((u) => u._id === foundUser._id);
        if (!alreadyInList) {
          setFilteredUsers([foundUser]);
        } else {
          setFilteredUsers(users.filter((u) => u._id === foundUser._id));
        }
      } catch (err) {
        setFilteredUsers([]);
        if (err.response?.status !== 404) {
          toast.error('Failed to fetch user');
        }
      }
    };

    fetchUserByEmail();
  }, [input, users]);

  useEffect(() => {
    getUsers(); // fetch users when online status changes
  }, [onlineUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              key={user._id || index}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
                selectedUser?._id === user._id && 'bg-[#282142]/50'
              }`}
            >
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt=""
                className="w-[35px] aspect-[1/1] rounded-full"
              />
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>
              {unseenMessages[user._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-gray-400 mt-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
