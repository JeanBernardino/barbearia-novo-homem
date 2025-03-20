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

          <q-btn
            label="Exportar"
            @click="exportToExcel"
            color="primary"
          />
        </template>

        <template v-slot:body-cell="props">
          <q-td :props="props">
            <template v-if="props.col.name === 'valorTotalVendas' || props.col.name === 'valorTotalServicos' || props.col.name === 'valorTotalFuncionario'">
              R$ {{ props.row[props.col.name]?.toFixed(2).replace('.', ',') }}
            </template>
            <template v-else-if="props.col.name.startsWith('servico_')">
              {{ props.row.servicos[props.col.name.replace('servico_', '')] || 0 }}
            </template>
            <template v-else-if="props.col.name.startsWith('produto_')">
              {{ props.row.produtos[props.col.name.replace('produto_', '')] || 0 }}
            </template>
            <template v-else>
              {{ props.row[props.col.name] }}
            </template>
          </q-td>
        </template>

        <template v-slot:bottom-row>
          <q-tr v-show="filters.funcionario_id === null || filters.funcionario_id === ''">
            <q-td colspan="100%" align="left">
              Total Geral: R$ {{ getTotalValorServicosVendas() }}
            </q-td>
          </q-tr>

          <q-tr v-show="filters.funcionario_id === null || filters.funcionario_id === ''">
            <q-td colspan="100%" align="left">
              Total Vendas: R$ {{ totalValorVendas.toFixed(2).replace('.', ',') }}
            </q-td>
          </q-tr>

          <q-tr>
            <q-td colspan="100%" align="left">
              Total Serviços: R$ {{ totalValorServicos.toFixed(2).replace('.', ',') }}
            </q-td>
          </q-tr>

          <q-tr>
            <q-td colspan="100%" align="left">
              Total Barbeiro: R$ {{ totalValorFuncionarios.toFixed(2).replace('.', ',') }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

  
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { QForm, Notify } from 'quasar';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';
import type { VendaModel } from 'src/models/vendas/VendaModel';
import { useVendaStore } from 'src/stores/vendas/VendaStore';
import { useProdutoStore } from 'src/stores/produtos/ProdutoStore';
import * as XLSX from 'xlsx';

interface TableRow {
  data: string;
  totalServicos: number;
  totalProdutos: number;
  servicos: Record<string, number>;
  produtos: Record<string, number>;
  valorTotalVendas: number;
  valorTotalServicos: number;
  valorTotalFuncionario: number;
}

interface TableColumn {
  name: string;
  label: string;
  align: "left" | "right" | "center";
  field: string | ((row: TableRow) => number);
}

const store = useTrabalhoStore();
const vendaStore = useVendaStore();
const funcionarioStore = useFuncionarioStore();
const servicoStore = useServicoStore();
const produtoStore = useProdutoStore();
const crudForm = ref<QForm>();

const funcionarios = computed(() => funcionarioStore.getAllFuncionariosAtivos);

const showTable = ref(false);
const loading = ref(false);
const tableData = ref<TableRow[]>([]);
const columns = ref<TableColumn[]>([]);
const totalValorTotal = ref(0);
const totalValorVendas = ref(0);
const totalValorServicos = ref(0);
const totalValorFuncionarios = ref(0);

const filters = ref({
  funcionario_id: '',
  startDate: getFirstDayOfMonth(),
  endDate: getLastDayOfMonth(),
});

onMounted(async () => {
  await funcionarioStore.loadAllFuncionarios();
});

watch(() => filters.value.funcionario_id, async () => await onFilterConfirm());

function getFirstDayOfMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
}

function getLastDayOfMonth() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.toISOString().slice(0, 10);
}

function getTotalValorServicosVendas() {
  const total = totalValorServicos.value + totalValorVendas.value;
  return total.toFixed(2).replace('.', ',')
}

