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
          Barbearia Novo Homem
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
            <q-item clickable v-ripple to="/funcionarios">
              <q-item-section avatar>
                <q-icon name="badge" />
              </q-item-section>

              <q-item-section>
                Funcionários
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/servicos">
              <q-item-section avatar>
                <q-icon name="fact_check" />
              </q-item-section>

              <q-item-section>
                Serviços
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

            <q-item clickable v-ripple to="/pagamentos">
              <q-item-section avatar>
                <q-icon name="payments" />
              </q-item-section>

              <q-item-section>
                Pagamentos
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple @click="logout" class="fixed-bottom">
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
import { ref } from 'vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function logout() {
  console.log('função de logout')
}
</script>
