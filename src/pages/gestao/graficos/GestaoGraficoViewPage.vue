<template>
    <q-page class="q-pa-md">
        <div>
            <q-form ref="crudForm">
                <div class="q-mb-md">
                    <div class="row q-col-gutter-md">
                        <div class="col-12">
                            <q-select 
                                outlined 
                                v-model="filters.funcionario_id" 
                                :options="funcionarios" 
                                label="Barbeiro"
                                option-value="id"
                                option-label="nome"
                                emit-value
                                map-options
                                placeholder="Todos"
                                clearable
                            />
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input v-model="filters.startDate" outlined type="date" :rules="[val => !!val || 'Necessário informar uma data de fim.']"/>
                        </div>

                        <div class="col-12 col-md-6">
                            <q-input v-model="filters.endDate" outlined type="date" :rules="[val => !!val || 'Necessário informar uma data de fim.']"/>
                        </div>
                    </div>

                    <q-btn @click="onFilterConfirm" label="Filtrar" color="primary" />
                </div>
            </q-form>
        </div>

        <div v-if="showCharts">
            <div class="row q-col-gutter-md">
                <div class="col-12">
                    <canvas ref="servicesChartCanvas"></canvas>
                </div>
                <div class="col-12">
                    <canvas ref="valuesChartCanvas"></canvas>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { Notify, QForm } from 'quasar';

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useTrabalhoStore();
const funcionarioStore = useFuncionarioStore();
const servicoStore = useServicoStore();
const crudForm = ref<QForm>();

const funcionarios = computed(() => funcionarioStore.getAllFuncionariosAtivos);

onMounted(async () => {
    await funcionarioStore.loadAllFuncionarios();
});

const filters = ref({
    funcionario_id: '',
    startDate: getFirstDayOfMonth(),
    endDate: getLastDayOfMonth(),
});

const showCharts = ref(false);

const servicesChartCanvas = ref<HTMLCanvasElement | null>(null);
const valuesChartCanvas = ref<HTMLCanvasElement | null>(null);

let servicesChart: Chart | null = null;
let valuesChart: Chart | null = null;

function getFirstDayOfMonth() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
}

function getLastDayOfMonth() {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toISOString().slice(0, 10);
}

const onFilterConfirm = async () => {
    try {
        const isValid = await crudForm.value?.validate(true);
        if (crudForm.value && !isValid) {
            return;
        }

        const funcionarioId = filters.value.funcionario_id;

        const trabalhosRealizados = await store.getTrabalhosByFuncionarioAndRangeDate(funcionarioId, filters.value.startDate, filters.value.endDate);
        const serviceCountMap = new Map<string, number>(); // Mapa para contar a quantidade de serviços
        const valorTotalMap = new Map<string, number>(); // Mapa para armazenar o valor total de cada serviço
        const comissaoTotalMap = new Map<string, number>(); // Mapa para armazenar o total de comissão de cada serviço
        let totalValorTotal = 0; // Total acumulado de valores
        let totalComissaoTotal = 0; // Total acumulado de comissões

        // Iterar pelos trabalhos realizados
        for (const trabalho of trabalhosRealizados) {
            // Obter o serviço correspondente ao ID
            let servico = servicoStore.findServicoById(trabalho.servico_id);
            if (servico === null) {
                servico = await servicoStore.getServicoById(trabalho.servico_id);
            }

            const serviceName = servico ? servico.nome : ''; // Nome do serviço ou "Desconhecido" caso não encontre
            
            // Atualizando a contagem de serviços
            serviceCountMap.set(serviceName, (serviceCountMap.get(serviceName) || 0) + 1);

            // Verificar se o valor do serviço já foi somado anteriormente
            if (!valorTotalMap.has(serviceName)) {
                valorTotalMap.set(serviceName, trabalho.servico_valor);
            } else {
                valorTotalMap.set(serviceName, valorTotalMap.get(serviceName)! + trabalho.servico_valor);
            }
            
            // Verificando se o valor da comissão foi calculado corretamente
            const comissao = trabalho.servico_valor * (trabalho.funcionario_comissao / 100);
            if (!comissaoTotalMap.has(serviceName)) {
                comissaoTotalMap.set(serviceName, comissao);
            } else {
                comissaoTotalMap.set(serviceName, comissaoTotalMap.get(serviceName)! + comissao);
            }

            totalValorTotal += trabalho.servico_valor;
            totalComissaoTotal += comissao;
        }

        // Criando os gráficos
        const serviceLabels = Array.from(serviceCountMap.keys());
        const serviceData = Array.from(serviceCountMap.values());

        // Re-criar os gráficos após o filtro
        if (servicesChart) servicesChart.destroy();
        if (valuesChart) valuesChart.destroy();

        showCharts.value = true; // Mostrar os gráficos logo após o filtro

        // Usar nextTick para garantir que o DOM esteja atualizado
        await nextTick(() => {
            if (servicesChartCanvas.value) {
                servicesChart = new Chart(servicesChartCanvas.value, {
                    type: 'bar',
                    data: {
                    labels: serviceLabels,
                    datasets: [
                        {
                            label: "Serviços",
                            data: serviceData,
                            backgroundColor: 'rgba(20, 63, 97)',
                        }
                    ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                            tooltip: { enabled: true }
                        }
                    }
                });
            }

            if (valuesChartCanvas.value) {
                valuesChart = new Chart(valuesChartCanvas.value, {
                    type: 'bar',
                    data: {
                    labels: ['Serviços', 'Barbeiro'],
                    datasets: [
                        {
                            label: 'Valores',
                            data: [totalValorTotal, totalComissaoTotal],
                            backgroundColor: ['rgba(33, 186, 69)', 'rgba(243, 186, 22)'],
                        }
                    ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.raw as number;
                                        return `R$ ${value.toFixed(2)}`; 
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        Notify.create({
            message: 'Não foi possível obter os dados para o relatório!',
            type: 'negative'
        });
    }
};

</script>
