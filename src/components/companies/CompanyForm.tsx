"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { companiesService } from "@/services/companies.service";
import type { company_row } from "@/data/dummy";

export type company_form_mode = "create" | "edit";

export type company_form_value = {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  joined_year?: number;
  annual_revenue: number;
  employees: number;
  parent_company?: string | null;
  children?: string[];
};

const country_options = [
  { value: "USA", label: "United States" },
  { value: "China", label: "China" },
  { value: "Japan", label: "Japan" },
  { value: "UK", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
];

const level_options = [
  { value: 1, label: "Level 1 (Top Group)" },
  { value: 2, label: "Level 2 (Sub Group)" },
  { value: 3, label: "Level 3 (Operating Sub)" },
];

export default function CompanyForm(props: {
  mode: company_form_mode;
  initial_value?: Partial<company_form_value>;
  on_submit: (value: company_form_value) => void;
  on_cancel?: () => void;
  on_delete?: () => void;
}) {
  const { mode } = props;

  const currentYear = new Date().getFullYear();

  const [value, set_value] = React.useState<company_form_value>(() => ({
    company_code: "",
    company_name: "",
    level: 1,
    country: "USA",
    city: "",
    founded_year: currentYear,
    joined_year: currentYear,
    annual_revenue: 0,
    employees: 0,
    parent_company: null,
    children: [],
    ...props.initial_value,
  }));

  // 拉公司列表，选父公司用
  const [allCompanies, setAllCompanies] = React.useState<company_row[]>([]);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await companiesService.getAll();
        setAllCompanies(companies);
      } catch (error) {
        console.error("获取公司列表失败:", error);
      }
    };
    fetchCompanies();
  }, []);

  // initial_value 变了就同步
  React.useEffect(() => {
    if (!props.initial_value) return;
    set_value((prev) => ({ ...prev, ...props.initial_value }));
  }, [props.initial_value]);

  // 编辑模式下加载关系数据，只跑一次
  const relationshipsLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (mode === "edit" && value.company_code && !relationshipsLoadedRef.current && allCompanies.length > 0) {
      relationshipsLoadedRef.current = true;
      const loadRelationships = async () => {
        try {
          const relationships = await companiesService.getCompanyRelationships(value.company_code);
          set_value((prev) => ({
            ...prev,
            parent_company: relationships.parent_company,
            children: relationships.children,
          }));
        } catch (error) {
          console.error("获取公司关系失败:", error);
        }
      };
      loadRelationships();
    }
  }, [mode, value.company_code, allCompanies.length]);

  const update = <K extends keyof company_form_value>(key: K, next_value: company_form_value[K]) => {
    set_value((prev) => ({ ...prev, [key]: next_value }));
  };

  const field_sx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.05)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "primary.main" },
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.08)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,0.08)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },
    "& .MuiInputBase-input": {
      color: "rgba(255,255,255,0.9)",
    },
  } as const;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        {mode === "create" ? "Create a new company" : "Edit company"}
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
        Dashboard · Company · {mode === "create" ? "Create" : "Edit"}
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2.5}>
            {/* Row 1: Company Code | Company Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Code"
                fullWidth
                value={value.company_code}
                onChange={(e) => update("company_code", e.target.value)}
                sx={field_sx}
                disabled={mode === "edit"} // 编辑模式下不允许修改 code
                helperText={mode === "edit" ? "Company code cannot be changed" : "e.g., c-0001"}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Company Name"
                fullWidth
                value={value.company_name}
                onChange={(e) => update("company_name", e.target.value)}
                sx={field_sx}
                required
              />
            </Grid>

            {/* Row 2: Level | Country */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Level"
                fullWidth
                value={value.level}
                onChange={(e) => update("level", Number(e.target.value))}
                sx={field_sx}
                SelectProps={{
                  MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                  sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                }}
              >
                {level_options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Country"
                fullWidth
                value={value.country}
                onChange={(e) => update("country", String(e.target.value))}
                sx={field_sx}
                SelectProps={{
                  MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                  sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                }}
              >
                {country_options.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Row 3: City | Founded Year */}
            <Grid item xs={12} md={6}>
              <TextField
                label="City"
                fullWidth
                value={value.city}
                onChange={(e) => update("city", e.target.value)}
                sx={field_sx}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Founded Year"
                fullWidth
                type="number"
                value={value.founded_year}
                onChange={(e) => update("founded_year", Number(e.target.value))}
                sx={field_sx}
                inputProps={{ min: 1800, max: currentYear }}
                required
              />
            </Grid>

            {/* Row 4: Joined Year | Annual Revenue */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Joined Year (Optional)"
                fullWidth
                type="number"
                value={value.joined_year || ""}
                onChange={(e) => update("joined_year", e.target.value ? Number(e.target.value) : undefined)}
                sx={field_sx}
                inputProps={{ min: 1800, max: currentYear }}
                helperText="Year when company joined the group"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Revenue (USD)"
                fullWidth
                type="number"
                value={value.annual_revenue}
                onChange={(e) => update("annual_revenue", Number(e.target.value))}
                sx={field_sx}
                inputProps={{ min: 0, step: 1000 }}
                required
                helperText="Annual revenue in USD"
              />
            </Grid>

            {/* Row 5: Employees */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Employees"
                fullWidth
                type="number"
                value={value.employees}
                onChange={(e) => update("employees", Number(e.target.value))}
                sx={field_sx}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            {/* Row 6: Parent Company */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="父公司 (Parent Company)"
                fullWidth
                value={value.parent_company || ""}
                onChange={(e) => update("parent_company", e.target.value || null)}
                sx={field_sx}
                helperText="选择此公司的上级公司（用于 bubble chart 层级关系）"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => {
                    if (!v) return "无 (None)";
                    const c = allCompanies.find((x) => x.company_code === v);
                    return c ? `${c.company_name} (${c.company_code})` : v;
                  },
                  MenuProps: { sx: { "& .MuiPaper-root": { bgcolor: "background.paper" } } },
                  sx: { "& .MuiSelect-select": { color: "rgba(255,255,255,0.9)" } },
                }}
              >
                <MenuItem value="">
                  <em>无 (None)</em>
                </MenuItem>
                {allCompanies
                  .filter((c) => c.company_code !== value.company_code)
                  .map((c) => (
                    <MenuItem key={c.company_code} value={c.company_code}>
                      {c.company_name} ({c.company_code})
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            {/* Row 7: Children Companies - 普通输入框，逗号分隔公司代码 */}
            <Grid item xs={12} md={6}>
              <TextField
                label="子公司 (Child Companies)"
                fullWidth
                value={(value.children ?? []).join(", ")}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const codes = raw ? raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean) : [];
                  update("children", codes);
                }}
                sx={field_sx}
                placeholder="e.g., c-0002, c-0004, c-0010"
                helperText="输入公司代码，逗号分隔（用于 bubble chart 层级关系）"
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="flex-start"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 3 }}
          >
            {props.on_delete ? (
              <Button
                variant="contained"
                color="error"
                onClick={props.on_delete}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", md: "auto" } }}
              >
                Delete company
              </Button>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              {props.on_cancel ? (
                <Button
                  variant="outlined"
                  onClick={props.on_cancel}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={() => props.on_submit(value)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
              >
                {mode === "create" ? "Create company" : "Save changes"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
