<template>
  <!-- <q-page padding>
    <q-form>
      <div class="column">
        <div class="column">
          <div class="q-mb-md">
            <q-input v-model="nome" type="text" label="Nome" outlined/>
          </div>

          <div class="q-mb-md">
            <q-input v-model="valor" type="text" label="Preço" prefix="R$" outlined/>
          </div>

          <q-btn color="primary" icon="check" label="Salvar" @click="addServico" />
        </div>
      </div>
    </q-form>
  </q-page> -->

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
            <q-btn @click="editServico(props.row.id)" icon="edit" color="primary" flat />
            <q-btn @click="removeServico(props.row.id)" icon="delete" color="negative" flat />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useServicoStore } from 'src/stores/global/ServicoStore'

const servicoStore = useServicoStore()

const nome = ref('')
const valor = ref(0)

const loading = ref(false)
const servicos = computed(() => servicoStore.getAllServicos)

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
  await servicoStore.addServico(nome.value, valor.value)
  nome.value = ''
  valor.value = 0
};

const editServico = async (id: string) => {
  await servicoStore.editServico(id, nome.value, valor.value)
};

const removeServico = async (id: string) => {
  await servicoStore.removeServico(id)
};
</script>