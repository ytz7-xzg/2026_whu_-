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
        redirect: '/notebook/index',
      },
      {
        path: '/notebook/index',
        name: 'index',
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
    redirect: '/notebook/index',
  },
  {
    path: '*',
    // Non-core: fallback route for invalid URLs.
    layout: false,
    component: './404',
  },
];
