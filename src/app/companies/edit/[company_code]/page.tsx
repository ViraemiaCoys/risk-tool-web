"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import { useAuth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { useCompany } from "@/hooks/use-companies";
import { companiesService } from "@/services/companies.service";
import { getErrorMessage } from "@/lib/error-utils";

import CompanyForm, { type company_form_value } from "@/components/companies/CompanyForm";

export default function CompaniesEditPage() {
  const params = useParams<{ company_code: string }>();
  const router = useRouter();
  const { me } = useAuth();

  const company_code = params.company_code;
  const { company: target_company, loading, error } = useCompany(company_code);

  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  if (error || !target_company) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              Company not found
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Company with code &quot;{company_code}&quot; does not exist.
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => router.push("/companies/list")}
            >
              Back to companies
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const target = { company_code: target_company.company_code };
  const allowed_update = can(me, "company:update", target);
  const allowed_delete = can(me, "company:delete", target);

  if (!allowed_update) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              Access denied
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              You don&apos;t have permission to edit this company.
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => router.push("/companies/list")}
            >
              Back to companies
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <CompanyForm
        mode="edit"
        initial_value={{
          company_code: target_company.company_code,
          company_name: target_company.company_name,
          level: target_company.level,
          country: target_company.country,
          city: target_company.city,
          founded_year: target_company.founded_year,
          joined_year: target_company.joined_year,
          annual_revenue: target_company.annual_revenue,
          employees: target_company.employees,
        }}
        on_submit={async (value: company_form_value) => {
          try {
            // 先更新公司
            await companiesService.update(target_company.company_code, {
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
            await companiesService.updateCompanyRelationships(target_company.company_code, {
              parent_company_code: value.parent_company || null,
              child_company_codes: value.children || [],
            });

            router.push("/companies/list");
          } catch (error) {
            console.error("更新公司失败:", error);
            alert(getErrorMessage(error, "更新公司失败，请重试"));
          }
        }}
        on_cancel={() => router.push("/companies/list")}
        on_delete={
          allowed_delete
            ? async () => {
                if (!confirm(`确定要删除公司 "${target_company.company_name}" 吗？此操作不可撤销。`)) {
                  return;
                }
                try {
                  await companiesService.delete(target_company.company_code);
                  router.push("/companies/list");
                } catch (error) {
                  console.error("删除公司失败:", error);
                  alert("删除公司失败，请重试");
                }
              }
            : undefined
        }
      />
    </Box>
  );
}
