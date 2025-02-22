import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/usuarios', component: () => import('pages/UsuarioPage.vue'), meta: { requiresAuth: true } },
      { path: '/funcionarios', component: () => import('pages/FuncionarioPage.vue'), meta: { requiresAuth: true } },
      { path: '/servicos', component: () => import('src/pages/servico/ServicoPage.vue'), meta: { requiresAuth: true }},
      { path: '/pagamentos', component: () => import('pages/PagamentoPage.vue'), meta: { requiresAuth: true } },
      { path: '/produtos', component: () => import('pages/ProdutoPage.vue'), meta: { requiresAuth: true } }
    ],
    meta: { requiresAuth: true }
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
