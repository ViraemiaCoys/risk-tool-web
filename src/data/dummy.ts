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

import { users_list_rows } from "@/data/user.mock";
export const users: user_row[] = users_list_rows;

/* =======================
   company types & data
   ======================= */

export type company_row = {
  company_code: string; // c-0001
  company_name: string;
  level: number; // 1..3 (1=top group, 3=operating sub)
  country: string;
  city: string;
  founded_year: number;
  joined_year: number;
  annual_revenue: number;
  employees: number;
};

export type company_relationship_row = {
  company_code: string;
  parent_company: string; // parent company_code
};

type seed_row = { country: string; city: string };

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

function code_of(idx0: number) {
  return `c-${String(idx0 + 1).padStart(4, "0")}`;
}

// 生成策略：3 个集团 + 若干 level2 + 剩余 level3，关系 level1->level2->level3
function make_companies(total: number) {
  const list: company_row[] = [];

  // 可调参数
  const top_groups = 3; // level1 数量
  const level2_per_group_min = 3;
  const level2_per_group_max = 5;

  // 先生 level1
  for (let i = 0; i < top_groups; i++) {
    const idx0 = list.length;
    const geo = seed_geo[(idx0 + 3) % seed_geo.length];
    const name = seed_names[(idx0 + 11) % seed_names.length];

    list.push({
      company_code: code_of(idx0),
      company_name: `${name} Holdings`,
      level: 1,
      country: geo.country,
      city: geo.city,
      founded_year: clamp_int(1950 + pseudo_rand(idx0 + 13) * 60, 1900, 2024),
      joined_year: make_joined_year(idx0),
      annual_revenue: clamp_int(800_000_000 + pseudo_rand(idx0 + 71) * 2_200_000_000, 300_000_000, 3_000_000_000),
      employees: clamp_int(4000 + pseudo_rand(idx0 + 101) * 18000, 1000, 30000),
    });
  }

  // level2，每个集团若干个
  const level2_targets: number[] = [];
  for (let g = 0; g < top_groups; g++) {
    const r = pseudo_rand(900 + g);
    const k = clamp_int(level2_per_group_min + r * (level2_per_group_max - level2_per_group_min), level2_per_group_min, level2_per_group_max);
    level2_targets.push(k);
  }

  const level2_total = level2_targets.reduce((a, b) => a + b, 0);

  for (let i = 0; i < level2_total; i++) {
    const idx0 = list.length;
    const geo = seed_geo[(idx0 + 5) % seed_geo.length];
    const name = seed_names[(idx0 + 17) % seed_names.length];

    list.push({
      company_code: code_of(idx0),
      company_name: `${name} Group`,
      level: 2,
      country: geo.country,
      city: geo.city,
      founded_year: clamp_int(1970 + pseudo_rand(idx0 + 13) * 45, 1900, 2024),
      joined_year: make_joined_year(idx0),
      annual_revenue: clamp_int(150_000_000 + pseudo_rand(idx0 + 71) * 900_000_000, 50_000_000, 1_500_000_000),
      employees: clamp_int(800 + pseudo_rand(idx0 + 101) * 9000, 100, 15000),
    });
  }

  // 剩下的都是 level3
  while (list.length < total) {
    const idx0 = list.length;
    const geo = seed_geo[idx0 % seed_geo.length];
    const name = seed_names[idx0 % seed_names.length];

    list.push({
      company_code: code_of(idx0),
      company_name: name,
      level: 3,
      country: geo.country,
      city: geo.city,
      founded_year: clamp_int(1990 + pseudo_rand(idx0 + 13) * 34, 1900, 2024),
      joined_year: make_joined_year(idx0),
      annual_revenue: clamp_int(20_000_000 + pseudo_rand(idx0 + 71) * 320_000_000, 5_000_000, 600_000_000),
      employees: clamp_int(50 + pseudo_rand(idx0 + 101) * 2950, 10, 6000),
    });
  }

  return { list, top_groups, level2_targets };
}

