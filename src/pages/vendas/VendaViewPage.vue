<template>
    <q-page class="q-pa-md">
        <q-table
            :rows="filteredVendas"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :virtual-scroll="true" 
            :virtual-scroll-item-size="50"
            :rows-per-page-options="[0]"
            style="height: 90vh;"
        >
            <template v-slot:top>
                <strong class="q-font-size-lg">Vendas</strong>

                <q-space></q-space>

                <q-input borderless dense debounce="300" v-model="filterText" placeholder="Buscar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td :props="props" key="data">
                        {{ formatFirebaseTimestampToBRDate(props.row.cadastroData) }}
                    </q-td>
                    <q-td :props="props" key="categoria">
                        {{ getCategoriaNome(props.row.produto_id) }}
                    </q-td>
                    <q-td :props="props" key="produto">
                        {{ getProdutoNome(props.row.produto_id) }}
                    </q-td>
                    <q-td :props="props" key="quantidade">
                        {{ props.row.quantidade }}
                    </q-td>
                    <q-td :props="props" key="valorProduto">
                        R$ {{ props.row.produto_valor.toFixed(2).replace('.', ',')  }}
                    </q-td>
                    <q-td :props="props" key="valorTotal">
                        R$ {{ getValorTotal(props.row.produto_valor, props.row.quantidade) }}
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
            :onConfirm="removeVenda" 
            :onClose="closeConfirmDialog"
        />
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Timestamp } from "firebase/firestore";
import { useVendaStore } from 'src/stores/vendas/VendaStore';
import { useCategoriaStore } from 'src/stores/categorias/CategoriaStore';
import type { VendaModel } from 'src/models/vendas/VendaModel';
import { useProdutoStore } from 'src/stores/produtos/ProdutoStore';

const store = useVendaStore();
const categoriaStore = useCategoriaStore();
const produtoStore = useProdutoStore();

const loading = ref(false);
const vendaToRemove = ref('');
const isConfirmDialogOpen = ref(false);
const filterText = ref('');

const vendas = computed(() => store.getAllVendas);
const categorias = computed(() => categoriaStore.getAllCategorias);
const produtos = computed(() => produtoStore.getAllProdutos);

const columns: {
    name: string;
    label: string;
    align: 'left' | 'right' | 'center';
    field: (row: VendaModel) => Timestamp | string | number | boolean | null; // Tipo corrigido
    sortable: boolean;
}[] = [
    { name: 'data', label: 'Data', align: 'left', field: (row) => row.cadastroData, sortable: true },
    { name: 'categoria', label: 'Categoria', align: 'left', field: (row) => row.produto_id, sortable: true },
    { name: 'produto', label: 'Produto', align: 'left', field: (row) => row.produto_id, sortable: true },
    { name: 'quantidade', label: 'Quantidade', align: 'left', field: (row) => row.quantidade, sortable: true },
    { name: 'valorProduto', label: 'Valor Produto', align: 'left', field: (row) => row.produto_valor, sortable: true },
    { name: 'valorTotal', label: 'Valor Total', align: 'left', field: (row) => row.quantidade * row.produto_valor, sortable: true },
    { name: 'excluir', label: 'Excluir', align: 'center', field: () => '', sortable: false }
];

onMounted(async () => {
    loading.value = true;
    await store.loadAllVendas();
    await categoriaStore.loadAllCategorias();
    await produtoStore.loadAllProdutos();
    loading.value = false;
});

const onDelete = (venda: VendaModel) => {
    vendaToRemove.value = venda.id;
    isConfirmDialogOpen.value = true;
};

const removeVenda = async () => {
    if (vendaToRemove.value !== '') {
        await store.removeVenda(vendaToRemove.value);
    }

    isConfirmDialogOpen.value = false;
};

const closeConfirmDialog = () => {
    vendaToRemove.value = '';
    isConfirmDialogOpen.value = false;
};

const getValorTotal = (valor: number, quantidade: number) => {
    const total = valor * quantidade;
    return total.toFixed(2).replace('.', ',') ;
}

const getCategoriaNome = (id: string): string => {
    const produto = produtos.value.find(p => p.id === id);
    if (produto) {
        const categoria = categorias.value.find(c => c.id === produto.categoria_id);
        return categoria ? categoria.nome : '';
    }

    return '';
};

const getProdutoNome = (id: string): string => {
    const produto = produtos.value.find(p => p.id === id);
    return produto ? produto.nome : '';
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
        second: '2-digit',
        hour12: false,
    }).format(date);

    return `${dateFormat} ${timeFormat}`;
}

const filteredVendas = computed(() => {
    return vendas.value.filter((venda) => {
        const searchTerm = filterText.value.toLowerCase();

        return (
            formatFirebaseTimestampToBRDate(venda.cadastroData).toLowerCase().includes(searchTerm) ||
            getCategoriaNome(venda.produto_id).toLowerCase().includes(searchTerm) ||
            getProdutoNome(venda.produto_id).toLowerCase().includes(searchTerm) ||
            String(venda.produto_valor).includes(searchTerm)
        );
    });
});


</script>
