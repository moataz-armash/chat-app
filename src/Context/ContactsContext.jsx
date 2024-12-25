import React, { createContext, useContext, useEffect, useState } from "react";
import { useUsers } from "./UsersContext";
import axios from "axios";

const ContactsContext = createContext();

export const useContacts = () => {
  return useContext(ContactsContext);
};

export const ContactsProvider = ({ children }) => {
  const { loggedInUser, setErrorMessage, errorMessage } = useUsers();

  const [contacts, setContacts] = useState([]);
  const [newContactUsername, setNewContactUsername] = useState("");

  const fetchContacts = async () => {
    console.log(loggedInUser);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/${loggedInUser.userId}/contacts`
      );
      setContacts(response.data); // Store contacts in state
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setErrorMessage("Failed to load contacts.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!newContactUsername) return;

    try {
      await axios.post("http://localhost:5000/api/user/add-contact", {
        userId: loggedInUser.userId,
        username: newContactUsername,
      });
      fetchContacts();
      setNewContactUsername("");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to add contact.");
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!contactId) return;

    try {
      await axios.delete("http://localhost:5000/api/user/delete-contact", {
        data: { userId: loggedInUser.userId, contactId },
      });
      fetchContacts(); // Refresh the contact list
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Failed to delete contact."
      );
    }
  };

  return (
    <ContactsContext.Provider
      value={{
        handleAddContact,
        contacts,
        setNewContactUsername,
        newContactUsername,
        handleDeleteContact,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};
