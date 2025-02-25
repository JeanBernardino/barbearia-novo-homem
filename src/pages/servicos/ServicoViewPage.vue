<template>
  <q-page class="q-pa-md">
    <q-table
      :rows="servicos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :virtual-scroll="true" 
      :virtual-scroll-item-size="50"
      :rows-per-page-options="[0]"
      style="height: 90vh;"
    >
      <template v-slot:top>
        <strong class="q-font-size-lg">Serviços</strong>

        <q-space></q-space>

        <q-btn
          label="Novo"
          @click="addServico"
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
          <q-td :props="props" key="actions">
            <q-btn @click="editServico(props.row.id)" icon="edit" color="primary" flat />
            <q-btn @click="openConfirmDialog(props.row.id)" icon="delete" color="negative" flat />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>

  <!-- ConfirmDialog Component -->
  <ConfirmDialog 
    v-if="showDialog"
    message="Tem certeza que deseja excluir este serviço?"
    :onConfirm="handleConfirm"
    :onClose="handleClose"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';
import { useServicoStore } from 'src/stores/servicos/ServicoStore'
import type { ServicoModel } from 'src/models/servicos/ServicoModel';

const servicoStore = useServicoStore()
const router = useRouter()

const loading = ref(false)
const servicos = computed(() => servicoStore.getAllServicos)

const showDialog = ref(false);
const serviceIdToRemove = ref<string | null>(null);

const columns: {
  name: string;
  label: string;
  align: "left" | "right" | "center";
  field: (row: ServicoModel) => string | number; // Tipo corrigido
  sortable: boolean;
}[] = [
  { name: "nome", label: "Nome", align: "left", field: (row) => row.nome, sortable: true },
  { name: "valor", label: "Preço", align: "right", field: (row) => row.valor, sortable: true }, // Agora corretamente tipado como número
  { name: "actions", label: "Ações", align: "center", field: () => "", sortable: false }
];

onMounted(async () => {
  loading.value = true
  await servicoStore.loadAllServicos()
  loading.value = false
});

const addServico = async () => {
  await router.push('servico')
};

const editServico = async (id: string) => {
  await router.push(`servico/${id}`)
};

const openConfirmDialog = (id: string) => {
  serviceIdToRemove.value = id;
  showDialog.value = true;
};

const handleConfirm = async () => {
  if (serviceIdToRemove.value) {
    await servicoStore.removeServico(serviceIdToRemove.value);
  }
  showDialog.value = false;
}

function handleClose() {
  showDialog.value = false;
}
</script>
