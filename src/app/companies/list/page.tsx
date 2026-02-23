"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Collapse,
  Chip,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";

import { useAuth } from "@/auth/auth.context";
import { can } from "@/auth/rbac";
import { companiesService } from "@/services/companies.service";
import { useCompanies } from "@/hooks/use-companies";
import CompanyQuickEditDialog from "@/components/companies/CompanyQuickEditDialog";

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

/* =======================
   helpers
   ======================= */

const currency_int = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function calc_profit_efficiency(company: company_row) {
  const safe_employees = company.employees > 0 ? company.employees : 1;
  // 取整格式化，避免一堆小数
  return Math.round(company.annual_revenue / safe_employees);
}

function profit_efficiency_style(value: number) {
  // 绿色为主，最低档偏棕，可按分位数再调
  if (value >= 500_000) {
    return { bg: "rgba(46, 125, 50, 0.35)", border: "rgba(46, 125, 50, 0.55)" };
  }
  if (value >= 120_000) {
    return { bg: "rgba(46, 125, 50, 0.22)", border: "rgba(46, 125, 50, 0.40)" };
  }
  return { bg: "rgba(141, 110, 99, 0.35)", border: "rgba(141, 110, 99, 0.55)" };
}

/* =======================
   row component
   ======================= */

function CompanyTableRow(props: {
  row: company_row;
  on_refresh?: () => void;
  on_quick_edit?: (row: company_row) => void;
}) {
  const { row, on_refresh, on_quick_edit } = props;
  const router = useRouter();
  const { me } = useAuth();
  const [open, set_open] = React.useState(false);
  const [menu_anchor, set_menu_anchor] = React.useState<null | HTMLElement>(null);

  const pe_value = calc_profit_efficiency(row);
  const pe_style = profit_efficiency_style(pe_value);

  const target = { company_code: row.company_code };
  const allow_update = can(me, "company:update", target);
  const allow_delete = can(me, "company:delete", target);

  const open_menu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    set_menu_anchor(event.currentTarget);
  };

  const close_menu = () => {
    set_menu_anchor(null);
  };

  const go_quick_edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    on_quick_edit?.(row);
  };

  const go_full_edit = () => {
    router.push(`/companies/edit/${row.company_code}`);
    close_menu();
  };

  const handle_delete = async () => {
    if (!confirm(`确定要删除公司 "${row.company_name}" 吗？此操作不可撤销。`)) {
      close_menu();
      return;
    }
    try {
      await companiesService.delete(row.company_code);
      on_refresh?.();
      close_menu();
    } catch (error) {
      console.error("删除公司失败:", error);
      alert("删除公司失败，请重试");
      close_menu();
    }
  };

  return (
    <>
      <TableRow
        hover
        sx={{
          "& > td": { borderBottom: "1px solid rgba(255,255,255,0.06)" },
        }}
      >
        <TableCell sx={{ width: 54 }}>
          <IconButton
            size="small"
            onClick={() => set_open((p) => !p)}
            aria-label={open ? "collapse row" : "expand row"}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ fontWeight: 600 }}>
          <Box
            component={Link}
            href={`/companies/details/${row.company_code}`}
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            {row.company_name}
          </Box>
        </TableCell>
        <TableCell sx={{ width: 120 }}>{row.level}</TableCell>
        <TableCell sx={{ width: 160 }}>{row.country}</TableCell>

        <TableCell sx={{ width: 520 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              backgroundColor: pe_style.bg,
              border: `1px solid ${pe_style.border}`,
              minWidth: 320,
            }}
          >
            <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              {currency_int.format(pe_value)}
            </Typography>
            <Typography sx={{ ml: 0.75, opacity: 0.85, whiteSpace: "nowrap" }}>
              / employee
            </Typography>
          </Box>
        </TableCell>

        <TableCell align="right">
          {allow_update ? (
            <Tooltip title="Quick edit">
              <IconButton size="small" onClick={go_quick_edit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 40, height: 40 }} />
          )}
        </TableCell>

        <TableCell align="right">
          {(allow_update || allow_delete) ? (
            <>
              <Tooltip title="Actions">
                <IconButton size="small" onClick={open_menu}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={menu_anchor}
                open={Boolean(menu_anchor)}
                onClose={close_menu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    bgcolor: "rgba(20,20,20,0.98)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 2,
                  },
                }}
              >
                {allow_update && (
                  <MenuItem onClick={go_full_edit}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Full edit
                  </MenuItem>
                )}
                {allow_delete && (
                  <MenuItem onClick={handle_delete} sx={{ color: "error.main" }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                    Delete
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ width: 40, height: 40 }} />
          )}
        </TableCell>
      </TableRow>

      <TableRow
        sx={{
          "& > td": { borderBottom: "1px solid rgba(255,255,255,0.06)", py: 0 },
        }}
      >
        <TableCell colSpan={7} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Company Code: ${row.company_code}`} size="small" />
                <Chip label={`City: ${row.city}`} size="small" />
                <Chip label={`Founded Year: ${row.founded_year}`} size="small" />
                <Chip label={`Employees: ${row.employees.toLocaleString("en-US")}`} size="small" />
                <Chip label={`Annual Revenue: ${currency_int.format(row.annual_revenue)}`} size="small" />
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function CompanyCardItem(props: {
  row: company_row;
  on_refresh?: () => void;
  on_quick_edit?: (row: company_row) => void;
}) {
  const { row, on_refresh, on_quick_edit } = props;
  const router = useRouter();
  const { me } = useAuth();
  const [menu_anchor, set_menu_anchor] = React.useState<null | HTMLElement>(null);

  const pe_value = calc_profit_efficiency(row);
  const pe_style = profit_efficiency_style(pe_value);

  const target = { company_code: row.company_code };
  const allow_update = can(me, "company:update", target);
  const allow_delete = can(me, "company:delete", target);

  const open_menu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    set_menu_anchor(event.currentTarget);
  };

  const close_menu = () => set_menu_anchor(null);

  const go_details = () => router.push(`/companies/details/${row.company_code}`);

  const go_full_edit = () => {
    router.push(`/companies/edit/${row.company_code}`);
    close_menu();
  };

  const handle_delete = async () => {
    if (!confirm(`确定要删除公司 "${row.company_name}" 吗？此操作不可撤销。`)) {
      close_menu();
      return;
    }
    try {
      await companiesService.delete(row.company_code);
      on_refresh?.();
      close_menu();
    } catch (error) {
      console.error("删除公司失败:", error);
      alert("删除公司失败，请重试");
      close_menu();
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 3, backgroundColor: "rgba(255,255,255,0.03)" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {row.company_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {row.country} · {row.city}
              </Typography>
            </Box>

            <Chip label={`level ${row.level}`} size="small" />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`code: ${row.company_code}`} size="small" />
            <Chip label={`employees: ${row.employees.toLocaleString("en-US")}`} size="small" />
            <Chip label={`founded: ${row.founded_year}`} size="small" />
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              backgroundColor: pe_style.bg,
              border: `1px solid ${pe_style.border}`,
              minWidth: 0,
            }}
          >
            <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              {currency_int.format(pe_value)}
            </Typography>
            <Typography sx={{ ml: 0.75, opacity: 0.85, whiteSpace: "nowrap" }}>
              / employee
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              size="small"
              onClick={go_details}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
            >
              view details
            </Button>

            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              {allow_update ? (
                <Tooltip title="Quick edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      on_quick_edit?.(row);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}

              {(allow_update || allow_delete) ? (
                <>
                  <Tooltip title="Actions">
                    <IconButton size="small" onClick={open_menu}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={menu_anchor}
                    open={Boolean(menu_anchor)}
                    onClose={close_menu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      sx: {
                        bgcolor: "rgba(20,20,20,0.98)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 2,
                      },
                    }}
                  >
                    {allow_update && (
                      <MenuItem onClick={go_full_edit}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Full edit
                      </MenuItem>
                    )}
                    {allow_delete && (
                      <MenuItem onClick={handle_delete} sx={{ color: "error.main" }}>
                        <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                        Delete
                      </MenuItem>
                    )}
                  </Menu>
                </>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

/* =======================
   page
   ======================= */

export default function CompanyListPage() {
  const router = useRouter();
  const theme = useTheme();
  const is_md_up = useMediaQuery(theme.breakpoints.up("md"));
  const { me } = useAuth();
  const { companies, loading, error, refresh } = useCompanies();

  const [quick_edit_open, set_quick_edit_open] = React.useState(false);
  const [quick_edit_company, set_quick_edit_company] = React.useState<company_row | null>(null);

  const open_quick_edit = (row: company_row) => {
    set_quick_edit_company(row);
    set_quick_edit_open(true);
  };

  const close_quick_edit = () => {
    set_quick_edit_open(false);
    set_quick_edit_company(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Companies
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            management · company · list
          </Typography>
        </Box>

        {/* 只有有权限的用户才显示创建按钮 */}
        {can(me, "company:create") ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/companies/create")}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            add company
          </Button>
        ) : null}
      </Stack>

      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 3,
            backgroundImage: "none",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <CardContent sx={{ pt: 2 }}>
            <Divider sx={{ mb: 2, opacity: 0.25 }} />

            {loading ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  加载中...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "error.main", mb: 1 }}>
                  加载失败: {error.message}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 2 }}>
                  请确保后端服务正在运行 (http://localhost:3001)
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => refresh()}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  重试
                </Button>
              </Box>
            ) : is_md_up ? (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          borderBottom: "1px solid rgba(255,255,255,0.10)",
                          fontWeight: 700,
                          opacity: 0.9,
                        },
                      }}
                    >
                      <TableCell sx={{ width: 54 }} />
                      <TableCell>Name</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Level</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>Country</TableCell>
                      <TableCell sx={{ minWidth: 320 }}>
                        Profit Efficiency (annual revenue / employees)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Edit</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            暂无公司数据
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((row) => (
                        <CompanyTableRow
                          key={row.company_code}
                          row={row}
                          on_refresh={refresh}
                          on_quick_edit={open_quick_edit}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : companies.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  暂无公司数据
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {companies.map((row) => (
                  <CompanyCardItem
                    key={row.company_code}
                    row={row}
                    on_refresh={refresh}
                    on_quick_edit={open_quick_edit}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Quick Edit Dialog */}
      <CompanyQuickEditDialog
        open={quick_edit_open}
        company={
          quick_edit_company
            ? {
                company_code: quick_edit_company.company_code,
                company_name: quick_edit_company.company_name,
                level: quick_edit_company.level,
              }
            : null
        }
        on_close={close_quick_edit}
        on_submit={async (updated) => {
          if (!quick_edit_company) return;
          try {
            await companiesService.update(quick_edit_company.company_code, {
              company_name: updated.company_name,
              level: updated.level,
            });
            refresh();
            close_quick_edit();
          } catch (error) {
            console.error("更新公司失败:", error);
            alert("更新公司失败，请重试");
          }
        }}
      />
    </Box>
  );
}
