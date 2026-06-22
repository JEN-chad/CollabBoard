import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/ui/AuthLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout title="Register">
      <Card
        variant="elevated"
        rounded="2xl"
        className="w-full p-8 bg-surface/60 backdrop-blur-xl border border-border shadow-2xl animate-scale-up"
      >
        {/* Header inside right panel */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your workspace</h2>
          <p className="text-sm text-textSecondary mt-1.5">
            Get started with real-time collaborative Kanban boards
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/10 p-3.5 text-xs text-danger animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            leftIcon={User}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            leftIcon={Mail}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="•••••••• (Min 6 chars)"
            leftIcon={Lock}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            leftIcon={Lock}
          />

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
            icon={UserPlus}
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        {/* Redirect Link */}
        <div className="mt-6 text-center text-xs text-textSecondary border-t border-border/60 pt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-indigo-400 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default Register;
