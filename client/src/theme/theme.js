import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#F79009" },
    background: { default: "#F7F6F3", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#667085" },
    divider: "rgba(15,23,42,0.08)"
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
    body2: { fontSize: 13 }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "none",
          borderBottom: "1px solid rgba(15,23,42,0.08)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 1px 2px rgba(16,24,40,0.04)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 }
      }
    }
  }
});
