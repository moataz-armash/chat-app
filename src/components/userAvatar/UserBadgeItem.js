import React from "react";
import { Chip } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Chip
      label={`${user.name}${admin === user._id ? " (Admin)" : ""}`}
      onDelete={handleFunction}
      deleteIcon={<CloseIcon />}
      color="primary"
      variant="filled"
      sx={{
        margin: "4px",
        fontSize: "12px",
        paddingX: "8px",
        paddingY: "4px",
      }}
    />
  );
};

export default UserBadgeItem;
