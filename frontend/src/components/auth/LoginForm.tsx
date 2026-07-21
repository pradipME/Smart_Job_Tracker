import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { loginSchema, type LoginFormData } from '../../lib/validations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LogIn } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (res) => {
      const { token, role } = res.data;
      if (!token || !role) {
        toast('Invalid email or password', 'error');
        return;
      }
      login(token, role as 'ADMIN' | 'CANDIDATE');
      toast('Welcome back!', 'success');
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message
        || error?.response?.data
        || 'Invalid email or password';
      toast(typeof message === 'string' ? message : 'Login failed. Please try again.', 'error');
    },
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={mutation.isPending} className="w-full">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    </form>
  );
}
