// src/app/page.tsx
import AppShell from "@/components/AppShell";
import Dashboard from "@/components/Dashboard";

export default function HomePage() {
  return (
    <AppShell title="Dashboard">
      <Dashboard />
    </AppShell>
  );
}
