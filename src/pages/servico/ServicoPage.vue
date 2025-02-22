<template>
  <q-page class="q-pa-md">
    <q-table
      class="my-table"
      :rows="servicos"
      :columns="columns"
      row-key="nome"
      :loading="loading"
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
            <!-- <q-btn @click="editServico(props.row.id)" icon="edit" color="primary" flat /> -->
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
//import { useRouter } from 'vue-router';
import { useServicoStore } from 'src/stores/global/ServicoStore'

const servicoStore = useServicoStore()
//const router = useRouter()

const loading = ref(false)
const servicos = computed(() => servicoStore.getAllServicos)

const showDialog = ref(false);
const serviceIdToRemove = ref<string | null>(null); // Armazena o id do serviço a ser removido

const columns: { 
  name: string;
  label: string;
  align: "left" | "right" | "center";
  field: string;
}[] = [
  { name: 'nome', label: 'Nome', align: 'left', field: 'nome' },
  { name: 'valor', label: 'Preço', align: 'right', field: 'valor' },
  { name: 'actions', label: 'Ações', align: 'center', field: 'actions' }
]

onMounted(async () => {
  loading.value = true
  await servicoStore.loadServicos()
  loading.value = false
});

const addServico = async () => {
  //router.push('servicos')
};

// const editServico = async (id: string) => {
//   await servicoStore.editServico(id, nome.value, valor.value)
// };

const openConfirmDialog = (id: string) => {
  serviceIdToRemove.value = id;
  showDialog.value = true;
};

const handleConfirm = async () => {
  if (serviceIdToRemove.value) {
    await servicoStore.removeServico(serviceIdToRemove.value);
    console.log("Serviço removido!");
  }
  showDialog.value = false; // Fecha o diálogo após confirmação
}

function handleClose() {
  console.log("Cancelado!");
  showDialog.value = false; // Fecha o diálogo
}
</script>