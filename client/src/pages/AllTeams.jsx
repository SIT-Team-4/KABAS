import React from "react";
import { Box, Typography } from "@mui/material";

export default function AllTeams() {
  return (
    <Box sx={{ minHeight: 240 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
        All Teams
      </Typography>
      <Typography sx={{ mt: 1, color: "text.secondary" }}>
      </Typography>
    </Box>
  );
}