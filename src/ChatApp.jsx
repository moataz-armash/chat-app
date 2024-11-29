import React, { useState, useEffect } from "react";
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

const ChatApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");

  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // To check if more messages are available
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

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/6748b76acc9812678d7a4f4d/messages`
      );

      const fetchedMessages = response.data;
      if (fetchedMessages.length === 0) {
        setHasMoreMessages(false); // No more messages to load
      } else {
        setMessages((prevMessages) => [...fetchedMessages, ...prevMessages]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setErrorMessage("Unable to fetch messages.");
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        sender: { username: loggedInUser.username, _id: loggedInUser.userId },
        content: newMessage,
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
  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleContactClick = async (contact) => {
    console.log("Selected contact:", loggedInUser.userId);

    try {
      // Step 1: Start or retrieve a chat
      const response = await axios.post("http://localhost:5000/api/start", {
        userId: loggedInUser.userId,
        otherUserId: contact._id,
      });
      // console.log("_id: " + response.data._id + "response: " + response.data);
      const { _id: chatId } = response.data;
      setChatId(chatId);
      setSelectedContact(contact);

      // Step 2: Fetch the first page of messages
      setMessages([]); // Clear previous messages
      setHasMoreMessages(true); // Reset load more state
      await fetchMessages(1); // Fetch the first page
    } catch (error) {
      console.error("Error starting or retrieving the chat:", error);
      setErrorMessage("Unable to start or retrieve the chat.");
    }
  };

  const handleAddUsername = async () => {
    try {
      await addUser(username); // Try to add the username
      setUsername(""); // Clear input field
      setErrorMessage(""); // Clear any error messages
      setIsModalOpen(false); // Close modal
    } catch (error) {
      // Handle specific errors returned by addUser or unexpected issues
      if (error.status === 404) {
        // User not found in the database
        setErrorMessage("User not found in the database.");
      } else if (error.status === 200) {
        // User is already in participants or custom message from addUser
        setErrorMessage(
          error.message || "This user is already in your participants."
        );
      } else if (error.status === 400) {
        // Invalid username format
        setErrorMessage("Invalid username. Please provide a valid one.");
      } else {
        // Handle any unexpected errors
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const handleDeleteUser = async (id) => {
    console.log(filteredUsers);
    try {
      await deleteUser(id); // Attempt to delete user
      setErrorMessage(""); // Clear any previous error messages
    } catch (error) {
      // Handle specific error cases
      if (error.status === 404) {
        setErrorMessage("User not found. Unable to delete.");
      } else if (error.status === 500) {
        setErrorMessage("Server error. Please try again later.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

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

  const filteredUsers = usernames.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box display="flex" height="100vh" bgcolor="#f0f2f5">
      {/* Sidebar */}
      <Box width="30%" bgcolor="#ffffff" borderRight="1px solid #e0e0e0">
        <Box
          p={2}
          borderBottom="1px solid #e0e0e0"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{loggedInUser.username}'s Chats</Typography>
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
                value={username}
                onChange={handleUsernameChange}
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
              <Button onClick={handleAddUsername} color="primary">
                Add User
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
          {filteredUsers.map((contact) => (
            <ListItem
              key={contact.username}
              onClick={() => handleContactClick(contact)}
            >
              <ListItemAvatar>
                <Avatar>{contact.username[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={contact.username} />
              <DeleteIcon
                onClick={() => handleDeleteUser(contact.username)} // Invoke handleDeleteUser with user ID
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
