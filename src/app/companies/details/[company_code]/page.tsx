"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";

import { useAuth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { companiesService } from "@/services/companies.service";
import { useCompany } from "@/hooks/use-companies";
import type { company_row } from "@/data/dummy";

function format_money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { me } = useAuth();
  const company_code = typeof params?.company_code === "string" ? params.company_code : "";

  const { company, loading, error } = useCompany(company_code);
  
  // 获取公司关系数据
  const [relationships, setRelationships] = React.useState<{
    parent_company: string | null;
    children: string[];
  } | null>(null);
  const [allCompanies, setAllCompanies] = React.useState<company_row[]>([]);
  const [loadingRelationships, setLoadingRelationships] = React.useState(false);

  // 加载关系数据
  React.useEffect(() => {
    if (!company_code) return;
    
    const loadData = async () => {
      try {
        setLoadingRelationships(true);
        const [relationshipsData, companiesList] = await Promise.all([
          companiesService.getCompanyRelationships(company_code),
          companiesService.getAll(),
        ]);
        setRelationships(relationshipsData);
        setAllCompanies(companiesList);
      } catch (error) {
        console.error("获取公司关系失败:", error);
      } finally {
        setLoadingRelationships(false);
      }
    };
    
    loadData();
  }, [company_code]);

  // 获取公司信息（用于显示名称）
  const getCompanyInfo = (code: string | null): company_row | null => {
    if (!code) return null;
    return allCompanies.find((c) => c.company_code === code) || null;
  };

  const parentCompany = getCompanyInfo(relationships?.parent_company || null);
  const childCompanies = (relationships?.children || [])
    .map((code) => getCompanyInfo(code))
    .filter((c): c is company_row => c !== null);

  if (!company_code) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Details
        </Typography>
        <Typography sx={{ opacity: 0.8, mt: 1 }}>
          missing company code in url.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Details
        </Typography>
        <Typography sx={{ opacity: 0.8, mt: 1 }}>
          company code &quot;{company_code}&quot; was not found. please go back to the list and select a company.
        </Typography>
      </Box>
    );
  }

  const target = { company_code: company.company_code };
  const allow_update = can(me, "company:update", target);
  const allow_delete = can(me, "company:delete", target);

  const profit_efficiency = company.employees > 0 ? company.annual_revenue / company.employees : 0;

  const handle_delete = async () => {
    if (!confirm(`确定要删除公司 "${company.company_name}" 吗？此操作不可撤销。`)) {
      return;
    }
    try {
      await companiesService.delete(company.company_code);
      router.push("/companies/list");
    } catch (error) {
      console.error("删除公司失败:", error);
      alert("删除公司失败，请重试");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" fontWeight={900}>
          {company.company_name}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
          {allow_update && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/companies/edit/${company.company_code}`)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
            >
              Edit
            </Button>
          )}
          {allow_delete && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handle_delete}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>company code:</b> {company.company_code}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>level:</b> {company.level}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>country:</b> {company.country}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>city:</b> {company.city}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>founded year:</b> {company.founded_year}</Typography>
            </Grid>
            {company.joined_year ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography><b>joined year:</b> {company.joined_year}</Typography>
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>annual revenue:</b> {format_money(company.annual_revenue)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>employees:</b> {company.employees.toLocaleString("en-US")}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography><b>profit efficiency:</b> {format_money(profit_efficiency)} / employee</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 公司关系信息 */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <BusinessIcon />
            公司层级关系 (Company Hierarchy)
          </Typography>
          
          <Stack spacing={2}>
            {/* 父公司 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                <CorporateFareIcon fontSize="small" />
                父公司 (Parent Company)
              </Typography>
              {loadingRelationships ? (
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  加载中...
                </Typography>
              ) : parentCompany ? (
                <Chip
                  label={`${parentCompany.company_name} (${parentCompany.company_code})`}
                  onClick={() => router.push(`/companies/details/${parentCompany.company_code}`)}
                  sx={{
                    backgroundColor: "rgba(64, 156, 255, 0.2)",
                    color: "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(64, 156, 255, 0.3)",
                    },
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: "italic" }}>
                  无父公司 (Top-level company)
                </Typography>
              )}
            </Box>

            {/* 子公司 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8, display: "flex", alignItems: "center", gap: 0.5 }}>
                <BusinessIcon fontSize="small" />
                子公司 (Child Companies) {childCompanies.length > 0 && `(${childCompanies.length})`}
              </Typography>
              {loadingRelationships ? (
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  加载中...
                </Typography>
              ) : childCompanies.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {childCompanies.map((child) => (
                    <Chip
                      key={child.company_code}
                      label={`${child.company_name} (${child.company_code})`}
                      onClick={() => router.push(`/companies/details/${child.company_code}`)}
                      sx={{
                        backgroundColor: "rgba(255, 214, 0, 0.2)",
                        color: "rgba(255,255,255,0.9)",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(255, 214, 0, 0.3)",
                        },
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: "italic" }}>
                  无子公司 (No child companies)
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
