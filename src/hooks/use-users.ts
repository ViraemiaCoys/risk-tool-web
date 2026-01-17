import { useState, useEffect } from 'react';
import { usersService, type UserEntity } from '@/services/users.service';
import { ApiClientError } from '@/lib/api-client';

export function useUsers() {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      const error = err instanceof ApiClientError ? err : new Error('获取用户列表失败');
      setError(error);
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refresh = () => {
    fetchUsers();
  };

  return { users, loading, error, refresh };
}

export function useUser(user_id: string | null) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user_id) {
      setUser(null);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await usersService.getById(user_id);
        setUser(data);
      } catch (err) {
        const error = err instanceof ApiClientError ? err : new Error('获取用户详情失败');
        setError(error);
        console.error('获取用户详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user_id]);

  return { user, loading, error };
}
