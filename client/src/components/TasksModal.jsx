import React, { useMemo, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

/**
 * Center popup (prototype-style) for status task list.
 * - Centered modal
 * - Header: title + sort dropdown + close
 * - Scrollable list area
 */
export default function TasksModal({
  open,
  onClose,
  title,
  tasks,
  statusLabel,
  statusColor,
  statusTint,
}) {
  const [sort, setSort] = useState("status");

  const sorted = useMemo(() => {
    const copy = [...(tasks || [])];
    if (sort === "age") copy.sort((a, b) => (b.ageDays ?? 0) - (a.ageDays ?? 0));
    if (sort === "priority")
      copy.sort(
        (a, b) =>
          (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1)
      );
    return copy;
  }, [tasks, sort]);

  const statusChipSx = {
    borderRadius: 2,
    fontWeight: 700,
    bgcolor: statusTint || "rgba(127,86,217,0.12)",
    color: statusColor || "#7F56D9",
    "& .MuiChip-label": { px: 1.1 },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 720,
          maxWidth: "calc(100vw - 48px)",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.20)",
        },
      }}
    slotProps={{
      backdrop: {
        sx: { backgroundColor: "rgba(15,23,42,0.55)" },
      },
    }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(15,23,42,0.10)",
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <SwapVertRoundedIcon fontSize="small" />
          <Select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{
              minWidth: 170,
              bgcolor: "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(15,23,42,0.14)",
              },
            }}
          >
            <MenuItem value="status">Sort by Status</MenuItem>
            <MenuItem value="age">Sort by Age</MenuItem>
            <MenuItem value="priority">Sort by Priority</MenuItem>
          </Select>

          <IconButton onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ bgcolor: "#F7F6F3", p: 3, maxHeight: "70vh", overflow: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sorted.map((t) => (
            <Card key={t.id} sx={{ borderRadius: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                      noWrap
                    >
                      {t.title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <Chip
                        label={(t.owner || "NA")
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                        size="small"
                        sx={{ bgcolor: "rgba(247,144,9,0.14)", fontWeight: 800 }}
                      />
                      <Typography sx={{ color: "text.secondary" }}>{t.owner}</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Chip label={statusLabel} size="small" sx={statusChipSx} />

                    <Chip
                      label={t.priority}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor:
                          t.priority === "high"
                            ? "rgba(240,68,56,0.12)"
                            : "rgba(46,144,250,0.12)",
                        color: t.priority === "high" ? "#F04438" : "#2E90FA",
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        color: "text.secondary",
                        ml: 0.5,
                      }}
                    >
                      <AccessTimeRoundedIcon fontSize="small" />
                      <Typography sx={{ fontSize: 13 }}>{t.ageDays}d</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {sorted.length === 0 ? (
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                border: "1px dashed rgba(15,23,42,0.18)",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              No tasks
            </Box>
          ) : null}
        </Box>
      </Box>
    </Dialog>
  );
}
