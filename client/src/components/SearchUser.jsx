import React, { useState } from "react";
import axios from "axios";

const SearchUser = ({ onUserSelect }) => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const searchUser = async () => {
    setError("");
    setResult(null);
    if (!email) return;

    try {
      const res = await axios.get(`/api/users/find-by-email?email=${encodeURIComponent(email)}`);
      if (res.data.success) {
        setResult(res.data.user);
      } else {
        setError("User not found");
      }
    } catch (err) {
      setError("Error searching user");
    }
  };

  return (
    <div className="p-4 border rounded w-full max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter user email"
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={searchUser}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Search
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {result && (
        <div className="mt-4 border p-4 rounded bg-gray-50">
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Email:</strong> {result.email}</p>
          <button
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => onUserSelect(result)}
          >
            Message
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchUser;
