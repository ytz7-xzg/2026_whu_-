/**
 * Notebook course routes: login + notebook only.
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        name: 'register',
        path: '/user/register',
        component: './User/Register',
      },
    ],
  },
  {
    path: '/notebook',
    name: 'notebook',
    icon: 'book',
    routes: [
      {
        path: '/notebook',
        redirect: '/notebook/notes',
      },
      {
        path: '/notebook/index',
        redirect: '/notebook/notes',
      },
      {
        path: '/notebook/notes',
        name: '我的笔记',
        component: './notebook/index',
      },
      {
        path: '/notebook/stats',
        name: '统计',
        component: './notebook/index',
      },
      {
        path: '/notebook/categories',
        name: '分类管理',
        component: './notebook/index',
      },
      {
        path: '/notebook/create',
        name: 'create',
        hideInMenu: true,
        component: './notebook/create',
      },
      {
        path: '/notebook/edit/:id',
        name: 'edit',
        hideInMenu: true,
        component: './notebook/edit',
      },
    ],
  },
  {
    path: '/',
    redirect: '/notebook/notes',
  },
  {
    path: '*',
    // Non-core: fallback route for invalid URLs.
    layout: false,
    component: './404',
  },
];
