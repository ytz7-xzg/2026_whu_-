import { registerUser } from '@/services/api/authentication';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { DefaultFooter, LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history } from '@umijs/max';
import { Button, message } from 'antd';
import React from 'react';
import Settings from '../../../../config/defaultSettings';

const fontFamilyStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif';

type RegisterFormValues = {
  username?: string;
  password?: string;
  confirmPassword?: string;
};

const RegisterPage: React.FC = () => {
  const containerClassName = useEmotionCss(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
    backgroundColor: '#f5f7fa',
    fontFamily: fontFamilyStack,
    '.ant-pro-form-login-container': {
      fontFamily: fontFamilyStack,
    },
    '.ant-pro-form-login-main': {
      border: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: 20,
      boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)',
      padding: '28px 24px 22px',
      backgroundColor: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'saturate(160%) blur(6px)',
    },
    '.ant-pro-form-login-title': {
      color: '#1f2937',
      fontWeight: 700,
      fontSize: 42,
      letterSpacing: '0.04em',
      lineHeight: 1.18,
      fontFamily: fontFamilyStack,
    },
    '.ant-pro-form-login-desc': {
      marginBlockStart: 14,
      marginBlockEnd: 34,
      color: '#6b7280',
      fontSize: 17,
      letterSpacing: '0.01em',
    },
    '.ant-form-item': {
      marginBottom: 18,
    },
    '.ant-input-affix-wrapper-lg': {
      borderColor: '#d4dbe6',
      borderRadius: 12,
      backgroundColor: '#fbfcfe',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
      transition: 'all 0.2s ease',
    },
    '.ant-input-affix-wrapper-lg:hover': {
      borderColor: '#b8c5da',
      backgroundColor: '#ffffff',
    },
    '.ant-input-affix-wrapper-focused, .ant-input-affix-wrapper-lg:focus, .ant-input-affix-wrapper-lg:focus-within': {
      borderColor: '#6f9bff',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(111, 155, 255, 0.18)',
    },
    '.ant-input-affix-wrapper .anticon': {
      color: '#94a3b8',
    },
    '.ant-input': {
      color: '#1f2937',
      fontSize: 15,
    },
    '.ant-input::placeholder': {
      color: '#a8b1bf',
    },
    '.register-actions': {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 12,
      marginTop: 6,
    },
    '.register-actions .ant-btn': {
      height: 40,
      borderRadius: 12,
      fontWeight: 500,
      fontSize: 15,
      transition: 'all 0.2s ease',
    },
    '.register-actions .ant-btn-primary': {
      border: 'none',
      boxShadow: '0 8px 16px rgba(58, 103, 242, 0.22)',
      background: 'linear-gradient(180deg, #4f7dff 0%, #3a67f2 100%)',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    '.register-actions .ant-btn-primary:hover': {
      boxShadow: '0 10px 20px rgba(58, 103, 242, 0.26)',
      background: 'linear-gradient(180deg, #5b87ff 0%, #416df5 100%)',
      transform: 'translateY(-1px)',
    },
    '.register-actions .ant-btn-default': {
      borderColor: '#d4dbe6',
      color: '#5f6b7d',
      backgroundColor: '#ffffff',
    },
    '.register-actions .ant-btn-default:hover': {
      borderColor: '#b8c5da',
      color: '#3f4b5f',
      backgroundColor: '#f9fbff',
    },
    '.ant-pro-global-footer': {
      fontFamily: fontFamilyStack,
    },
    '.ant-pro-global-footer-copyright': {
      color: '#8b94a4',
      letterSpacing: '0.01em',
      fontSize: 13,
    },
  }));

  const handleSubmit = async (values: RegisterFormValues) => {
    const username = values.username?.trim() || '';
    const password = values.password || '';

    const result = await registerUser({
      username,
      password,
    });

    if (!result.success) {
      message.error(result.message || '注册失败，请稍后重试');
      return;
    }

    message.success(result.message || '注册成功，请登录');
    history.push('/user/login');
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          创建账号 - {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="MyNote"
          subTitle="创建你的专属记录空间。"
          submitter={{
            render: () => [
              <div key="register-actions" className="register-actions">
                <Button type="primary" htmlType="submit">
                  创建账号
                </Button>
                <Button htmlType="reset">重置</Button>
                <Button onClick={() => history.push('/user/login')}>返回登录</Button>
              </div>,
            ],
          }}
          onFinish={handleSubmit}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="设置用户名"
            rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="设置密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <ProFormText.Password
            name="confirmPassword"
            dependencies={['password']}
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="再次输入密码"
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          />
        </LoginForm>
      </div>
      <DefaultFooter
        style={{
          background: 'none',
        }}
        copyright="© 2026 MyNote"
      />
    </div>
  );
};

export default RegisterPage;
