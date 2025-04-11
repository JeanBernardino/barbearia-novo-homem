<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-md-6">
                <q-input v-model="filters.startDate" outlined type="date" />
            </div>
    
            <div class="col-12 col-md-6">
                <q-input v-model="filters.endDate" outlined type="date" />
            </div>
    
            <q-select 
                class="col-12 col-md-6"
                outlined 
                v-model="filters.funcionario" 
                :options="funcionarios" 
                label="Barbeiro"
                option-value="id"
                option-label="nome"
                emit-value
                map-options
                placeholder="Todos"
                clearable
            />
    
            <q-select 
                class="col-12 col-md-6"
                outlined 
                v-model="filters.servico" 
                :options="servicos" 
                label="Serviço"
                option-value="id"
                option-label="nome"
                emit-value
                map-options
                clearable
            />
        </div>
  
        <div class="row q-col-gutter-md">
            <div
                v-for="trabalho in filteredTrabalhos"
                :key="trabalho.id"
                class="col-12 col-sm-6 col-md-3"
            >
                <q-card class="q-pa-md">
                    <div class="text-subtitle1 text-primary">
                        <strong>Data: {{ formatFirebaseTimestampToBRDate(trabalho.cadastroData) }}</strong>
                    </div>
                    <div class="q-mt-sm">
                        <q-icon name="person" class="q-mr-sm" color="primary" />
                        <strong>{{ getFuncionarioNome(trabalho.funcionario_id) }}</strong>
                    </div>
                    <div class="q-mt-sm">
                        <q-icon name="content_cut" class="q-mr-sm" color="primary" />
                        <strong>{{ getServicoNome(trabalho.servico_id) }}</strong>
                    </div>
                </q-card>
            </div>
        </div>
    </q-page>
</template>
  

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import type { Timestamp } from "firebase/firestore";

const store = useTrabalhoStore();
const servicoStore = useServicoStore();
const funcionarioStore = useFuncionarioStore();

const loading = ref(false);
const filters = ref({
    startDate: getCurrentDay(),
    endDate: getCurrentDay(),
    servico: '',
    funcionario: ''
})

const trabalhos = computed(() => store.getAllTrabalhos);
const servicos = computed(() => servicoStore.getAllServicosAtivos);
const funcionarios = computed(() => funcionarioStore.getAllFuncionariosAtivos);

onMounted(async () => {
    loading.value = true;
    await store.loadAllTrabalhos();
    await servicoStore.loadAllServicos();
    await funcionarioStore.loadAllFuncionarios();
    loading.value = false;
});

function getCurrentDay() {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;

    return `${year}-${month}-${day}`;
}

const getServicoNome = (id: string): string => {
    const servico = servicos.value.find(s => s.id === id);
    return servico ? servico.nome : '';
};

const getFuncionarioNome = (id: string): string => {
    const funcionario = funcionarios.value.find(f => f.id === id);
    return funcionario ? funcionario.nome : '';
};

function formatFirebaseTimestampToBRDate(timestamp: Timestamp | null): string {
    if (!timestamp) {
        return '';
    }

    const date = timestamp.toDate();
    const dateFormat = new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);

    const timeFormat = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);

    return `${dateFormat} ${timeFormat}`;
}

const filteredTrabalhos = computed(() => {
    return trabalhos.value.filter((trabalho) => {
        const dataTrabalho = trabalho.cadastroData?.toDate();

        if (!dataTrabalho) return false;

        const trabalhoDateString = dataTrabalho.toISOString().slice(0, 10);
        const startDateString = new Date(filters.value.startDate).toISOString().slice(0, 10);
        const endDateString = new Date(filters.value.endDate).toISOString().slice(0, 10);

        if (trabalhoDateString < startDateString || trabalhoDateString > endDateString) {
            return false;
        }

        if (filters.value.servico && trabalho.servico_id !== filters.value.servico) {
            return false;
        }

        if (filters.value.funcionario && trabalho.funcionario_id !== filters.value.funcionario) {
            return false;
        }

        return true;
    });
});

</script>
