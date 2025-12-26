/* =======================
   user types & data
   ======================= */

export type user_status = "active" | "pending" | "banned";

export type user_row = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: user_status;
};

export const users: user_row[] = [
  {
    user_id: "u-0001",
    name: "Angelique Morse",
    email: "anny89@yahoo.com",
    role: "content creator",
    status: "banned",
  },
  {
    user_id: "u-0002",
    name: "Ariana Lang",
    email: "avery43@hotmail.com",
    role: "it administrator",
    status: "pending",
  },
  {
    user_id: "u-0003",
    name: "Aspen Schmitt",
    email: "mireya13@hotmail.com",
    role: "financial planner",
    status: "banned",
  },
  {
    user_id: "u-0004",
    name: "Brycen Jimenez",
    email: "tyrel.greenholt@gmail.com",
    role: "hr recruiter",
    status: "active",
  },
  {
    user_id: "u-0005",
    name: "Chase Day",
    email: "joana.simonis84@gmail.com",
    role: "graphic designer",
    status: "banned",
  },
];

/* =======================
   company types & data
   ======================= */

export type company_row = {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number; // USD (real amount)
  employees: number;
};

type seed_row = {
  country: string;
  city: string;
};

const seed_geo: seed_row[] = [
  { country: "USA", city: "Los Angeles" },
  { country: "USA", city: "Dallas" },
  { country: "USA", city: "San Jose" },
  { country: "China", city: "Beijing" },
  { country: "China", city: "Hangzhou" },
  { country: "China", city: "Tianjin" },
  { country: "China", city: "Guangzhou" },
  { country: "Japan", city: "Nagoya" },
  { country: "Japan", city: "Tokyo" },
  { country: "Japan", city: "Osaka" },
  { country: "UK", city: "London" },
  { country: "UK", city: "Manchester" },
  { country: "France", city: "Toulouse" },
  { country: "France", city: "Nantes" },
  { country: "Germany", city: "Frankfurt" },
  { country: "Germany", city: "Stuttgart" },
  { country: "India", city: "Bangalore" },
  { country: "India", city: "Hyderabad" },
  { country: "Canada", city: "Montreal" },
  { country: "Singapore", city: "Singapore" },
];

const seed_names = [
  "Rodriguez, Figueroa and Sanchez",
  "Doyle Ltd",
  "McClain, Miller and Henderson",
  "Davis and Sons",
  "Guzman, Hoffman and Baldwin",
  "Gardner, Robinson and Lawrence",
  "Blake and Sons",
  "Henderson, Ramirez and Lewis",
  "Garcia-James",
  "Abbott-Munoz",
  "Blair PLC",
  "Dudley Group",
  "Arnold Ltd",
  "McClure, Ward and Lee",
  "Williams and Sons",
  "Galloway-Wyatt",
  "James Group",
  "Flowers, Martin and Kelly",
  "Adams, Zuniga and Wong",
  "Reid, Ferguson and Sanchez",
  "Gray-Mayo",
  "Watts, Robinson and Nguyen",
  "Perez Inc",
  "Morales-Jones",
  "Walter, Edwards and Rios",
  "Wilkerson-Day",
  "Baker and Sons",
  "Hoffman, Baker and Richards",
  "Ross, Robinson and Bright",
  "Snyder, Campos and Callahan",
  "Burton Ltd",
  "Carlson-Cruz",
  "Ferrell, Rice and Maddox",
  "Frazier Inc",
  "Dyer, Potter and Mack",
  "Rodriguez-Graham",
  "Smith-Bowen",
  "Baker, Mason and White",
  "Harrell LLC",
  "Romero, Gonzalez and Brooks",
  "Ryan PLC",
  "George Group",
];

function clamp_int(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function pseudo_rand(seed: number) {
  // 0..1
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function make_company(idx: number): company_row {
  const geo = seed_geo[idx % seed_geo.length];
  const name = seed_names[idx % seed_names.length];

  const level = 1 + (idx % 3); // 1..3
  const founded_year = clamp_int(1900 + pseudo_rand(idx + 13) * 125, 1900, 2024);

  // revenue: 20m..2.2b
  const revenue = clamp_int(20_000_000 + pseudo_rand(idx + 71) * 2_180_000_000, 5_000_000, 3_000_000_000);

  // employees: 50..12,000
  const employees = clamp_int(50 + pseudo_rand(idx + 101) * 11_950, 10, 30_000);

  const code = `c-${String(idx + 1).padStart(4, "0")}`;

  return {
    company_code: code,
    company_name: name,
    level,
    country: geo.country,
    city: geo.city,
    founded_year,
    annual_revenue: revenue,
    employees,
  };
}

// 先生成 50 家公司（你也可以改成 40/60）
export const companies: company_row[] = Array.from({ length: 50 }, (_, i) => make_company(i));
