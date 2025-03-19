<template>
  <q-page class="q-pa-md">
    <q-table
      :rows="filteredUsuarios"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :virtual-scroll="true" 
      :virtual-scroll-item-size="50"
      :rows-per-page-options="[0]"
      style="height: 90vh;"
    >
      <template v-slot:top>
        <strong class="q-font-size-lg">Usuários</strong>

        <q-space></q-space>

        <q-checkbox v-model="mostrarApenasAtivos" label="Mostrar apenas ativos" class="q-mr-md" />

        <q-btn
          label="Novo"
          @click="onAdd"
          color="primary"
        />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td :props="props" key="nome">
            <strong>{{ props.row.nome }}</strong>
          </q-td>
          <q-td :props="props" key="email">
            <strong>{{ props.row.email }}</strong>
          </q-td>
          <q-td :props="props" key="tipo">
            <strong>{{ props.row.tipo }}</strong>
          </q-td>
          <q-td :props="props" key="ativo">
            <q-icon 
              :name="props.row.ativo ? 'check_circle' : 'cancel'" 
              :color="props.row.ativo ? 'green' : 'red'" 
              size="md"
              class="cursor-pointer"
              @click="onChangeStatus(props.row.id)"
            />
          </q-td>
          <q-td :props="props" key="editar">
            <q-btn @click="onUpdate(props.row.id)" icon="edit" color="primary" flat />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuarioStore } from 'src/stores/usuarios/UsuarioStore';
import type { UsuarioModel } from 'src/models/usuarios/UsuarioModel';

const store = useUsuarioStore();
const router = useRouter();

const loading = ref(false);

const usuarios = computed(() => store.getAllUsuarios);
const mostrarApenasAtivos = ref(true);
const filteredUsuarios = computed(() => {
  return mostrarApenasAtivos.value ? usuarios.value.filter(user => user.ativo) : usuarios.value;
});

const columns: {
  name: string;
  label: string;
  align: 'left' | 'right' | 'center';
  field: (row: UsuarioModel) => string | number | boolean; // Tipo corrigido
  sortable: boolean;
}[] = [
  { name: 'nome', label: 'Nome', align: 'left', field: (row) => row.nome, sortable: true },
  { name: 'email', label: 'E-mail', align: 'right', field: (row) => row.email, sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'right', field: (row) => row.tipo, sortable: true },
  { name: 'ativo', label: 'Ativo', align: 'right', field: (row) => row.ativo, sortable: true },
  { name: 'editar', label: 'Editar', align: 'center', field: () => '', sortable: false }
];

onMounted(async () => {
  loading.value = true;
  await store.loadAllUsuarios();
  loading.value = false;
});

const onAdd = async () => {
  await router.push('usuario');
};

const onUpdate = async (id: string) => {
  await router.push(`usuario/${id}`);
};

const onChangeStatus = async (id: string) => {
  await store.changeStatusUsuario(id);
};

</script>
