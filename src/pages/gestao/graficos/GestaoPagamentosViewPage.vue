<template>
    <q-page class="q-pa-md">
        <div>
            <q-form ref="crudForm">
                <div class="q-mb-md">
                    <div class="row q-col-gutter-md">
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
                    <canvas ref="paymentMethodsChartCanvas"></canvas>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { usePagamentoStore } from 'src/stores/pagamentos/PagamentoStore';
import { Notify, QForm } from 'quasar';

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const store = useTrabalhoStore();
const pagamentoStore = usePagamentoStore();
const crudForm = ref<QForm>();

const filters = ref({
    funcionario_id: '',
    startDate: getFirstDayOfMonth(),
    endDate: getLastDayOfMonth(),
});

const showCharts = ref(false);

const paymentMethodsChartCanvas = ref<HTMLCanvasElement | null>(null);
let paymentMethodsChart: Chart | null = null;

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
        
        const paymentMethodsMap = new Map<string, number>(); // Mapa para contabilizar as formas de pagamento

        // Iterar pelos trabalhos realizados
        for (const trabalho of trabalhosRealizados) {
            const pagamentoId = trabalho.pagamento_id; // Pegando o pagamento_id

            // Buscar o nome da forma de pagamento a partir do pagamento_id
            let formaPagamento = pagamentoStore.findPagamentoById(pagamentoId);
            if (formaPagamento === null) {
                formaPagamento = await pagamentoStore.getPagamentoById(pagamentoId);
            }
            
            // Verifica se o pagamento foi encontrado e extrai o nome
            const formaPagamentoNome = formaPagamento ? formaPagamento.nome : '';

            // Atualizando a contagem das formas de pagamento
            paymentMethodsMap.set(formaPagamentoNome, (paymentMethodsMap.get(formaPagamentoNome) || 0) + 1);
        }

        // Criando o gráfico
        const paymentLabels = Array.from(paymentMethodsMap.keys());
        const paymentData = Array.from(paymentMethodsMap.values());

        // Re-criar o gráfico após o filtro
        if (paymentMethodsChart) paymentMethodsChart.destroy();

        showCharts.value = true; // Mostrar o gráfico logo após o filtro

        // Usar nextTick para garantir que o DOM esteja atualizado
        await nextTick(() => {
            if (paymentMethodsChartCanvas.value) {
                paymentMethodsChart = new Chart(paymentMethodsChartCanvas.value, {
                    type: 'bar',
                    data: {
                    labels: paymentLabels,
                    datasets: [
                        {
                            label: "Formas de Pagamento",
                            data: paymentData,
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
