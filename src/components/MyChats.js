import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "../components/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      console.log(data);
      setChats(data);
    } catch (error) {
      console.error("Failed to Load the chats");
      alert("Error occurred while loading chats.");
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? "none" : "flex", md: "flex" },
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        backgroundColor: "white",
        width: { xs: "100%", md: "31%" },
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.12)",
      }}
    >
      <Box
        sx={{
          pb: 3,
          px: 3,
          fontSize: { xs: "28px", md: "30px" },
          fontFamily: "Work Sans, sans-serif",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">My Chats</Typography>
        <GroupChatModal>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{
              fontSize: { xs: "14px", md: "10px", lg: "14px" },
              backgroundColor: "#5F54FD",
            }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 3,
          backgroundColor: "#F8F8F8",
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflowY: "hidden",
        }}
      >
        {chats ? (
          <Stack sx={{ overflowY: "scroll" }}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedChat === chat ? "#5F54FD" : "#E8E8E8",
                  color: selectedChat === chat ? "white" : "black",
                  px: 3,
                  py: 2,
                  my: 1,
                  borderRadius: 2,
                }}
              >
                <Typography>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Typography>
                {chat.latestMessage && (
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    <b>{chat.latestMessage.sender.name}:</b>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
