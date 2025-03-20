<template>
    <q-page class="q-pa-md">
        <div>
            <q-form ref="crudForm">
                <div class="q-mb-md">
                    <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                            <q-input v-model="filters.startDate" outlined type="date" :rules="[val => !!val || 'Necessário informar uma data de início.']"/>
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
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
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

let servicesChart: Chart | null = null;

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

        // Obter todos os trabalhos no intervalo de datas
        const trabalhosRealizados = await store.getTrabalhosByFuncionarioAndRangeDate('', filters.value.startDate, filters.value.endDate);

        const totalServiceCount = new Map<string, number>(); // Mapa de contagem total de serviços
        const funcionarioServiceMap = new Map<string, Map<string, number>>(); // Mapa de serviços por funcionário
        const funcionarioNamesMap = new Map<string, string>(); // Mapa de nomes de funcionários

        // Iterar pelos trabalhos realizados para preencher os mapas
        for (const trabalho of trabalhosRealizados) {
            let servico = servicoStore.findServicoById(trabalho.servico_id);
            if (servico === null) {
                servico = await servicoStore.getServicoById(trabalho.servico_id);
            }

            const serviceName = servico ? servico.nome : 'Desconhecido';

            // Contagem total de serviços
            totalServiceCount.set(serviceName, (totalServiceCount.get(serviceName) || 0) + 1);

            // Contagem de serviços por funcionário
            if (!funcionarioServiceMap.has(trabalho.funcionario_id)) {
                funcionarioServiceMap.set(trabalho.funcionario_id, new Map());
            }

            const funcionarioServiceCount = funcionarioServiceMap.get(trabalho.funcionario_id);
            if (funcionarioServiceCount) {
                funcionarioServiceCount.set(serviceName, (funcionarioServiceCount.get(serviceName) || 0) + 1);
            }

            // Mapeando o nome do funcionário
            if (!funcionarioNamesMap.has(trabalho.funcionario_id)) {
                let funcionario = await funcionarioStore.getFuncionarioById(trabalho.funcionario_id);
                if (funcionario === null) {
                    funcionario = await funcionarioStore.getFuncionarioById(trabalho.funcionario_id);
                }

                funcionarioNamesMap.set(trabalho.funcionario_id, funcionario?.nome || 'Desconhecido');
            }
        }

        const serviceLabels = Array.from(totalServiceCount.keys());
        const totalServiceData = Array.from(totalServiceCount.values());

        // Dados de cada funcionário por serviço
        const funcionarioLabels = Array.from(funcionarioNamesMap.values());
        const funcionarioServiceData: number[][] = [];

        // Adiciona os dados para cada funcionário
        for (const funcionarioServiceCount of funcionarioServiceMap.values()) {
            const funcionarioData: number[] = serviceLabels.map(service => funcionarioServiceCount.get(service) || 0);
            funcionarioServiceData.push(funcionarioData);
        }

        // Re-criar os gráficos após o filtro
        if (servicesChart) servicesChart.destroy();

        showCharts.value = true;

        await nextTick(() => {
            if (servicesChartCanvas.value) {
                servicesChart = new Chart(servicesChartCanvas.value, {
                    type: 'bar',
                    data: {
                        labels: serviceLabels,
                        datasets: [
                            // Cada funcionário vai ter um dataset, além do total
                            ...funcionarioServiceData.map((data, index) => ({
                                label: `${funcionarioLabels[index]}`,
                                data: data,
                                backgroundColor: `rgba(20, 63, 97, ${0.9 + (index % 5) * 0.1})`,
                                categoryPercentage: 0.8, // Menor valor para que as barras fiquem mais próximas
                                barPercentage: 0.9 // Ajusta o tamanho da barra individual
                            })),
                            {
                                label: "Total de Serviços",
                                data: totalServiceData,
                                backgroundColor: 'rgba(243, 186, 22)',
                                categoryPercentage: 0.8,
                                barPercentage: 0.9
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                            tooltip: { enabled: true }
                        },
                        scales: {
                            x: {
                                stacked: false, // Desabilitar o empilhamento
                            },
                            y: {
                                stacked: false, // Desabilitar o empilhamento
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    precision: 0
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
