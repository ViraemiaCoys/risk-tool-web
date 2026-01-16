export type user_status = "active" | "pending" | "banned";
export type permission_role = "admin" | "manager" | "user";

export type user_mock = {
  user_id: string;
  name: string;
  email: string;

  title_role: string; // 业务头衔
  permission_role: permission_role; // 权限角色

  status: user_status;

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

  title_role: string;
  permission_role: permission_role;

  status: user_status;
};

export const users_mock: user_mock[] = [
  {
    user_id: "u-0001",
    name: "Angelique Morse",
    email: "anny89@yahoo.com",
    title_role: "content creator",
    permission_role: "user",
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
    title_role: "it administrator",
    permission_role: "manager",
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
    title_role: "financial planner",
    permission_role: "user",
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
    title_role: "hr recruiter",
    permission_role: "admin",
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
    title_role: "graphic designer",
    permission_role: "user",
    status: "banned",
    avatar_url: "https://i.pravatar.cc/200?img=47",
    cover_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
    followers: "3.18k",
    following: "4.77k",
    total_posts: "1.26k",
  },
];

export const users_list_rows: user_row[] = users_mock.map(
  ({ avatar_url, cover_url, followers, following, total_posts, ...row }) => row
);
