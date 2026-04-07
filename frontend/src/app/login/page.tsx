'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, message, Segmented } from 'antd';
import { apiFetch } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        message.error(data?.error || 'Request failed');
        return;
      }
      setAuthToken(data.token);
      message.success(mode === 'login' ? 'Logged in successfully' : 'Account created');
      router.push('/');
    } catch {
      message.error('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 16px' }}>
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Segmented
            value={mode}
            onChange={v => setMode(v as Mode)}
            options={[
              { label: 'Login', value: 'login' },
              { label: 'Register', value: 'register' },
            ]}
          />
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          {mode === 'register' && (
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="yourname" />
            </Form.Item>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            {mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

