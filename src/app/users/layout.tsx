import AppShell from "@/components/AppShell";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Users">{children}</AppShell>;
}
