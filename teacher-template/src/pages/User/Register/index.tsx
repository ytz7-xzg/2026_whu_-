import Footer from '@/components/Footer';
import { register } from '@/services/api/authentication';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history } from '@umijs/max';
import { Button, message } from 'antd';
import React from 'react';
import Settings from '../../../../config/defaultSettings';

const RegisterPage: React.FC = () => {
  const containerClassName = useEmotionCss(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  }));

  const handleSubmit = async (values: {
    username?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    const result = await register({
      username: values.username || '',
      password: values.password || '',
    });
    if (!result) {
      message.error('注册失败，请稍后重试');
      return;
    }
    message.success('注册成功，请登录');
    history.push('/user/login');
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          注册 - {Settings.title}
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
          title="Redlib Notebook"
          subTitle="先注册账号，再使用 web-backend 登录"
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
            render: (_, dom) => [
              ...dom,
              <Button key="back" onClick={() => history.push('/user/login')}>
                返回登录
              </Button>,
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
            placeholder="请输入用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="请输入密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
          <ProFormText.Password
            name="confirmPassword"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="请再次输入密码"
            rules={[{ required: true, message: '请再次输入密码' }]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
