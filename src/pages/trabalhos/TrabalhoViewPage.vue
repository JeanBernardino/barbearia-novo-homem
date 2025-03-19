<template>
    <q-page class="q-pa-md">
        <q-table
            :rows="trabalhos"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :virtual-scroll="true" 
            :virtual-scroll-item-size="50"
            :rows-per-page-options="[0]"
            style="height: 90vh;"
        >
            <template v-slot:top>
                <strong class="q-font-size-lg">Trabalhos</strong>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td :props="props" key="funcionario">
                        {{ getFuncionarioNome(props.row.funcionario_id) }}
                    </q-td>
                    <q-td :props="props" key="comissao">
                        {{ props.row.funcionario_comissao }}%
                    </q-td>
                    <q-td :props="props" key="servico">
                        {{ getServicoNome(props.row.servico_id) }}
                    </q-td>
                    <q-td :props="props" key="comissao">
                        R$ {{ props.row.servico_valor.toFixed(2).replace('.', ',')  }}
                    </q-td>
                    <q-td :props="props" key="excluir">
                        <q-btn @click="onDelete(props.row)" icon="delete" color="negative" flat />
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <ConfirmDialog
            v-model="isConfirmDialogOpen"
            :message="'Deseja remover este trabalho?'"
            :confirmar-text="'Sim'"
            :cancel-text="'Não'"
            :onConfirm="removeTrabalho" 
            :onClose="closeConfirmDialog"
        />
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';

const store = useTrabalhoStore();
const servicoStore = useServicoStore();
const funcionarioStore = useFuncionarioStore();

const loading = ref(false);
const trabalhoToRemove = ref('');
const isConfirmDialogOpen = ref(false);

const trabalhos = computed(() => store.getAllTrabalhos);
const servicos = computed(() => servicoStore.getAllServicos);
const funcionarios = computed(() => funcionarioStore.getAllFuncionarios);

const columns: {
    name: string;
    label: string;
    align: 'left' | 'right' | 'center';
    field: (row: TrabalhoModel) => string | number | boolean; // Tipo corrigido
    sortable: boolean;
}[] = [
    { name: 'funcionario', label: 'Funcionário', align: 'left', field: (row) => row.funcionario_id, sortable: true },
    { name: 'comissao', label: 'Comissão', align: 'left', field: (row) => row.funcionario_comissao, sortable: true },
    { name: 'servico', label: 'Serviço', align: 'left', field: (row) => row.servico_id, sortable: true },
    { name: 'valor', label: 'Valor serviço', align: 'left', field: (row) => row.servico_valor, sortable: true },
    { name: 'excluir', label: 'Excluir', align: 'center', field: () => '', sortable: false }
];

onMounted(async () => {
    loading.value = true;
    await store.loadAllTrabalhos();
    await servicoStore.loadAllServicos();
    await funcionarioStore.loadAllFuncionarios();
    loading.value = false;
});

const onDelete = (trabalho: TrabalhoModel) => {
    trabalhoToRemove.value = trabalho.id;
    isConfirmDialogOpen.value = true;
};

const removeTrabalho = async () => {
    if (trabalhoToRemove.value !== '') {
        await store.removeTrabalho(trabalhoToRemove.value);
    }

    isConfirmDialogOpen.value = false;
};

const closeConfirmDialog = () => {
    trabalhoToRemove.value = '';
    isConfirmDialogOpen.value = false;
};


const getServicoNome = (id: string): string => {
    const servico = servicos.value.find(s => s.id === id);
    return servico ? servico.nome : '';
};

const getFuncionarioNome = (id: string): string => {
    const funcionario = funcionarios.value.find(f => f.id === id);
    return funcionario ? funcionario.nome : '';
};

</script>
