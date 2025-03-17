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
                label="Funcionario"
                option-value="id"
                option-label="nome"
                emit-value
                map-options
                :rules="[
                  val => !!val || 'Necessário selecionar um funcionário.',
                ]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input 
                outlined 
                v-model="filters.startDate" 
                mask="date" 
                :rules="[
                  val => !!val || 'Necessário informar uma data de início.',
                ]"
                >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.startDate" >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input 
                outlined 
                v-model="filters.endDate"
                mask="date" 
                :rules="[
                  val => !!val || 'Necessário informar uma data de fim.',
                ]">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.endDate" >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <q-btn @click="onFilterConfirm" label="Filtrar" color="primary" />
        </div>
      </q-form>
    </div>

    <div v-if="showTable">
      <q-table
        :rows="tableData"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :virtual-scroll="true" 
        :virtual-scroll-item-size="50"
        :rows-per-page-options="[0]"
      >
        <template v-slot:top-right>
          <q-spinner v-if="loading" size="30px" />
        </template>

        <template v-slot:body-cell="props">
          <q-td :props="props">
            <template v-if="props.col.name === 'valorTotal' || props.col.name === 'comissaoTotal'">
              R$ {{ props.row[props.col.name]?.toFixed(2).replace('.', ',') }}
            </template>
            <template v-else-if="props.col.name.startsWith('servico_')">
              {{ props.row.servicos[props.col.name.replace('servico_', '')] || 0 }}
            </template>
            <template v-else>
              {{ props.row[props.col.name] }}
            </template>
          </q-td>
        </template>

        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="100%" align="left">
              Total serviços: R$ {{ totalValorTotal.toFixed(2).replace('.', ',') }}
            </q-td>
          </q-tr>

          <q-tr>
            <q-td colspan="100%" align="left">
              Total funcionário: R$ {{ totalComissaoTotal.toFixed(2).replace('.', ',') }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

  
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { QForm, Notify } from 'quasar';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';

interface TableRow {
  data: string;
  totalServicos: number;
  servicos: Record<string, number>;
  valorTotal: number;
  comissaoTotal: number;
}

interface TableColumn {
  name: string;
  label: string;
  align: "left" | "right" | "center";
  field: string | ((row: TableRow) => number);
}

const store = useTrabalhoStore();
const funcionarioStore = useFuncionarioStore();
const servicoStore = useServicoStore();
const crudForm = ref<QForm>();

const funcionarios = computed(() => funcionarioStore.getAllFuncionariosAtivos);

const showTable = ref(false);
const loading = ref(false);
const tableData = ref<TableRow[]>([]);
const columns = ref<TableColumn[]>([]);
const totalValorTotal = ref(0);
const totalComissaoTotal = ref(0);

const filters = ref({
  funcionario_id: '',
  startDate: getFirstDayOfMonth(),
  endDate: getLastDayOfMonth(),
});

onMounted(async () => {
  await funcionarioStore.loadAllFuncionarios();
});

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

    loading.value = true;
    const funcionarioId = filters.value.funcionario_id;
    const dataInicio = new Date(filters.value.startDate);
    const dataFim = new Date(filters.value.endDate);

    const trabalhosRealizados: TrabalhoModel[] = await store.getTrabalhosByFuncionarioAndRangeDate(funcionarioId, dataInicio, dataFim);
    const servicosMap = new Map<string, string>();

    for (const trabalho of trabalhosRealizados) {
      if (!servicosMap.has(trabalho.servico_id)) {
        const servico = await servicoStore.getServicoById(trabalho.servico_id);
        if (servico) {
          servicosMap.set(trabalho.servico_id, servico.nome);
        }
      }
    }

    columns.value = [
      { name: 'data', label: 'Data do Trabalho', align: 'left', field: 'data' },
      { name: 'totalServicos', label: 'Total de Serviços', align: 'center', field: 'totalServicos' },
      ...Array.from(servicosMap.entries()).map(([id, nome]) => ({
        name: `servico_${id}`,
        label: nome,
        align: 'center' as "center",
        field: (row: TableRow) => row.servicos[id] || 0,
      })),
      { name: 'valorTotal', label: 'Valor Total', align: 'right', field: 'valorTotal' },
      { name: 'comissaoTotal', label: 'Comissão Total', align: 'right', field: 'comissaoTotal' }
    ];

    const groupedData = new Map<string, TableRow>();

    for (const trabalho of trabalhosRealizados) {
      const data = trabalho.cadastroData ? new Date(trabalho.cadastroData instanceof Date ? trabalho.cadastroData : trabalho.cadastroData.toDate()).toLocaleDateString() : '';

      if (!groupedData.has(data)) {
        groupedData.set(data, {
          data,
          totalServicos: 0,
          servicos: {},
          valorTotal: 0,
          comissaoTotal: 0
        });
      }

      const row = groupedData.get(data)!;
      row.totalServicos++;
      row.servicos[trabalho.servico_id] = (row.servicos[trabalho.servico_id] || 0) + 1;
      row.valorTotal += trabalho.servico_valor;

      const comissaoTotal = (trabalho.servico_valor * (trabalho.funcionario_comissao / 100))
      row.comissaoTotal += comissaoTotal;

      totalValorTotal.value += trabalho.servico_valor;
      totalComissaoTotal.value += comissaoTotal;
    }

    tableData.value = Array.from(groupedData.values());
    showTable.value = true;
  } catch (error) {
    console.log(error);
    Notify.create({
      message: 'Não foi possível obter os dados para o relatório!',
      type: 'negative'
    });
  } finally {
    loading.value = false;
  }
};

</script>
  