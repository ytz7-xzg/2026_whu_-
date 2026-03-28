import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { MenuDataItem } from '@umijs/route-utils';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { getCurrentUser } from './services/api/authentication';

const authPaths = ['/user/login', '/user/register'];

type NotebookRecentNote = {
  id: API.ID;
  title: string;
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentToken?: API.Token;
  loading?: boolean;
  notebookRecentNotes?: NotebookRecentNote[];
  fetchUserInfo?: () => Promise<API.Token | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      return await getCurrentUser({
        skipErrorHandler: true,
      });
    } catch (_error) {
      history.push('/user/login');
      return undefined;
    }
  };

  const { location } = history;
  if (!authPaths.includes(location.pathname)) {
    const currentToken = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentToken,
      notebookRecentNotes: [],
      settings: defaultSettings,
    };
  }

  return {
    fetchUserInfo,
    notebookRecentNotes: [],
    settings: defaultSettings,
  };
}

const injectNotebookMenu = (menuData: MenuDataItem[], recentNotes: NotebookRecentNote[]) => {
  const recentMenus: MenuDataItem[] = recentNotes.length
    ? recentNotes.map((item) => ({
        path: `/notebook/edit/${item.id}`,
        name: item.title || '未命名笔记',
      }))
    : [
        {
          path: '/notebook/recent-empty',
          name: '暂无笔记',
          disabled: true,
        },
      ];

  const output: MenuDataItem[] = [];

  menuData.forEach((menuItem) => {
    if (menuItem.path !== '/notebook') {
      output.push(menuItem);
      return;
    }

    const notebookChildren = (menuItem.children || []).map((child) => {
      if (child.path !== '/notebook/notes') return child;

      return {
        ...child,
        children: [
          {
            path: '/notebook/notes',
            name: '全部笔记',
          },
          {
            path: '/notebook/recent-title',
            name: '最近笔记',
            disabled: true,
          },
          ...recentMenus,
        ],
      };
    });

    output.push(...notebookChildren);
  });

  return output;
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => ({
  token: {
    colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
    colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
    colorTextAppListIcon: 'rgba(255,255,255,0.85)',
    sider: {
      colorBgCollapsedButton: '#fff',
      colorTextCollapsedButtonHover: 'rgba(0,0,0,0.65)',
      colorTextCollapsedButton: 'rgba(0,0,0,0.45)',
      colorMenuBackground: '#004FD9',
      colorBgMenuItemCollapsedHover: 'rgba(255,255,255,0.16)',
      colorBgMenuItemCollapsedSelected: 'rgba(255,255,255,0.22)',
      colorBgMenuItemCollapsedElevated: 'rgba(0,0,0,0.85)',
      colorMenuItemDivider: 'rgba(255,255,255,0.2)',
      colorBgMenuItemHover: 'rgba(255,255,255,0.12)',
      colorBgMenuItemSelected: 'rgba(255,255,255,0.2)',
      colorTextMenuSelected: '#ffffff',
      colorTextMenuItemHover: 'rgba(255,255,255,0.95)',
      colorTextMenu: 'rgba(255,255,255,0.9)',
      colorTextMenuSecondary: 'rgba(255,255,255,0.7)',
      colorTextMenuTitle: 'rgba(255,255,255,0.98)',
      colorTextMenuActive: 'rgba(255,255,255,1)',
      colorTextSubMenuSelected: '#ffffff',
    },
  },
  menuDataRender: (menuData) =>
    injectNotebookMenu(menuData, initialState?.notebookRecentNotes || []),
  rightContentRender: () => <RightContent />,
  waterMarkProps: {
    content: initialState?.currentToken?.userName || initialState?.currentToken?.userCode,
  },
  footerRender: () => <Footer />,
  onPageChange: () => {
    const { location } = history;
    if (!initialState?.currentToken && !authPaths.includes(location.pathname)) {
      history.push('/user/login');
    }
  },
  layoutBgImgList: [
    {
      src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
      left: 85,
      bottom: 100,
      height: '303px',
    },
    {
      src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
      bottom: -68,
      right: -45,
      height: '303px',
    },
    {
      src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
      bottom: 0,
      left: 0,
      width: '331px',
    },
  ],
  menuHeaderRender: undefined,
  childrenRender: (children) => <>{children}</>,
  ...initialState?.settings,
});

export const request = {
  ...errorConfig,
};
