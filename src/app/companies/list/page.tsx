"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  Chip,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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

export const companies: company_row[] = [
  {
    company_code: "c-0001",
    company_name: "Rodriguez, Figueroa",
    level: 1,
    country: "China",
    city: "Beijing",
    founded_year: 1994,
    annual_revenue: 317_736_000,
    employees: 4606,
  },
  {
    company_code: "c-0002",
    company_name: "Doyle Ltd",
    level: 2,
    country: "Japan",
    city: "Nagoya",
    founded_year: 1917,
    annual_revenue: 429_408_000,
    employees: 889,
  },
  {
    company_code: "c-0003",
    company_name: "McCain, Miller and H",
    level: 2,
    country: "China",
    city: "Hangzhou",
    founded_year: 1954,
    annual_revenue: 894_345_000,
    employees: 310,
  },
  {
    company_code: "c-0004",
    company_name: "Davis and Sons",
    level: 3,
    country: "USA",
    city: "Los Angeles",
    founded_year: 1927,
    annual_revenue: 931_732_000,
    employees: 195,
  },
  {
    company_code: "c-0005",
    company_name: "Guzman, Hoffman and A",
    level: 2,
    country: "USA",
    city: "Dallas",
    founded_year: 1925,
    annual_revenue: 227_886_000,
    employees: 4514,
  },
];

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
  // 关键：取整 + 统一格式化，避免出现一长串小数/奇怪布局
  return Math.round(company.annual_revenue / safe_employees);
}

function profit_efficiency_style(value: number) {
  // 你截图里是“绿色为主，最低一档偏棕色”
  // 这里简单做阈值分段（你后面可以按数据分位数再调）
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

function company_table_row(props: { row: company_row }) {
  const { row } = props;
  const [open, set_open] = React.useState(false);

  const pe_value = calc_profit_efficiency(row);
  const pe_style = profit_efficiency_style(pe_value);

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
      </TableRow>

      <TableRow
        sx={{
          "& > td": { borderBottom: "1px solid rgba(255,255,255,0.06)", py: 0 },
        }}
      >
        <TableCell colSpan={5} sx={{ py: 0 }}>
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

/* =======================
   page
   ======================= */

export default function company_list_page() {
  return (
    <Box sx={{ width: "100%" }}>
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
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Companies
            </Typography>
            <Divider sx={{ mb: 2, opacity: 0.25 }} />

            <TableContainer>
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
                    <TableCell sx={{ width: 120 }}>Level</TableCell>
                    <TableCell sx={{ width: 160 }}>Country</TableCell>
                    <TableCell sx={{ width: 520 }}>
                      Profit Efficiency (annual revenue / employees)
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {companies.map((row) => (
                    <React.Fragment key={row.company_code}>
                      {company_table_row({ row })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
