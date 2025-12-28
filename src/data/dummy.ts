/* =======================
   users (list/edit pages)
   ======================= */

export type user_status = "active" | "pending" | "banned";

export type user_row = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: user_status;
};

/**
 * 这里不再在 dummy.ts 里重复维护用户数组，
 * 直接复用你现成的 user.mock.ts 里的 users_list_rows
 */
import { users_list_rows } from "@/data/user.mock";

// ✅ 兼容你当前代码：很多页面写的是 import { users } from "@/data/dummy"
export const users: user_row[] = users_list_rows;

/* =======================
   company types & data
   ======================= */

export type company_row = {
  company_code: string;
  company_name: string;
  level: number; // 1..3
  country: string;
  city: string;
  founded_year: number;
  joined_year: number; // ✅ 新增：加入供应链网络年份（用于右侧折线图）
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

/**
 * 生成 joined_year 的策略：
 * - 范围固定在 2010..2024（更“均匀”且更像真实 onboarding）
 * - 用 pseudo_rand 保证每次重启数据稳定（不会刷新就变）
 */
function make_joined_year(idx: number) {
  const min_year = 2010;
  const max_year = 2024;

  // 0..1 稳定随机
  const r = pseudo_rand(idx + 777);

  // 用平方把概率往“后期”挤：r^2 更偏小 -> 反过来 (1 - r^2) 更偏大
  const skew = 1 - r * r; // 更偏向 1
  const year = Math.round(min_year + skew * (max_year - min_year));

  return clamp_int(year, min_year, max_year);
}

function make_company(idx: number): company_row {
  const geo = seed_geo[idx % seed_geo.length];
  const name = seed_names[idx % seed_names.length];

  const level = 1 + (idx % 3); // 1..3
  const founded_year = clamp_int(1900 + pseudo_rand(idx + 13) * 125, 1900, 2024);

  const joined_year = make_joined_year(idx);

  // revenue: 20m..2.2b
  const revenue = clamp_int(
    20_000_000 + pseudo_rand(idx + 71) * 2_180_000_000,
    5_000_000,
    3_000_000_000
  );

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
    joined_year,
    annual_revenue: revenue,
    employees,
  };
}

// ✅ 你说想要 40 条左右：这里改成 40（你也可以随时改回 50）
export const companies: company_row[] = Array.from({ length: 40 }, (_, i) => make_company(i));

/* =======================
   helpers for charts (optional exports)
   ======================= */

// donut: 不同 level 占比
export const company_level_counts = [1, 2, 3].map((lvl) => ({
  level: lvl,
  count: companies.filter((c) => c.level === lvl).length,
}));

// line: 按 joined_year 统计每年新增 & 累积
export const cumulative_companies_by_year = (() => {
  const years = Array.from(new Set(companies.map((c) => c.joined_year))).sort((a, b) => a - b);

  const add_by_year = years.map((y) => ({
    year: y,
    added: companies.filter((c) => c.joined_year === y).length,
  }));

  let cum = 0;
  const cumulative = add_by_year.map((r) => {
    cum += r.added;
    return { year: r.year, cumulative: cum, added: r.added };
  });

  return cumulative;
})();
