"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { companies } from "@/data/dummy";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

function format_money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function company_details_page() {
  const params = useParams(); // { company_code: 'c-0002' }
  const company_code = typeof params?.company_code === "string" ? params.company_code : "";

  const company = React.useMemo(
    () => companies.find((c) => c.company_code === company_code),
    [company_code]
  );

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

  if (!company) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Details
        </Typography>
        <Typography sx={{ opacity: 0.8, mt: 1 }}>
          company code “{company_code}” was not found. please go back to the list and select a company.
        </Typography>
      </Box>
    );
  }

  const profit_efficiency = company.employees > 0 ? company.annual_revenue / company.employees : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
        {company.company_name}
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={1.2}>
            <Typography><b>company code:</b> {company.company_code}</Typography>
            <Typography><b>level:</b> {company.level}</Typography>
            <Typography><b>country:</b> {company.country}</Typography>
            <Typography><b>city:</b> {company.city}</Typography>
            <Typography><b>founded year:</b> {company.founded_year}</Typography>
            <Typography><b>annual revenue:</b> {format_money(company.annual_revenue)}</Typography>
            <Typography><b>employees:</b> {company.employees.toLocaleString("en-US")}</Typography>
            <Typography><b>profit efficiency:</b> {format_money(profit_efficiency)} / employee</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
