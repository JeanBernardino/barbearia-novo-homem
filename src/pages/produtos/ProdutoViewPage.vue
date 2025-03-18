<template>
  <q-page class="q-pa-md">
    <q-table
      :rows="produtos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :virtual-scroll="true" 
      :virtual-scroll-item-size="50"
      :rows-per-page-options="[0]"
      style="height: 90vh;"
    >
      <template v-slot:top>
        <strong class="q-font-size-lg">Produtos</strong>

        <q-space></q-space>

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
          <q-td :props="props" key="valor">
            R$ {{ props.row.valor }}
          </q-td>
          <q-td :props="props" key="categoria">
            {{ getCategoriaNome(props.row.categoria_id) }}
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useProdutoStore } from 'src/stores/produtos/ProdutoStore';
import { useCategoriaStore } from 'src/stores/categorias/CategoriaStore';
import type { ProdutoModel } from 'src/models/produtos/ProdutoModel';

const store = useProdutoStore();
const categoriaStore = useCategoriaStore();
const router = useRouter();

const loading = ref(false);
const produtos = computed(() => store.getAllProdutos);
const categorias = computed(() => categoriaStore.getAllCategorias);

const columns: {
  name: string;
  label: string;
  align: 'left' | 'right' | 'center';
  field: (row: ProdutoModel) => string | number | boolean;
  sortable: boolean;
}[] = [
  { name: 'nome', label: 'Nome', align: 'left', field: (row) => row.nome, sortable: true },
  { name: 'valor', label: 'Preço', align: 'right', field: (row) => row.valor, sortable: true },
  { name: 'categoria', label: 'Categoria', align: 'right', field: (row) => row.categoria_id, sortable: true },
  { name: 'ativo', label: 'Ativo', align: 'right', field: (row) => row.ativo, sortable: true },
  { name: 'editar', label: 'Editar', align: 'center', field: () => '', sortable: false }
];

onMounted(async () => {
  loading.value = true;
  await store.loadAllProdutos();
  await categoriaStore.loadAllCategorias();
  loading.value = false;
});

const onAdd = async () => {
  await router.push('produto');
};

const onUpdate = async (id: string) => {
  await router.push(`produto/${id}`);
};

const onChangeStatus = async (id: string) => {
  await store.changeStatusProduto(id);
};

const getCategoriaNome = (categoriaId: string): string => {
  const categoria = categorias.value.find(c => c.id === categoriaId);
  return categoria ? categoria.nome : '';
};

</script>
