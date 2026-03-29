import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useLocation, useModel } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';
import Avatar from './AvatarDropdown';

export type SiderTheme = 'light' | 'dark';

type GlobalHeaderRightProps = {
  collapsed?: boolean;
};

const GlobalHeaderRight: React.FC<GlobalHeaderRightProps> = ({ collapsed }) => {
  const wrapperClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      width: '100%',
      padding: '0 12px 10px',
    };
  });

  const actionsClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      gap: 8,
      width: '100%',
      justifyContent: 'center',
    };
  });

  const quickCreateButtonClassName = useEmotionCss(() => {
    return {
      height: 40,
      border: 'none',
      borderRadius: 12,
      background: 'linear-gradient(180deg, #5b87ff 0%, #3f6df6 100%)',
      boxShadow: '0 8px 16px rgba(35, 82, 220, 0.28)',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      '&:hover, &:focus': {
        background: 'linear-gradient(180deg, #6a93ff 0%, #4a77f9 100%)',
        boxShadow: '0 10px 20px rgba(35, 82, 220, 0.32)',
        transform: 'translateY(-1px)',
      },
    };
  });

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      display: 'flex',
      float: 'right',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      cursor: 'pointer',
      padding: '0 12px',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const { initialState } = useModel('@@initialState');
  const location = useLocation();

  if (!initialState || !initialState.settings) {
    return null;
  }

  const showQuickCreate = location.pathname.startsWith('/notebook') && !collapsed;

  return (
    <div className={wrapperClassName}>
      {showQuickCreate ? (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={quickCreateButtonClassName}
          block
          onClick={() => history.push('/notebook/create')}
        >
          新建笔记
        </Button>
      ) : null}
      <div className={actionsClassName}>
        <span
          className={actionClassName}
          onClick={() => {
            window.open('https://pro.ant.design/docs/getting-started');
          }}
        >
          <QuestionCircleOutlined />
        </span>
        <Avatar />
      </div>
    </div>
  );
};

export default GlobalHeaderRight;
