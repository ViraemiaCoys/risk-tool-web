/* =======================
   shared user mock (list + cards)
   ======================= */

export type user_status = "active" | "pending" | "banned";

export type user_mock = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: user_status;

  // cards only
  avatar_url: string;
  cover_url: string;
  followers: string;
  following: string;
  total_posts: string;
};

export type user_row = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: user_status;
};

export const users_mock: user_mock[] = [
  {
    user_id: "u-0001",
    name: "Angelique Morse",
    email: "anny89@yahoo.com",
    role: "content creator",
    status: "banned",
    avatar_url: "https://i.pravatar.cc/200?img=11",
    cover_url:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1400&q=80",
    followers: "9.91k",
    following: "1.95k",
    total_posts: "9.12k",
  },
  {
    user_id: "u-0002",
    name: "Ariana Lang",
    email: "avery43@hotmail.com",
    role: "it administrator",
    status: "pending",
    avatar_url: "https://i.pravatar.cc/200?img=12",
    cover_url:
      "https://images.unsplash.com/photo-1526404801122-40fc40f06cbe?auto=format&fit=crop&w=1400&q=80",
    followers: "1.95k",
    following: "9.12k",
    total_posts: "6.98k",
  },
  {
    user_id: "u-0003",
    name: "Aspen Schmitt",
    email: "mireya13@hotmail.com",
    role: "financial planner",
    status: "banned",
    avatar_url: "https://i.pravatar.cc/200?img=32",
    cover_url:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
    followers: "9.12k",
    following: "6.98k",
    total_posts: "8.49k",
  },
  {
    user_id: "u-0004",
    name: "Brycen Jimenez",
    email: "tyrel.greenholt@gmail.com",
    role: "hr recruiter",
    status: "active",
    avatar_url: "https://i.pravatar.cc/200?img=22",
    cover_url:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1400&q=80",
    followers: "7.42k",
    following: "2.11k",
    total_posts: "5.30k",
  },
  {
    user_id: "u-0005",
    name: "Chase Day",
    email: "joana.simonis84@gmail.com",
    role: "graphic designer",
    status: "banned",
    avatar_url: "https://i.pravatar.cc/200?img=47",
    cover_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
    followers: "3.18k",
    following: "4.77k",
    total_posts: "1.26k",
  },
];

// 给 list 页直接用：保持你现在的 user_row 类型不变
export const users_list_rows: user_row[] = users_mock.map(
  ({ avatar_url, cover_url, followers, following, total_posts, ...row }) => row
);
