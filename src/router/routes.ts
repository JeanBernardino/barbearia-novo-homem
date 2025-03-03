import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/usuarios', component: () => import('pages/UsuarioPage.vue'), meta: { requiresAuth: true } },
      
      { path: '/funcionarios', component: () => import('src/pages/funcionarios/FuncionarioViewPage.vue'), meta: { requiresAuth: true } },
      { path: '/funcionario', component: () => import('src/pages/funcionarios/FuncionarioCadastroPage.vue'), meta: { requiresAuth: true } },

      { path: '/servicos', component: () => import('pages/servicos/ServicoViewPage.vue'), meta: { requiresAuth: true }},
      { path: '/servico/:id?', component: () => import('pages/servicos/ServicoCadastroPage.vue'), meta: { requiresAuth: true } },

      { path: '/pagamentos', component: () => import('pages/pagamentos/PagamentoViewPage.vue'), meta: { requiresAuth: true } },
      { path: '/pagamento/:id?', component: () => import('pages/pagamentos/PagamentoCadastroPage.vue'), meta: { requiresAuth: true } },

      { path: '/produtos', component: () => import('pages/produtos/ProdutoViewPage.vue'), meta: { requiresAuth: true } },
      { path: '/produto/:id?', component: () => import('pages/produtos/ProdutoCadastroPage.vue'), meta: { requiresAuth: true } },

      { path: '/categorias', component: () => import('pages/categorias/CategoriaViewPage.vue'), meta: { requiresAuth: true } },
      { path: '/categoria/:id?', component: () => import('pages/categorias/CategoriaCadastroPage.vue'), meta: { requiresAuth: true } },
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
