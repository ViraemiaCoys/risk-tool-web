import { useState, useEffect } from 'react';
import { companiesService, type CompanyEntity } from '@/services/companies.service';
import { ApiClientError } from '@/lib/api-client';

export function useCompanies() {
  const [companies, setCompanies] = useState<CompanyEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      const error = err instanceof ApiClientError ? err : new Error('获取公司列表失败');
      setError(error);
      console.error('获取公司列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const refresh = () => {
    fetchCompanies();
  };

  return { companies, loading, error, refresh };
}

export function useCompany(company_code: string | null) {
  const [company, setCompany] = useState<CompanyEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!company_code) {
      setCompany(null);
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companiesService.getByCode(company_code);
        setCompany(data);
      } catch (err) {
        const error = err instanceof ApiClientError ? err : new Error('获取公司详情失败');
        setError(error);
        console.error('获取公司详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [company_code]);

  return { company, loading, error };
}
