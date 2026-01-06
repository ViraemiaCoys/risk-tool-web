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
 * 不在 dummy.ts 重复维护用户数组，
 * 直接复用你现成的 user.mock.ts
 */
import { users_list_rows } from "@/data/user.mock";

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
  joined_year: number; // 加入供应链网络年份
  annual_revenue: number; // USD
  employees: number;
};

export type company_relationship_row = {
  company_code: string;
  parent_company: string; // "root" or another company_code
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
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function make_joined_year(idx: number) {
  const min_year = 2010;
  const max_year = 2024;

  const r = pseudo_rand(idx + 777);
  const skew = 1 - r * r;
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

  // employees: 80..15000
  const employees = clamp_int(80 + pseudo_rand(idx + 101) * 14_920, 30, 30_000);

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

export const companies: company_row[] = Array.from({ length: 40 }, (_, i) => make_company(i));

/* =======================
   relationships (simulated)
   ======================= */

export const company_relationships: company_relationship_row[] = (() => {
  const ROOT = "root";

  // 让前三个公司当做“集团母公司”
  const parent_a = companies[0]?.company_code ?? "c-0001";
  const parent_b = companies[1]?.company_code ?? "c-0002";
  const parent_c = companies[2]?.company_code ?? "c-0003";

  const rels: company_relationship_row[] = [];

  // 先把三大母公司挂在 root
  rels.push({ company_code: parent_a, parent_company: ROOT });
  rels.push({ company_code: parent_b, parent_company: ROOT });
  rels.push({ company_code: parent_c, parent_company: ROOT });

  // 分配其余公司到三棵树
  for (let i = 3; i < companies.length; i++) {
    const code = companies[i].company_code;

    // 先决定一级 parent
    let parent = parent_a;
    if (i % 3 === 1) parent = parent_b;
    if (i % 3 === 2) parent = parent_c;

    rels.push({ company_code: code, parent_company: parent });
  }

  // 再制造一层：给部分节点挂“二级子公司”
  // 让结构更像真实：不是所有都直接挂母公司
  const candidate_mid_parents = companies
    .slice(6, 18) // 挑一段当中间层
    .map((c) => c.company_code);

  for (let i = 18; i < companies.length; i++) {
    // 让一部分公司改挂到中间层 parent
    const r = pseudo_rand(i + 2025);
    if (r < 0.35) {
      const code = companies[i].company_code;
      const mid_parent = candidate_mid_parents[i % candidate_mid_parents.length];
      // 替换掉原先关系
      const idx = rels.findIndex((x) => x.company_code === code);
      if (idx >= 0) rels[idx] = { company_code: code, parent_company: mid_parent };
    }
  }

  return rels;
})();

/* =======================
   hierarchy builder for d3
   ======================= */

export function build_company_hierarchy(
  input_companies: company_row[],
  relationships: company_relationship_row[]
) {
  const ROOT = "root";

  const by_code = new Map<string, company_row>();
  for (const c of input_companies) by_code.set(c.company_code, c);

  type node = {
    name: string;
    company_code?: string;
    level?: number;
    country?: string;
    city?: string;
    founded_year?: number;
    joined_year?: number;
    annual_revenue?: number;
    employees?: number;
    children: node[];
  };

  const node_by_code = new Map<string, node>();

  function to_node(c: company_row): node {
    return {
      name: c.company_name,
      company_code: c.company_code,
      level: c.level,
      country: c.country,
      city: c.city,
      founded_year: c.founded_year,
      joined_year: c.joined_year,
      annual_revenue: c.annual_revenue,
      employees: c.employees,
      children: [],
    };
  }

  for (const c of input_companies) {
    node_by_code.set(c.company_code, to_node(c));
  }

  const root: node = { name: "root", children: [] };

  // parent -> children codes
  const children_of = new Map<string, string[]>();
  for (const rel of relationships) {
    if (!by_code.has(rel.company_code)) continue; // filtered out

    const parent = rel.parent_company || ROOT;
    const list = children_of.get(parent) ?? [];
    list.push(rel.company_code);
    children_of.set(parent, list);
  }

  const visited = new Set<string>();

  function attach(parent_code: string, parent_node: node) {
    const kids = children_of.get(parent_code) ?? [];
    for (const kid_code of kids) {
      if (visited.has(kid_code)) continue;
      visited.add(kid_code);

      const kid_node = node_by_code.get(kid_code);
      if (!kid_node) continue;

      parent_node.children.push(kid_node);
      attach(kid_code, kid_node);
    }
  }

  // 先挂 root 下的节点
  attach(ROOT, root);

  // 兜底：孤儿节点（父节点不在过滤后的 companies 中）挂回 root
  for (const c of input_companies) {
    if (!visited.has(c.company_code)) {
      const n = node_by_code.get(c.company_code);
      if (n) root.children.push(n);
    }
  }

  return root;
}

/* =======================
   optional helpers for charts
   ======================= */

// donut: level counts
export const company_level_counts = [1, 2, 3].map((lvl) => ({
  level: lvl,
  count: companies.filter((c) => c.level === lvl).length,
}));

// line: joined_year cumulative
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
