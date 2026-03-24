import { login } from '@/services/api/authentication';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { DefaultFooter, LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Button, message } from 'antd';
import React from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const fontFamilyStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => ({
    width: 42,
    height: 42,
    lineHeight: '42px',
    position: 'fixed',
    right: 16,
    borderRadius: token.borderRadius,
    ':hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  return <div className={langClassName}>{SelectLang && <SelectLang />}</div>;
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

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
    '.ant-btn-primary.ant-btn-lg': {
      border: 'none',
      borderRadius: 12,
      boxShadow: '0 8px 16px rgba(58, 103, 242, 0.22)',
      background: 'linear-gradient(180deg, #4f7dff 0%, #3a67f2 100%)',
      fontWeight: 600,
      letterSpacing: '0.01em',
      transition: 'all 0.2s ease',
    },
    '.ant-btn-primary.ant-btn-lg:hover': {
      boxShadow: '0 10px 20px rgba(58, 103, 242, 0.26)',
      background: 'linear-gradient(180deg, #5b87ff 0%, #416df5 100%)',
      transform: 'translateY(-1px)',
    },
    '.ant-btn-primary.ant-btn-lg:focus-visible': {
      boxShadow:
        '0 0 0 3px rgba(111, 155, 255, 0.22), 0 10px 20px rgba(58, 103, 242, 0.24)',
      outline: 'none',
    },
    '.ant-checkbox-wrapper': {
      color: '#6b7280',
      fontSize: 14,
    },
    '.ant-checkbox-inner': {
      borderRadius: 6,
      borderColor: '#c9d3e5',
    },
    '.ant-checkbox-wrapper:hover .ant-checkbox-inner': {
      borderColor: '#7fa2ff',
    },
    '.ant-checkbox-checked .ant-checkbox-inner': {
      borderColor: '#4f7dff',
      backgroundColor: '#4f7dff',
    },
    '.ant-pro-form-login-main-other': {
      marginBlockStart: 18,
      textAlign: 'center',
    },
    '.ant-pro-form-login-main-other .ant-btn-link': {
      padding: 0,
      color: '#5f6b7d',
      fontSize: 14,
    },
    '.ant-pro-form-login-main-other .ant-btn-link:hover': {
      color: '#3b63e6',
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

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((state) => ({
          ...state,
          currentToken: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: { username?: string; password?: string }) => {
    const result = await login({
      userId: values.username || '',
      password: values.password || '',
    });
    if (!result) {
      message.error('登录失败，请检查用户名和密码');
      return;
    }
    message.success('登录成功');
    await fetchUserInfo();
    const urlParams = new URL(window.location.href).searchParams;
    history.push(urlParams.get('redirect') || '/');
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录',
          })}
          {' - '}
          {Settings.title}
        </title>
      </Helmet>
      <Lang />
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
          subTitle="你的想法，值得被认真记录。"
          initialValues={{
            autoLogin: true,
          }}
          onFinish={handleSubmit}
          actions={[
            <Button key="register" type="link" onClick={() => history.push('/user/register')}>
              还没有账号？创建一个。
            </Button>,
          ]}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />

          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              保持登录状态
            </ProFormCheckbox>
          </div>
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

export default Login;
