<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link to="/" style="text-decoration: none; color: inherit;">
            Barbearia Novo Homem
          </router-link>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-scroll-area class="fit">
          <!-- Menu Principal -->
          <q-list padding class="menu-list fit">
            <q-item clickable v-ripple to="/usuarios" v-show="user?.tipo === UsuarioTipo.ADMIN">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>

              <q-item-section>
                Usuários
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/funcionarios" v-show="user?.tipo === UsuarioTipo.ADMIN">
              <q-item-section avatar>
                <q-icon name="badge" />
              </q-item-section>

              <q-item-section>
                Funcionários
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/servicos" v-show="user?.tipo === UsuarioTipo.ADMIN">
              <q-item-section avatar>
                <q-icon name="fact_check" />
              </q-item-section>

              <q-item-section>
                Serviços
              </q-item-section>
            </q-item>

            <q-expansion-item
              expand-separator
              icon="inventory"
              label="Produtos"
              v-show="user?.tipo === UsuarioTipo.ADMIN"
            >
              <q-list>
                <q-item clickable v-ripple to="/categorias" >
                  <q-item-section avatar>
                    <q-icon name="category" />
                  </q-item-section>

                  <q-item-section>
                    Categorias
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple to="/produtos">
                  <q-item-section avatar>
                    <q-icon name="shopping_bag" />
                  </q-item-section>

                  <q-item-section>
                    Produtos
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-item clickable v-ripple to="/pagamentos" v-show="user?.tipo === UsuarioTipo.ADMIN">
              <q-item-section avatar>
                <q-icon name="payments" />
              </q-item-section>

              <q-item-section>
                Pagamentos
              </q-item-section>
            </q-item>

            <q-expansion-item
              expand-separator
              icon="analytics"
              label="Gestão"
              v-show="user?.tipo === UsuarioTipo.ADMIN"
            >
              <q-list>
                <q-item clickable v-ripple to="/gestao/relatorio">
                  <q-item-section avatar>
                    <q-icon name="analytics" />
                  </q-item-section>

                  <q-item-section>
                    Relatório
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple to="/gestao/grafico">
                  <q-item-section avatar>
                    <q-icon name="analytics" />
                  </q-item-section>

                  <q-item-section>
                    Gráfico
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-item clickable v-ripple to="/trabalhos" v-show="user?.tipo === UsuarioTipo.ADMIN">
              <q-item-section avatar>
                <q-icon name="work" />
              </q-item-section>

              <q-item-section>
                Trabalhos
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="onLogout" class="fixed-bottom">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section>
                Logout
              </q-item-section>
            </q-item>
          </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/usuarios/AuthStore';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import { UsuarioTipo } from 'src/models/usuarios/UsuarioTipo';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();

const router = useRouter()
const user = authStore.user;

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function onLogout() {
  try {
    await authStore.logout();
    Notify.create({
      message: 'Logout realizado com sucesso.',
      type: 'positive',
    });
    await router.push('/login')
  } catch {
    Notify.create({
      message: 'Erro ao realizar logout.',
      type: 'negative',
    });
  }
  
}
</script>
