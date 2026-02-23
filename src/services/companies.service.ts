import { apiClient } from "@/lib/api-client";
import type { company_relationship_row, company_row } from "@/data/dummy";

type RelationshipEntry = {
  company_code?: string;
  child_company_code?: string;
  parent_company?: string | null;
  parent_company_code?: string | null;
};

type CountEntry = {
  key: string;
  count: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const isCountEntryArray = (value: unknown): value is CountEntry[] =>
  Array.isArray(value) &&
  value.every(
    (item) => isRecord(item) && typeof item.key === "string" && typeof item.count === "number"
  );

const normalizeRelationshipEntry = (entry: RelationshipEntry): company_relationship_row => ({
  company_code:
    typeof entry.company_code === "string"
      ? entry.company_code
      : typeof entry.child_company_code === "string"
        ? entry.child_company_code
        : "",
  parent_company:
    typeof entry.parent_company === "string"
      ? entry.parent_company
      : typeof entry.parent_company_code === "string"
        ? entry.parent_company_code
        : "",
});

const mapRelationshipEntries = (entries: unknown[]): company_relationship_row[] =>
  entries
    .filter((entry): entry is RelationshipEntry => isRecord(entry))
    .map(normalizeRelationshipEntry);

// 跟后端 DTO 一致
export type CreateCompanyDto = {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  joined_year?: number;
  annual_revenue: number;
  employees: number;
};

export type UpdateCompanyDto = Partial<CreateCompanyDto>;

// 后端返回的公司，带扩展字段
export type CompanyEntity = company_row & {
  created_at?: string;
  updated_at?: string;
};

export const companiesService = {
  // 获取所有公司
  async getAll(): Promise<CompanyEntity[]> {
    return apiClient.get<CompanyEntity[]>('/companies');
  },

  // 获取单个公司
  async getByCode(company_code: string): Promise<CompanyEntity> {
    return apiClient.get<CompanyEntity>(`/companies/${company_code}`);
  },

  // 创建公司
  async create(data: CreateCompanyDto): Promise<CompanyEntity> {
    return apiClient.post<CompanyEntity>('/companies', data);
  },

  // 更新公司
  async update(company_code: string, data: UpdateCompanyDto): Promise<CompanyEntity> {
    return apiClient.patch<CompanyEntity>(`/companies/${company_code}`, data);
  },

  // 删除公司
  async delete(company_code: string): Promise<void> {
    return apiClient.delete<void>(`/companies/${company_code}`);
  },

  // 批量删除公司
  async deleteMany(company_codes: string[]): Promise<void> {
    const codesParam = company_codes.join(',');
    return apiClient.delete<void>(`/companies/batch/delete?codes=${codesParam}`);
  },

  // 公司关系
  // 拉全部关系
  async getRelationships(): Promise<company_relationship_row[]> {
    const result = await apiClient.get<unknown>("/companies/relationships");

    if (process.env.NODE_ENV === "development") {
      console.log("[getRelationships] 后端原始返回:", result);
    }

    if (Array.isArray(result)) {
      return mapRelationshipEntries(result);
    }

    if (isRecord(result) && Array.isArray(result.data)) {
      return mapRelationshipEntries(result.data);
    }

    console.warn("[getRelationships] 无法识别的数据格式，返回空数组。原始数据:", result);
    return [];
  },

  // 某公司的父子关系
  async getCompanyRelationships(company_code: string): Promise<{
    parent_company: string | null;
    children: string[];
  }> {
    const allRelationships = await this.getRelationships();
    const parent = allRelationships.find(r => r.company_code === company_code)?.parent_company || null;
    const children = allRelationships.filter(r => r.parent_company === company_code).map(r => r.company_code);
    return { parent_company: parent, children };
  },

  // 批量改关系
  async updateCompanyRelationships(
    company_code: string,
    data: {
      parent_company_code: string | null;
      child_company_codes: string[];
    }
  ): Promise<void> {
    return apiClient.patch(`/companies/${company_code}/relationships`, data);
  },

  // 单个改关系（内部走批量接口）
  async updateCompanyRelationship(company_code: string, parent_company: string | null): Promise<void> {
    // 先拿到当前子公司
    const currentRelationships = await this.getCompanyRelationships(company_code);
    return this.updateCompanyRelationships(company_code, {
      parent_company_code: parent_company,
      child_company_codes: currentRelationships.children || [],
    });
  },

  // Dashboard
  // 拉统计
  async getDashboardStats(): Promise<{
    company_count: number;
    employees_sum: number;
    revenue_sum: number;
    countries_covered: number;
    company_series: number[];
    employees_series: number[];
    revenue_series: number[];
    countries_series: number[];
  }> {
    return apiClient.get('/companies/dashboard/stats');
  },

  // 级别分布
  async getLevelDistribution(): Promise<{
    l1: number;
    l2: number;
    l3: number;
    total: number;
  }> {
    return apiClient.get('/companies/dashboard/level-distribution');
  },

  // 累积增长
  async getCumulativeGrowth(start_year: number, end_year: number): Promise<{
    years: number[];
    cumulative: number[];
  }> {
    const result = await apiClient.get<unknown>(
      `/companies/dashboard/cumulative-growth?start_year=${start_year}&end_year=${end_year}`
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[getCumulativeGrowth] 后端原始返回:", result);
    }

    if (isRecord(result)) {
      const { years, cumulative } = result;
      if (isNumberArray(years) && isNumberArray(cumulative)) {
        return { years, cumulative };
      }
    }

    console.warn("[getCumulativeGrowth] 数据格式不正确，返回空数据");
    return { years: [], cumulative: [] };
  },

  // 按条件过滤的公司（bar 图用）
  async getFilteredCompanies(request: {
    dimension: 'level' | 'country' | 'city';
    filter: {
      level: number[];
      country: string[];
      city: string[];
      joined_year?: { start?: number; end?: number };
      annual_revenue?: { min?: number; max?: number };
      employees?: { min?: number; max?: number };
    };
  }): Promise<{
    labels: string[];
    counts: number[];
  }> {
    const result = await apiClient.post<unknown>("/companies/dashboard/filter", request);

    if (process.env.NODE_ENV === "development") {
      console.log("[getFilteredCompanies] 后端原始返回:", JSON.stringify(result, null, 2));
    }

    if (isRecord(result)) {
      const data = result.data;
      if (isRecord(data) && !Array.isArray(data)) {
        const labels = Object.keys(data).sort();
        const counts = labels.map((key) => {
          const companies = data[key];
          return Array.isArray(companies) ? companies.length : 0;
        });
        return { labels, counts };
      }

      const groupsValue = result.groups;
      const countsValue = result.counts;

      if (isStringArray(groupsValue) && isCountEntryArray(countsValue)) {
        const counts = groupsValue.map((group) => {
          const entry = countsValue.find((item) => item.key === group);
          return entry?.count ?? 0;
        });
        return { labels: groupsValue, counts };
      }

      if (isStringArray(groupsValue) && isNumberArray(countsValue)) {
        return { labels: groupsValue, counts: countsValue };
      }

      const labelsValue = result.labels;
      if (isStringArray(labelsValue) && isNumberArray(countsValue)) {
        return { labels: labelsValue, counts: countsValue };
      }
    }

    console.warn("[getFilteredCompanies] ❌ 无法识别的数据格式，返回空数组。原始数据:", result);
    return { labels: [], counts: [] };
  },
};
