import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useUsers } from "./contexts/UsersContext";
import { useContacts } from "./contexts/ContactsContext";

const ChatApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messagesEndRef = useRef(null); // To handle automatic scrolling
  const messagesContainerRef = useRef(null); // To attach scroll listener
  // const [username, setUsername] = useState("");

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const {
    usernames,
    addUser,
    loggedInUser,
    deleteUser,
    socket,
    errorMessage,
    setErrorMessage,
  } = useUsers();

  const {
    handleAddContact,
    contacts,
    newContactUsername,
    setNewContactUsername,
    handleDeleteContact,
  } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Listen for incoming messages
    if (socket) {
      socket.on("receiveMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        messagesContainerRef.current.scrollTop === 0 && // Check if at the top
        hasMoreMessages // Ensure there are more messages to load
      ) {
        fetchMessages(chatId); // Fetch more messages
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chatId, hasMoreMessages]);

  useEffect(() => {
    if (chatId) {
      setPage(1); // Reset to first page
      setHasMoreMessages(true); // Reset pagination state
      setMessages([]); // Clear previous messages
      fetchMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (chatId) => {
    try {
      // Fetch paginated messages
      const response = await axios.get(
        `http://localhost:5000/api/${chatId}/messages?page=${page}&limit=20`
      );

      const { messages: fetchedMessages = [], hasMore = false } = response.data; // Extract messages and hasMore flag
      // console.log("Fetched Messages:", messages);

      if (messages.length === 0) {
        setHasMoreMessages(false); // No more messages to load
      } else {
        // Avoid duplicate messages
        setMessages((prevMessages) => {
          const messageIds = new Set(prevMessages.map((msg) => msg._id)); // Use Set for efficient lookups
          const newMessages = fetchedMessages.filter(
            (msg) => !messageIds.has(msg._id)
          );
          return [...newMessages, ...prevMessages]; // Add new messages to the top
        });
        setHasMoreMessages(hasMore); // Update "load more" state
        setPage((prevPage) => prevPage + 1); // Increment page
      }
    } catch (error) {
      console.error(
        "Error fetching messages:",
        error.response?.data || error.message
      );
      setErrorMessage(
        error.response?.data?.error || "Unable to fetch messages."
      );
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        sender: { username: loggedInUser.username, _id: loggedInUser.userId },
        content: newMessage,
        timestamp: new Date().toISOString(), // Add current timestamp
      };

      // Optimistically add the message to the UI
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");

      try {
        // Send the message to the server
        await axios.post("http://localhost:5000/api/message", {
          chatId,
          senderId: loggedInUser.userId,
          content: newMessage,
        });

        socket.emit("sendMessage", message); // Send via WebSocket
      } catch (error) {
        console.error("Error sending message:", error);
        setErrorMessage("Unable to send message.");
      }
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleUsernameChange = (e) => setNewContactUsername(e.target.value);

  const handleContactClick = async (contact) => {
    console.log("loggedInUser:", loggedInUser.userId);
    console.log("Selected contact:", contact._id);

    try {
      // Start or retrieve a chat
      const response = await axios.post("http://localhost:5000/api/start", {
        userId: loggedInUser.userId,
        otherUserId: contact._id,
      });

      // Destructure response data with fallbacks
      const { _id: chatId, messages = [] } = response.data || {};

      // Log success
      console.log("Chat started or retrieved:", { chatId, messages });

      // Update state
      setChatId(chatId); // Set the active chat ID
      setSelectedContact(contact); // Set the selected contact
      setMessages(messages); // Load previous messages
      setHasMoreMessages(messages.length > 0); // Determine if there are messages to load
    } catch (error) {
      console.error(
        "Error starting or retrieving the chat:",
        error.response?.data || error.message
      );

      // Set a user-friendly error message
      setErrorMessage(
        error.response?.data?.error ||
          "An unexpected error occurred while starting the chat."
      );
    }
  };

  // const handleDeleteUser = async (id) => {
  //   console.log(filteredUsers);
  //   try {
  //     await deleteUser(id); // Attempt to delete user
  //     setErrorMessage(""); // Clear any previous error messages
  //   } catch (error) {
  //     // Handle specific error cases
  //     if (error.status === 404) {
  //       setErrorMessage("User not found. Unable to delete.");
  //     } else if (error.status === 500) {
  //       setErrorMessage("Server error. Please try again later.");
  //     } else {
  //       setErrorMessage("An unexpected error occurred. Please try again.");
  //     }
  //   }
  // };

  const changeToTime = (timestamp) => {
    const date = new Date(timestamp); // Convert timestamp to Date object

    // Format time with options
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return timeString;
  };

  //get username from localstorage
  const localStorageUser = localStorage.getItem("user");
  const loggedInUsername = JSON.parse(localStorageUser)?.username;

  const filteredUsers = usernames.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Box display="flex" height="100vh" bgcolor="#f0f2f5">
      {/* Sidebar */}
      <Box width="30%" bgcolor="#ffffff" borderRight="1px solid #e0e0e0">
        <Box
          p={1}
          borderBottom="1px solid #e0e0e0"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Avatar
            src={
              loggedInUser?.image
                ? `http://localhost:5000${loggedInUser.image}`
                : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fuser-profile&psig=AOvVaw3DTpajCCzaXWAAa1U_Dyxv&ust=1734443825823000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNiu_va4rIoDFQAAAAAdAAAAABAE"
            }
            alt={loggedInUsername.username}
            sx={{
              width: 50,
              height: 50,
              border: "2px solid #5F54FD",
            }}
          />
          <Typography variant="h6">
            {loggedInUsername ? `${loggedInUsername}'s Chats` : "Loading..."}
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#5F54FD" }}
            onClick={handleOpenModal}
          >
            <AddIcon sx={{ marginRight: "8px" }} /> Add Contact
          </Button>
          <Dialog open={isModalOpen} onClose={handleCloseModal}>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the username of the contact you want to add.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Username"
                type="text"
                fullWidth
                value={newContactUsername}
                onChange={(e) => setNewContactUsername(e.target.value)}
              />
              {errorMessage && (
                <DialogContentText color="error">
                  {errorMessage}
                </DialogContentText>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancel
              </Button>
              <Button onClick={handleAddContact} color="primary">
                Add Contact
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <TextField
          variant="outlined"
          placeholder="Search"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <List>
          {contacts?.map((contact) => (
            <ListItem
              key={contact.username}
              onClick={() => handleContactClick(contact)}
            >
              <ListItemAvatar>
                <Avatar
                  src={
                    contact.image
                      ? `http://localhost:5000${contact.image}`
                      : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fuser-profile&psig=AOvVaw3DTpajCCzaXWAAa1U_Dyxv&ust=1734443825823000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNiu_va4rIoDFQAAAAAdAAAAABAE"
                  }
                  alt={contact.username}
                  sx={{
                    width: 50,
                    height: 50,
                    marginRight: 2,
                    border: "2px solid #5F54FD",
                  }}
                />
              </ListItemAvatar>
              <ListItemText primary={contact.username} />
              <DeleteIcon
                onClick={() => handleDeleteContact(contact._id)} // Invoke handleDeleteUser with user ID
                style={{
                  cursor: "pointer",
                  color: "red",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Window */}
      {selectedContact && (
        <Box flex="1" display="flex" flexDirection="column">
          {/* Chat Header */}
          <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#ffffff">
            <Typography variant="h6">
              Chat with {selectedContact?.username || "Unknown"}
            </Typography>
          </Box>

          {/* Messages */}
          <Box
            ref={messagesContainerRef}
            p={2}
            bgcolor="#e5ddd5"
            overflow="auto"
            sx={{
              width: "95%",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignSelf: "flex-start",
            }}
          >
            {messages.map((message, index) => (
              <Paper
                key={index}
                sx={{
                  padding: 1,
                  marginBottom: 2,
                  width: "30%",
                  alignSelf:
                    message.sender._id === loggedInUser.userId
                      ? "flex-end"
                      : "flex-start",
                  backgroundColor:
                    message.sender._id === loggedInUser.userId
                      ? "#DCF8C6"
                      : "#FFFFFF",
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Box
                  sx={{
                    textAlign: "right",
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {changeToTime(message.timestamp)}
                  </Typography>
                </Box>
              </Paper>
            ))}
            <div ref={messagesEndRef}></div>
          </Box>

          {/* Message Input */}
          <Box display="flex" p={2} borderTop="1px solid #e0e0e0">
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatApp;