function make_relationships(companies_list: company_row[], top_groups: number, level2_targets: number[]) {
  const relationships: company_relationship_row[] = [];

  const level1 = companies_list.filter((c) => c.level === 1);
  const level2 = companies_list.filter((c) => c.level === 2);
  const level3 = companies_list.filter((c) => c.level === 3);

  // level2 按目标数量分给各 level1
  let cursor = 0;
  const level2_by_group: company_row[][] = [];

  for (let g = 0; g < top_groups; g++) {
    const k = level2_targets[g];
    const slice = level2.slice(cursor, cursor + k);
    cursor += k;
    level2_by_group.push(slice);

    for (const child of slice) {
      relationships.push({
        company_code: child.company_code,
        parent_company: level1[g].company_code,
      });
    }
  }

  // level3 分给 level2，用 pseudo_rand 保证刷新结果一致
  for (let i = 0; i < level3.length; i++) {
    const child = level3[i];

    // 随机选一个 group
    const g = clamp_int(pseudo_rand(2000 + i) * top_groups, 0, top_groups - 1);
    const candidates = level2_by_group[g];

    // group 没 level2 就挂 level1（理论上不会发生）
    if (!candidates || candidates.length === 0) {
      relationships.push({ company_code: child.company_code, parent_company: level1[g].company_code });
      continue;
    }

    const pick = clamp_int(pseudo_rand(3000 + i) * candidates.length, 0, candidates.length - 1);
    const parent = candidates[pick];

    relationships.push({
      company_code: child.company_code,
      parent_company: parent.company_code,
    });
  }

  return relationships;
}

export const companies: company_row[] = (() => {
  const total = 40;
  const { list } = make_companies(total);
  return list;
})();

export const company_relationships: company_relationship_row[] = (() => {
  const level1_count = companies.filter((c) => c.level === 1).length;

  // 按 companies 里 level2 的顺序重新切片
  const level2_total = companies.filter((c) => c.level === 2).length;

  // 尽量均匀分给各集团
  const base = Math.floor(level2_total / level1_count);
  const rem = level2_total % level1_count;
  const targets = Array.from({ length: level1_count }, (_, i) => base + (i < rem ? 1 : 0));

  return make_relationships(companies, level1_count, targets);
})();

/* =======================
   hierarchy builder
   ======================= */

type bubble_node = {
  name: string;
  company_code?: string;
  country?: string;
  city?: string;
  level?: number;
  annual_revenue?: number;
  employees?: number;
  joined_year?: number;
  children?: bubble_node[];
};

export function build_company_hierarchy(
  companies_list: company_row[],
  relationships: company_relationship_row[]
): bubble_node {
  const by_code = new Map<string, company_row>();
  for (const c of companies_list) by_code.set(c.company_code, c);

  // parent -> children
  const children_by_parent = new Map<string, string[]>();
  const parent_by_child = new Map<string, string>();

  for (const rel of relationships) {
    if (!by_code.has(rel.company_code)) continue;
    if (!by_code.has(rel.parent_company)) continue;

    parent_by_child.set(rel.company_code, rel.parent_company);

    const arr = children_by_parent.get(rel.parent_company) ?? [];
    arr.push(rel.company_code);
    children_by_parent.set(rel.parent_company, arr);
  }

  // 没 parent 的是根，一般是 level1
  const roots = companies_list
    .filter((c) => !parent_by_child.has(c.company_code))
    .map((c) => c.company_code);

  const visited = new Set<string>();

  const make_node = (code: string): bubble_node => {
    const c = by_code.get(code)!;
    visited.add(code);

    const children_codes = children_by_parent.get(code) ?? [];
    const children = children_codes.map(make_node);

    return {
      name: c.company_name,
      company_code: c.company_code,
      country: c.country,
      city: c.city,
      level: c.level,
      annual_revenue: c.annual_revenue,
      employees: c.employees,
      joined_year: c.joined_year,
      children: children.length ? children : undefined,
    };
  };

  const root_children = roots.map(make_node);

  // 孤儿节点（parent 不在列表里）挂到 root
  const orphans = companies_list
    .filter((c) => !visited.has(c.company_code))
    .map((c) => ({
      name: c.company_name,
      company_code: c.company_code,
      country: c.country,
      city: c.city,
      level: c.level,
      annual_revenue: c.annual_revenue,
      employees: c.employees,
      joined_year: c.joined_year,
    }));

  return {
    name: "all companies",
    children: [...root_children, ...orphans],
  };
}
