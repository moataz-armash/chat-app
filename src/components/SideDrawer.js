import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Avatar,
  Badge,
  TextField,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Notifications, Search, Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import UserListItem from "./userAvatar/UserListItem";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const {
    user,
    setUser,
    notification,
    setNotification,
    setSelectedChat,
    chats,
    setChats,
  } = ChatState();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleSearch = async () => {
    if (!search) {
      setSnackbar({
        open: true,
        message: "Please Enter Something to search",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Field to load search results",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setDrawerOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error accessing chat.",
        severity: "error",
      });
      setLoadingChat(false);
    }
  };

  const [openModal, setOpenModal] = React.useState(false);

  // Open menu handler
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close menu handler
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Open Profile Modal handler
  const handleOpenModal = () => {
    setOpenModal(true);
    handleClose();
  };

  // Close Profile Modal handler
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ backgroundColor: "#5F54FD" }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Ag Programlama Chat App
          </Typography>
          <IconButton color="inherit" onClick={handleNotificationOpen}>
            <Badge badgeContent={notification.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
          >
            {notification.length === 0 && <MenuItem>No new messages</MenuItem>}
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));
                  handleNotificationClose();
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message in ${notif.chat.chatName}`
                  : `New Message from ${notif.chat.users[0].name}`}
              </MenuItem>
            ))}
          </Menu>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar src={user.pic} alt={user.name} />
          </IconButton>
          <Button onClick={handleClick}>Open Menu</Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleOpenModal}>My Profile</MenuItem>
            <Divider />
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </Menu>

          {/* Profile Modal using MUI Dialog */}
          <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>{user.name}'s Profile</DialogTitle>
            <DialogContent>
              {/* Profile information goes here */}
              <p>Email: {user.email}</p>
              {/* Add other user details */}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Users
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ backgroundColor: "#5F54FD" }}
            >
              {loading ? <CircularProgress size={24} /> : <Search />}
            </Button>
          </Box>
          <List>
            {searchResult.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => accessChat(user._id)}
              />
            ))}
            {loadingChat && (
              <CircularProgress sx={{ display: "block", mx: "auto" }} />
            )}
          </List>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SideDrawer;
