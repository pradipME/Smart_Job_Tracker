import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useToast } from '../ui/Toast';
import { registerSchema, type RegisterFormData } from '../../lib/validations';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';

export function RegisterForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }),
    onSuccess: (res) => {
      const msg = res.data;
      if (msg.includes('already exists')) {
        toast(msg, 'error');
        return;
      }
      toast('Account created! Please sign in.', 'success');
      navigate('/login');
    },
    onError: () => {
      toast('Registration failed. Please try again.', 'error');
    },
  });

  const onSubmit = (data: RegisterFormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
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
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={mutation.isPending} className="w-full">
        <UserPlus className="h-4 w-4" />
        Create Account
      </Button>
    </form>
  );
}
