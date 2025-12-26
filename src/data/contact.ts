export type ContactStatus = "online" | "busy" | "offline";

export type ContactRow = {
  id: string;
  name: string;
  status: ContactStatus;
  lastActive?: string; // e.g. "2 days", "4 days"
};

export const contacts: ContactRow[] = [
  { id: "c1", name: "Jayvion Simon", status: "busy" },
  { id: "c2", name: "Lucian O'Brien", status: "online" },
  { id: "c3", name: "Deja Brady", status: "offline", lastActive: "2 days" },
  { id: "c4", name: "Harrison Stein", status: "online" },
  { id: "c5", name: "Reece Chung", status: "offline", lastActive: "4 days" },
];
