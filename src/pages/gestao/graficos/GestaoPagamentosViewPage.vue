<template>
    <q-page class="q-pa-md">
      <div>
        <q-form ref="crudForm">
          <div class="q-mb-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="filters.startDate"
                  outlined
                  type="date"
                  :rules="[val => !!val || 'Necessário informar uma data de início.']"
                />
              </div>
  
              <div class="col-12 col-md-6">
                <q-input
                  v-model="filters.endDate"
                  outlined
                  type="date"
                  :rules="[val => !!val || 'Necessário informar uma data de fim.']"
                />
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
  import {
    Chart,
    BarController,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';
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
      if (crudForm.value && !isValid) return;
  
      const funcionarioId = filters.value.funcionario_id;
      const trabalhosRealizados = await store.getTrabalhosByFuncionarioAndRangeDate(
        funcionarioId,
        filters.value.startDate,
        filters.value.endDate
      );
  
      const paymentMethodsCountMap = new Map<string, number>();
      const paymentMethodsValueMap = new Map<string, number>();
  
      for (const trabalho of trabalhosRealizados) {
        const pagamentoId = trabalho.pagamento_id;
  
        let formaPagamento = pagamentoStore.findPagamentoById(pagamentoId);
        if (formaPagamento === null) {
          formaPagamento = await pagamentoStore.getPagamentoById(pagamentoId);
        }
  
        const formaPagamentoNome = formaPagamento ? formaPagamento.nome : '';
  
        paymentMethodsCountMap.set(
          formaPagamentoNome,
          (paymentMethodsCountMap.get(formaPagamentoNome) || 0) + 1
        );
  
        const valor = trabalho.servico_valor || 0;
        paymentMethodsValueMap.set(
          formaPagamentoNome,
          (paymentMethodsValueMap.get(formaPagamentoNome) || 0) + valor
        );
      }
  
      const paymentLabels = Array.from(paymentMethodsCountMap.keys());
      const paymentCounts = paymentLabels.map(label => paymentMethodsCountMap.get(label) || 0);
      const paymentValues = paymentLabels.map(label => paymentMethodsValueMap.get(label) || 0);
  
      if (paymentMethodsChart) paymentMethodsChart.destroy();
      showCharts.value = true;
  
      await nextTick(() => {
        if (paymentMethodsChartCanvas.value) {
          paymentMethodsChart = new Chart(paymentMethodsChartCanvas.value, {
            type: 'bar',
            data: {
              labels: paymentLabels,
              datasets: [
                {
                  label: 'Quantidade',
                  data: paymentCounts,
                  backgroundColor: 'rgba(20, 63, 97)',
                  yAxisID: 'y',
                },
                {
                  label: 'Valor (R$)',
                  data: paymentValues,
                  backgroundColor: 'rgba(243, 186, 22)',
                  yAxisID: 'y1',
                }
              ]
            },
            options: {
              responsive: true,
              interaction: {
                mode: 'index',
                intersect: false
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Quantidade'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Valor (R$)'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              },
              plugins: {
                legend: { display: true },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                        const raw = context.raw;
                        const label = context.dataset.label ?? '';

                        if (label === 'Valor Total (R$)' && typeof raw === 'number') {
                            return `${label}: R$ ${raw.toFixed(2).replace('.', ',')}`;
                        }

                        return `${label}: ${String(raw)}`;
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
  