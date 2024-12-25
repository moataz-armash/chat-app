import React from "react";
import { Stack, Skeleton } from "@mui/material";

const ChatLoading = () => {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
    </Stack>
  );
};

export default ChatLoading;
