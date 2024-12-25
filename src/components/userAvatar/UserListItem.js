import React from "react";
import { Avatar, Box, Typography } from "@mui/material";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      sx={{
        cursor: "pointer",
        backgroundColor: "#E8E8E8",
        "&:hover": {
          backgroundColor: "#5F54FD",
          color: "white",
        },
        // width: "100%",
        display: "flex",
        alignItems: "center",
        color: "black",
        px: 3,
        py: 2,
        mb: 2,
        borderRadius: "8px",
      }}
    >
      <Avatar
        sx={{ marginRight: 2, cursor: "pointer" }}
        alt={user.name}
        src={user.pic}
      />
      <Box>
        <Typography variant="body1">{user.name}</Typography>
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          <b>Email: </b>
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserListItem;
