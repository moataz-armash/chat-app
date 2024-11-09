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
import AddIcon from "@mui/icons-material/Add";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useUsers } from "./contexts/UsersContext";
const ChatApp = () => {
  const [messages, setMessages] = useState([
    { sender: "Alice", text: "Hi, how are you?", fromMe: false },
    { sender: "You", text: "I’m good! How about you?", fromMe: true },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { usernames, addUser } = useUsers();
  const [errorMessage, setErrorMessage] = useState("");
  const loggedInUsername = localStorage.getItem("username");

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUsername("");
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { sender: "You", text: newMessage, fromMe: true },
      ]);
      setNewMessage("");
    }
  };

  const handleAddUsername = async () => {
    if (username === loggedInUsername) {
      setErrorMessage("You cannot add yourself to the contacts.");
      return;
    }
    
    if (usernames.some(user => user.username === username)) {
      setErrorMessage("This user is already in your contacts.");
      return;
    }
    try {
      await addUser(username);
      setUsername("");
      setErrorMessage("");
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Box display="flex" height="100vh" bgcolor="#f0f2f5">
      {/* Sidebar */}
      <Box
        width="30%"
        bgcolor="#ffffff"
        borderRight="1px solid #e0e0e0"
        display="flex"
        flexDirection="column"
      >
        <Box
          p={2}
          borderBottom="1px solid #e0e0e0"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chats</Typography>
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
          <Button
            variant="contained"
            sx={{ width: "25%", backgroundColor: "#5F54FD" }}
          >
            <AddIcon sx={{ marginRight: "8px" }} /> Group
          </Button>
        </Box>
        <TextField
          variant="outlined"
          placeholder="Search"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <List>
          {/* List of contacts */}
          {usernames?.map((contact) => (
            <ListItem button key={contact}>
              <ListItemAvatar>
                <Avatar>{contact[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={contact.username} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Window */}
      <Box flex="1" display="flex" flexDirection="column">
        {/* Chat Header */}
        <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#ffffff">
          <Typography variant="h6">Chat with Alice</Typography>
        </Box>

        {/* Messages */}
        <Box flex="1" p={2} bgcolor="#e5ddd5" overflow="auto">
          {messages.map((message, index) => (
            <Paper
              key={index}
              style={{
                maxWidth: "70%",
                margin: message.fromMe ? "8px auto 8px 0" : "8px 0 8px auto",
                padding: "8px 12px",
                backgroundColor: message.fromMe ? "#DCF8C6" : "#ffffff",
                alignSelf: message.fromMe ? "flex-end" : "flex-start",
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography
                variant="caption"
                align="right"
                display="block"
                color="textSecondary"
              >
                {message.fromMe ? "You" : message.sender}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Message Input */}
        <Box
          display="flex"
          p={2}
          bgcolor="#ffffff"
          borderTop="1px solid #e0e0e0"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            style={{ marginLeft: "8px" }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const saveContactsToLocalStorage = (contacts) => {
  localStorage.setItem("contacts", JSON.stringify(contacts));
};

const getContactsFromLocalStorage = () => {
  const contacts = localStorage.getItem("contacts");
  return contacts ? JSON.parse(contacts) : [];
};

export default ChatApp;
