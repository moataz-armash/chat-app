import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const UsersContext = createContext();

export const useUsers = () => {
  return useContext(UsersContext);
};

export const UsersProvider = ({ children }) => {
  const [usernames, setUsernames] = useState(() => {
    const savedContacts = localStorage.getItem("contacts");
    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  const [loggedInUser, setLoggedInUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  const [socket, setSocket] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/usernames");
        setUsernames(response.data);
        localStorage.setItem("contacts", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };

    if (usernames.length === 0) {
      fetchUsernames();
    }
  }, [usernames]);

  // Initialize WebSocket
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Adjust URL if needed
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const addUser = async (username) => {
    try {
      // Step 1: Check if the user exists in the database
      const response = await axios.post(
        "http://localhost:5000/api/usernames/check",
        { username }
      );
      const { userId } = response.data;

      if (!response.data.exists) {
        // If the user does not exist in the database, return an error
        throw {
          response: { status: 404, message: "User not found in the database." },
        };
      }

      // Step 2: Check if the user is already in the participants list
      const isAlreadyAdded = usernames.some(
        (user) => user.username === username
      );
      if (isAlreadyAdded) {
        throw {
          response: {
            status: 200,
            message: "Username is already in your participants.",
          },
        };
      }

      // Step 3: Add the user to the participants list
      const updatedUsernames = [
        ...usernames,
        { _id: userId, username: username },
      ];
      setUsernames(updatedUsernames);
      localStorage.setItem("contacts", JSON.stringify(updatedUsernames));

      return { success: true }; // Return success status
    } catch (error) {
      console.error("Error in addUser:", error);

      // Re-throw error to let the calling function handle it
      throw error.response || new Error("An unexpected error occurred.");
    }
  };

  const deleteUser = async (username) => {
    try {
      // Check if the user exists in the participants list
      const userExists = usernames.some((user) => user.username === username);

      if (!userExists) {
        throw {
          response: { status: 404, message: "User not found in participants." },
        };
      }

      // Remove the user from the participants list
      const updatedUsernames = usernames.filter(
        (user) => user.username !== username
      );
      setUsernames(updatedUsernames);
      localStorage.setItem("contacts", JSON.stringify(updatedUsernames));

      return { success: true }; // Success status
    } catch (error) {
      console.error("Error in deleteUser:", error);

      // Re-throw error for the caller to handle
      throw error.response || new Error("An unexpected error occurred.");
    }
  };

  return (
    <UsersContext.Provider
      value={{
        usernames,
        addUser,
        deleteUser,
        setUsernames,
        loggedInUser,
        socket,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
