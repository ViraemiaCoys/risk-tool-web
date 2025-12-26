// src/app/page.tsx
import AppShell from "@/components/AppShell";
import Dashboard from "@/components/Dashboard";
import { Box } from "@mui/material";

export default function HomePage() {
  return (
    <AppShell title="Dashboard">
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400, // 你嫌小就加大：1600/1800都行
          mx: "auto",
        }}
      >
        <Dashboard />
      </Box>
    </AppShell>
  );
}
