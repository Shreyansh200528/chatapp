import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ✅ Get users who have chatted (initial sidebar population)
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load users");
    }
  };

  // ✅ Get messages with a specific user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        // Reset unseen count
        setUnseenMessages((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send a message to selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Subscribe to incoming messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      const isCurrentChat =
        selectedUser && newMessage.senderId === selectedUser._id;

      if (isCurrentChat) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }

      // ✅ Ensure user appears in list
      setUsers((prev) => {
        const exists = prev.some((u) => u._id === newMessage.senderId);
        if (!exists) {
          // Optionally fetch full user info (instead of dummy)
          try {
            axios
              .get(`/api/users/${newMessage.senderId}`)
              .then((res) => {
                if (res.data.success) {
                  setUsers((current) => [res.data.user, ...current]);
                }
              })
              .catch(() => {
                // fallback to minimal info
                setUsers((current) => [
                  {
                    _id: newMessage.senderId,
                    fullName: "Unknown User",
                    profilePic: "",
                  },
                  ...current,
                ]);
              });
          } catch {
            // silent fail
          }
        }
        return prev;
      });
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  // ✅ Search user by email (used in search input)
  const findUserByEmail = async (email) => {
    try {
      const { data } = await axios.get(
        `/api/users/find-by-email?email=${email}`
      );
      if (data.success) {
        return data.user;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return null;
    }
  };

  // ✅ Initial effect
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    setSelectedUser,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    findUserByEmail,
  };

  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};
