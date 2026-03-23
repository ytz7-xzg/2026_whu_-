import { logout } from '@/services/api/authentication';
import { LogoutOutlined } from '@ant-design/icons';
import { setAlpha } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel } from '@umijs/max';
import { Avatar, Spin } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const Name = () => {
  const { initialState } = useModel('@@initialState');
  const { currentToken } = initialState || {};

  const nameClassName = useEmotionCss(({ token }) => ({
    width: '90px',
    height: '48px',
    overflow: 'hidden',
    lineHeight: '48px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    [`@media only screen and (max-width: ${token.screenMD}px)`]: {
      display: 'none',
    },
  }));

  return <span className={`${nameClassName} anticon`}>{currentToken?.userName || currentToken?.userCode}</span>;
};

const AvatarLogo = () => {
  const avatarClassName = useEmotionCss(({ token }) => ({
    marginRight: '8px',
    color: token.colorPrimary,
    verticalAlign: 'top',
    background: setAlpha(token.colorBgContainer, 0.85),
    [`@media only screen and (max-width: ${token.screenMD}px)`]: {
      margin: 0,
    },
  }));

  return (
    <Avatar
      size="small"
      className={avatarClassName}
      src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
      alt="avatar"
    />
  );
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const actionClassName = useEmotionCss(({ token }) => ({
    display: 'flex',
    height: '48px',
    marginLeft: 'auto',
    overflow: 'hidden',
    alignItems: 'center',
    padding: '0 8px',
    cursor: 'pointer',
    borderRadius: token.borderRadius,
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  const { initialState, setInitialState } = useModel('@@initialState');

  const loginOut = async () => {
    await logout();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      if (event.key === 'logout') {
        flushSync(() => {
          setInitialState((state) => ({ ...state, currentToken: undefined }));
        });
        void loginOut();
      }
    },
    [setInitialState],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentToken } = initialState;
  if (!currentToken || (!currentToken.userName && !currentToken.userCode)) {
    return loading;
  }

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: [
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
          },
        ],
      }}
    >
      <span className={actionClassName}>
        <AvatarLogo />
        <Name />
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