const onFilterConfirm = async () => {
  try {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
      return;
    }

    loading.value = true;
    const funcionarioId = filters.value.funcionario_id;

    totalValorTotal.value = 0;
    totalValorVendas.value = 0;
    totalValorServicos.value = 0;
    totalValorFuncionarios.value = 0;

    const trabalhosRealizados: TrabalhoModel[] = await store.getTrabalhosByFuncionarioAndRangeDate(funcionarioId, filters.value.startDate, filters.value.endDate);
    const servicosMap = new Map<string, string>();

    for (const trabalho of trabalhosRealizados) {
      if (!servicosMap.has(trabalho.servico_id)) {
        let servico = servicoStore.findServicoById(trabalho.servico_id);
        if (servico === null) {
          servico = await servicoStore.getServicoById(trabalho.servico_id);
        }

        if (servico) {
          servicosMap.set(trabalho.servico_id, servico.nome);
        }
      }
    }

    const vendasRealizadas: VendaModel[] = await vendaStore.getVendasByRangeDate(filters.value.startDate, filters.value.endDate);
    const produtosMap = new Map<string, string>();

    for (const venda of vendasRealizadas) {
      if (!produtosMap.has(venda.produto_id)) {
        let produto = produtoStore.findProdutoById(venda.produto_id);
        if (produto === null) {
          produto = await produtoStore.getProdutoById(venda.produto_id);
        }

        if (produto) {
          produtosMap.set(venda.produto_id, produto.nome);
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
      ...(!filters.value.funcionario_id ? Array.from(produtosMap.entries()).map(([id, nome]) => ({
        name: `produto_${id}`,
        label: nome,
        align: 'center' as "center",
        field: (row: TableRow) => row.produtos[id] || 0,
      })) : []),
      ...(!filters.value.funcionario_id ? [{
        name: 'valorTotalVendas',
        label: 'Valor Total Vendas',
        align: 'right' as "right",
        field: 'valorTotalVendas'
      }] : []),
      { name: 'valorTotalServicos', label: 'Valor Total Serviços', align: 'right', field: 'valorTotalServicos' },
      { name: 'valorTotalFuncionario', label: 'Total Funcionário', align: 'right', field: 'valorTotalFuncionario' }
    ];

    const groupedData = new Map<string, TableRow>();
    
    for (const trabalho of trabalhosRealizados) {
      const data = trabalho.cadastroData ? new Date(trabalho.cadastroData instanceof Date ? trabalho.cadastroData : trabalho.cadastroData.toDate()).toLocaleDateString() : '';

      if (!groupedData.has(data)) {
        groupedData.set(data, {
          data,
          totalServicos: 0,
          totalProdutos: 0,
          servicos: {},
          produtos: {},
          valorTotalVendas: 0,
          valorTotalServicos: 0,
          valorTotalFuncionario: 0
        });
      }

      const row = groupedData.get(data)!;
      row.totalServicos++;
      row.servicos[trabalho.servico_id] = (row.servicos[trabalho.servico_id] || 0) + 1;
      row.valorTotalServicos += trabalho.servico_valor;

      const comissaoTotal = (trabalho.servico_valor * (trabalho.funcionario_comissao / 100))
      row.valorTotalFuncionario += comissaoTotal;

      totalValorServicos.value += trabalho.servico_valor;
      totalValorFuncionarios.value += comissaoTotal;
    }

    for (const venda of vendasRealizadas) {
      const data = venda.cadastroData ? new Date(venda.cadastroData instanceof Date ? venda.cadastroData : venda.cadastroData.toDate()).toLocaleDateString() : '';

      if (!groupedData.has(data)) {
        groupedData.set(data, {
          data,
          totalServicos: 0,
          totalProdutos: 0,
          servicos: {},
          produtos: {},
          valorTotalVendas: 0,
          valorTotalServicos: 0,
          valorTotalFuncionario: 0
        });
      }

      const row = groupedData.get(data)!;
      row.totalProdutos += venda.quantidade;
      row.produtos[venda.produto_id] = (row.servicos[venda.produto_id] || 0) + venda.quantidade;

      const valorTotalVenda = venda.produto_valor * venda.quantidade;
      row.valorTotalVendas += valorTotalVenda;

      totalValorVendas.value += valorTotalVenda;
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

const exportToExcel = () => {
  const data = tableData.value.map((row: TableRow) => {
    const formattedRow: Record<string, string | number> = {};

    columns.value.forEach((column: TableColumn) => {
      console.log(filters.value.funcionario_id)
      if (isFuncionarioSelected() && column.name.startsWith('produto_')) {
        return;
      }

      if (typeof column.field === 'function') {
        formattedRow[column.label] = column.field(row);
      } else {
        const value = row[column.field as keyof TableRow];
        
        console.log(column.name);
        console.log(value);
        console.log('------------');

        if (typeof value === 'number') {
          if (column.name.startsWith('valorTotal')) {
            formattedRow[column.label] = `R$ ${value.toFixed(2).replace('.', ',')}`;
          } else {
            formattedRow[column.label] = value;
          }
        } else if (typeof value === 'string') {
          formattedRow[column.label] = value;
        }
      }
    });

    return formattedRow;
  });

  data.push({}); // Adiciona uma linha em branco

  if (!isFuncionarioSelected()) {
    const totalGeral = {
      'Data do Trabalho': `Total Geral: R$ ${getTotalValorServicosVendas()}`,
      ...columns.value.slice(1).reduce((acc, column) => {
        acc[column.label] = ''; // Adiciona espaços vazios para outras colunas
        return acc;
      }, {} as Record<string, string>),
    };
    data.push(totalGeral);

    const totalVendas = {
      'Data do Trabalho': `Total Vendas: R$ ${totalValorVendas.value.toFixed(2).replace('.', ',')}`,
      ...columns.value.slice(1).reduce((acc, column) => {
        acc[column.label] = ''; // Adiciona espaços vazios para outras colunas
        return acc;
      }, {} as Record<string, string>),
    };
    data.push(totalVendas);
  }
  
  const totalServicos = {
    'Data do Trabalho': `Total Serviços: R$ ${totalValorServicos.value.toFixed(2).replace('.', ',')}`,
    ...columns.value.slice(1).reduce((acc, column) => {
      acc[column.label] = ''; // Adiciona espaços vazios para outras colunas
      return acc;
    }, {} as Record<string, string>),
  };
  data.push(totalServicos);

  const totalFuncionario = {
    'Data do Trabalho': `Total Barbeiro: R$ ${totalValorFuncionarios.value.toFixed(2).replace('.', ',')}`,
    ...columns.value.slice(1).reduce((acc, column) => {
      acc[column.label] = ''; // Adiciona espaços vazios para outras colunas
      return acc;
    }, {} as Record<string, string>),
  };
  data.push(totalFuncionario);

  // Converte os dados para uma planilha
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.value.map(column => column.label), // Usando a ordem das labels como o header
  });

  // Cria o workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  // Gera o buffer de Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Cria o Blob e o link para download
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);

  // Cria o link de download e aciona a ação
  const a = document.createElement('a');
  a.href = url;
  a.download = `${getFileName()}.xlsx`; // Nome do arquivo
  document.body.appendChild(a);
  a.click();

  // Limpeza do link e revogação do objeto URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


function getFileName() {
  if (!isFuncionarioSelected()) {
    return 'RELATORIO_GERAL';
  }

  const funcionarioNome = getFuncionarioNome(filters.value.funcionario_id);
  if (funcionarioNome) {
    return `RELATORIO_${funcionarioNome.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toUpperCase()}`;
  }

  return 'RELATORIO'
}

const getFuncionarioNome = (id: string): string => {
  const funcionario = funcionarios.value.find(f => f.id === id);
  return funcionario ? funcionario.nome : '';
};

const isFuncionarioSelected = (): boolean => {
  return !!filters.value.funcionario_id;
};

</script>
  