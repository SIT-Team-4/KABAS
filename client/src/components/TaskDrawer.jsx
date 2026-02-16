import React, { useMemo, useState } from "react";
import { Drawer, Box, Typography, IconButton, Select, MenuItem, Card, CardContent, Chip } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { statusCards } from "../data/mock";

const statusLabel = (key) => statusCards.find((s) => s.key === key)?.label ?? key;

const statusChipSx = (color, tint) => ({
  borderRadius: 2,
  fontWeight: 700,
  bgcolor: tint,
  color,
  "& .MuiChip-label": { px: 1.1 }
});

export default function TaskDrawer({ open, onClose, statusKey, tasks }) {
  const [sort, setSort] = useState("status");
  const meta = statusCards.find((s) => s.key === statusKey);

  const sorted = useMemo(() => {
    const copy = [...tasks];
    if (sort === "age") copy.sort((a, b) => b.ageDays - a.ageDays);
    if (sort === "priority") copy.sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1));
    return copy;
  }, [tasks, sort]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 520, bgcolor: "#F7F6F3", height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 3, py: 2.25, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(15,23,42,0.08)", bgcolor: "#F7F6F3" }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
            {statusLabel(statusKey)} Tasks ({tasks.length})
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <SwapVertRoundedIcon fontSize="small" />
            <Select size="small" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 170, bgcolor: "#FFFFFF" }}>
              <MenuItem value="status">Sort by Status</MenuItem>
              <MenuItem value="age">Sort by Age</MenuItem>
              <MenuItem value="priority">Sort by Priority</MenuItem>
            </Select>
            <IconButton onClick={onClose}><CloseRoundedIcon /></IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {sorted.map((t) => (
            <Card key={t.id} sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }} noWrap>
                      {t.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <Chip label={t.owner.split(" ").map(w=>w[0]).slice(0,2).join("")} size="small" sx={{ bgcolor: "rgba(247,144,9,0.14)", fontWeight: 800 }} />
                      <Typography sx={{ color: "text.secondary" }}>{t.owner}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {meta ? <Chip label={statusLabel(statusKey)} size="small" sx={statusChipSx(meta.color, meta.tint)} /> : null}

                    <Chip
                      label={t.priority}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor: t.priority === "high" ? "rgba(240,68,56,0.12)" : "rgba(46,144,250,0.12)",
                        color: t.priority === "high" ? "#F04438" : "#2E90FA"
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "text.secondary", ml: 0.5 }}>
                      <AccessTimeRoundedIcon fontSize="small" />
                      <Typography sx={{ fontSize: 13 }}>{t.ageDays}d</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}
