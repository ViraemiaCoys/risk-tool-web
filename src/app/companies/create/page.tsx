"use client";

import { useRouter } from "next/navigation";
import { companiesService } from "@/services/companies.service";
import CompanyForm, { type company_form_value } from "@/components/companies/CompanyForm";
import RequirePermission from "@/auth/RequirePermission";
import { getErrorMessage } from "@/lib/error-utils";

export default function CompaniesCreatePage() {
  const router = useRouter();

  return (
    <RequirePermission action="company:create">
      <CompanyForm
        mode="create"
        initial_value={{
          company_code: "",
          company_name: "",
          level: 1,
          country: "USA",
          city: "",
          founded_year: new Date().getFullYear(),
          joined_year: new Date().getFullYear(),
          annual_revenue: 0,
          employees: 0,
        }}
        on_submit={async (value: company_form_value) => {
          try {
            // 先创公司
            await companiesService.create({
              company_code: value.company_code,
              company_name: value.company_name,
              level: value.level,
              country: value.country,
              city: value.city,
              founded_year: value.founded_year,
              joined_year: value.joined_year,
              annual_revenue: value.annual_revenue,
              employees: value.employees,
            });

            // 再更新关系
            await companiesService.updateCompanyRelationships(value.company_code, {
              parent_company_code: value.parent_company || null,
              child_company_codes: value.children || [],
            });

            router.push("/companies/list");
          } catch (error) {
            console.error("创建公司失败:", error);
            alert(getErrorMessage(error, "创建公司失败，请重试"));
          }
        }}
        on_cancel={() => router.push("/companies/list")}
      />
    </RequirePermission>
  );
}
