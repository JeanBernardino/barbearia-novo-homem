<template>
    <div v-if="loading" class="q-pa-md flex flex-center">
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
                            v-model="trabalho.funcionario_id" 
                            :options="funcionarios" 
                            label="Funcionario"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-select 
                            outlined 
                            v-model="trabalho.servico_id" 
                            :options="servicos" 
                            label="Serviço"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-select 
                            outlined 
                            v-model="trabalho.pagamento_id" 
                            :options="pagamentos" 
                            label="Pagamentos"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                        />
                    </div>

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { usePagamentoStore } from 'src/stores/pagamentos/PagamentoStore';
import { QForm } from 'quasar';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';

const funcionarioStore = useFuncionarioStore();
const servicoStore = useServicoStore();
const pagamentoStore = usePagamentoStore();
const crudForm = ref<QForm>();

const funcionarios = computed(() => funcionarioStore.getAllFuncionarios);
const servicos = computed(() => servicoStore.getAllServicos);
const pagamentos = computed(() => pagamentoStore.getAllPagamentos);
const loading = ref(true);

const trabalho = ref<TrabalhoModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    funcionario_id: '',
    servico_id: '',
    pagamento_id: '',
    funcionario_comissao: 0,
    servico_valor: 0,
});

onMounted(async () => {
    await funcionarioStore.loadAllFuncionarios();
    await servicoStore.loadAllServicos();
    await pagamentoStore.loadAllPagamentos();
    loading.value = false;
});

const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }
};
</script>