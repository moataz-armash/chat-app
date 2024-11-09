import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UsersContext = createContext();

export const useUsers = () => {
  return useContext(UsersContext);
};

export const UsersProvider = ({ children }) => {
  const [usernames, setUsernames] = useState(() => {
    const savedContacts = localStorage.getItem("contacts");
    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get("/usernames");
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

  const addUser = async (username) => {
    try {
      const response = await axios.post("/usernames/check", { username });
      if (response.data.exists) {
        const updatedUsernames = [...usernames, { username }];
        setUsernames(updatedUsernames);
        localStorage.setItem("contacts", JSON.stringify(updatedUsernames));
      } else {
        throw new Error("Username not found in the database.");
      }
    } catch (error) {
      console.error("Error adding username:", error);
      throw error;
    }
  };

  return (
    <UsersContext.Provider value={{ usernames, addUser, setUsernames }}>
      {children}
    </UsersContext.Provider>
  );
};
