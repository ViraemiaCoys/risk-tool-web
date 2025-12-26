import AppShell from "@/components/AppShell";

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Companies">{children}</AppShell>;
}
