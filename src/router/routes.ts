import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/funcionarios', component: () => import('pages/FuncionarioPage.vue') },
      { path: '/servicos', component: () => import('pages/ServicoPage.vue') },
      { path: '/pagamentos', component: () => import('pages/PagamentoPage.vue') },
      { path: '/produtos', component: () => import('pages/ProdutoPage.vue') }
    ],
  },

  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },
  
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
