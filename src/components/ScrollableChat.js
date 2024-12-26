import React, { useEffect, useRef } from "react";
import { Box, Avatar, Typography, Paper, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChatState } from "../Context/ChatProvider";

// Styled components
const MessageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1, 2),
  maxWidth: "75%",
  borderRadius: 16,
  backgroundColor: isUser ? "#E3F2FD" : "#F5F5F5",
  position: "relative",
}));

const TimeStamp = styled(Typography)({
  fontSize: "0.75rem",
  color: "#666",
  marginTop: 4,
  textAlign: "right",
});

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isFirstInSequence = (messages, index) => {
    if (index === 0) return true;
    return messages[index].sender._id !== messages[index - 1].sender._id;
  };

  const isLastInSequence = (messages, index) => {
    if (index === messages.length - 1) return true;
    return messages[index].sender._id !== messages[index + 1].sender._id;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // If hours is 0, make it 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <Box
      sx={{
        height: "60vh",
        overflowY: "auto",
        px: 2,
        py: 1,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px",
          "&:hover": {
            background: "#666",
          },
        },
      }}
    >
      {messages?.map((message, index) => {
        const isUserMessage = message.sender._id === user._id;
        const showAvatar = !isUserMessage && isLastInSequence(messages, index);
        const isFirst = isFirstInSequence(messages, index);

        return (
          <MessageContainer
            key={message._id}
            sx={{
              justifyContent: isUserMessage ? "flex-end" : "flex-start",
              mt: isFirst ? 3 : 0.5,
            }}
          >
            {!isUserMessage && showAvatar && (
              <Tooltip title={message.sender.name} placement="left">
                <Avatar
                  src={message.sender.pic}
                  alt={message.sender.name}
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            )}

            <Box sx={{ maxWidth: "75%" }}>
              {!isUserMessage && isFirst && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 2,
                    mb: 0.5,
                    display: "block",
                    color: "text.secondary",
                  }}
                >
                  {message.sender.name}
                </Typography>
              )}

              <MessageBubble
                isUser={isUserMessage}
                elevation={0}
                sx={{
                  ml: !isUserMessage && !showAvatar ? 5 : 0,
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {message.content}
                </Typography>
                <TimeStamp variant="caption">
                  {formatTime(message.createdAt)}
                </TimeStamp>
              </MessageBubble>
            </Box>
          </MessageContainer>
        );
      })}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ScrollableChat;
