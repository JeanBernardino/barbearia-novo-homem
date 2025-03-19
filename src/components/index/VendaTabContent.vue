<template>
    <div v-if="loading" class="q-pa-md flex justify-center items-center">
        <q-circular-progress
            indeterminate
            rounded
            size="50px"
            color="primary"
            class="q-ma-md"
        />
    </div>

    <div padding v-else fit>
        <q-form ref="crudForm">
            <div class="column">
                <div class="column">
                    <div class="q-mb-md">
                        <q-select 
                            outlined 
                            v-model="venda.produto_id" 
                            :options="produtos" 
                            label="Produto"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário selecionar um produto.',
                            ]"
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-input 
                            v-model="venda.quantidade" 
                            type="text" 
                            label="Quantidade"
                            outlined
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário informar um valor.',
                                val => val > 0 || 'Necessário informar um valor maior que 0.',
                            ]"
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-select 
                            outlined 
                            v-model="venda.pagamento_id" 
                            :options="pagamentos" 
                            label="Pagamento"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário selecionar uma forma de pagamento.',
                            ]"
                        />
                    </div>

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { QForm, Notify } from 'quasar';
import { usePagamentoStore } from 'src/stores/pagamentos/PagamentoStore';
import { useVendatore } from 'src/stores/vendas/VendaStore';
import { useProdutoStore } from 'src/stores/produtos/ProdutoStore';
import type { VendaModel } from 'src/models/vendas/VendaModel';

const store = useVendatore();
const produtoStore = useProdutoStore();
const pagamentoStore = usePagamentoStore();
const crudForm = ref<QForm>();

const produtos = computed(() => produtoStore.getAllProdutosAtivos);
const pagamentos = computed(() => pagamentoStore.getAllPagamentosAtivos);
const loading = ref(true);

const vendaInicial = {
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    produto_id: '',
    produto_valor: 0,
    pagamento_id: '',
    quantidade: 1
};
const venda = ref<VendaModel>({...vendaInicial});

onMounted(async () => {
    await produtoStore.loadAllProdutos();
    await pagamentoStore.loadAllPagamentos();
    loading.value = false;
});

const onSave = async () => {
    try {
        const isValid = await crudForm.value?.validate(true);
        if (crudForm.value && !isValid) {
            return;
        }

        const produto_id = venda.value.produto_id;

        const produtoSelecionado = produtos.value.find(p => p.id === produto_id);
        if (produtoSelecionado) {
            venda.value.produto_valor = produtoSelecionado.valor;
        }

        await store.addVenda(venda.value);
        venda.value = {...vendaInicial};

        Notify.create({
            message: 'Venda salva com sucesso!',
            type: 'positive'
        });
    } catch (error) {
        console.log(error);
        Notify.create({
            message: 'Não foi possível salvar a venda!',
            type: 'negative'
        });
    }
};
</script>