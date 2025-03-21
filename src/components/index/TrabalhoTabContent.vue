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
                            v-model="trabalho.funcionario_id" 
                            :options="funcionarios" 
                            label="Barbeiro"
                            option-value="id"
                            option-label="nome"
                            emit-value
                            map-options
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário selecionar um barbeiro.',
                            ]"
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
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário selecionar um serviço.',
                            ]"
                        />
                    </div>

                    <div class="q-mb-md" v-show="user?.tipo === UsuarioTipo.ADMIN">
                        <q-input v-model="trabalhoData" outlined type="date" :rules="[val => !!val || 'Necessário informar uma data de cadastro.']" />
                    </div>

                    <div class="q-mb-md">
                        <q-select 
                            outlined 
                            v-model="trabalho.pagamento_id" 
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
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { usePagamentoStore } from 'src/stores/pagamentos/PagamentoStore';
import { useTrabalhoStore } from 'src/stores/trabalhos/TrabalhoStore';
import type { TrabalhoModel } from 'src/models/trabalhos/TrabalhoModel';
import { useComissaoStore } from 'src/stores/comissoes/ComissaoStore';
import { Timestamp } from "firebase/firestore";
import { DateTime } from 'luxon';
import { useAuthStore } from 'src/stores/usuarios/AuthStore';
import { UsuarioTipo } from 'src/models/usuarios/UsuarioTipo';

const store = useTrabalhoStore();
const funcionarioStore = useFuncionarioStore();
const servicoStore = useServicoStore();
const pagamentoStore = usePagamentoStore();
const comissaoStore = useComissaoStore();
const authStore = useAuthStore();

const crudForm = ref<QForm>();
const user = authStore.user;

const funcionarios = computed(() => funcionarioStore.getAllFuncionariosAtivos);
const servicos = computed(() => servicoStore.getAllServicosAtivos);
const pagamentos = computed(() => pagamentoStore.getAllPagamentosAtivos);
const comissoes = computed(() => comissaoStore.getAllComissoes);
const loading = ref(true);

const trabalhoInicial= {
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: Timestamp.fromDate(new Date()),
    cadastroUsuario: '',
    ativo: true,
    funcionario_id: '',
    servico_id: '',
    pagamento_id: '',
    funcionario_comissao: 0,
    servico_valor: 0,
};
const trabalho = ref<TrabalhoModel>({...trabalhoInicial});
const trabalhoData = ref();

onMounted(async () => {
    await funcionarioStore.loadAllFuncionarios();
    await servicoStore.loadAllServicos();
    await pagamentoStore.loadAllPagamentos();
    await comissaoStore.loadAllComissoes();

    trabalhoData.value = getTodayDate();
    loading.value = false;
});

const getTodayDate = () => {
  const today = new Date();

  const saoPauloOffset = -3 * 60;
  const localOffset = today.getTimezoneOffset();
  const adjustedTime = today.getTime() + (saoPauloOffset - localOffset) * 60000;

  const saoPauloDate = new Date(adjustedTime);
  return saoPauloDate.toISOString().slice(0, 10);
}

function convertToStartOfDay(dateString: string): Date {
    if (!dateString) {
        console.error('Data inválida ou indefinida');
        return new Date();
    }

    const startOfDay = DateTime.fromISO(dateString, { zone: 'America/Sao_Paulo' }).startOf('day');
    if (!startOfDay.isValid) {
        console.error('Data inválida');
        return new Date();
    }

    const currentTime = DateTime.now().setZone('America/Sao_Paulo');
    const updatedDate = startOfDay.set({
        hour: currentTime.hour,
        minute: currentTime.minute,
        second: currentTime.second,
        millisecond: currentTime.millisecond,
    });

    return updatedDate.toJSDate();
}

const onSave = async () => {
    try {
        const isValid = await crudForm.value?.validate(true);
        if (crudForm.value && !isValid) {
            return;
        }

        const funcionario_id = trabalho.value.funcionario_id;
        const servico_id = trabalho.value.servico_id;

        const servicoSelecionado = servicos.value.find(s => s.id === servico_id);
        if (servicoSelecionado) {
            trabalho.value.servico_valor = servicoSelecionado.valor;
        }

        const comissaoFuncionario = comissoes.value.find(c => c.servico_id === servico_id && c.funcionario_id === funcionario_id);
        if (comissaoFuncionario) {
            trabalho.value.funcionario_comissao = comissaoFuncionario.valor;
        }

        const cadastroData = convertToStartOfDay(trabalhoData.value);

        await store.addTrabalho(trabalho.value, cadastroData);
        trabalho.value = { ...trabalhoInicial };
        
        trabalhoData.value = getTodayDate();

        Notify.create({
            message: 'Trabalho salvo com sucesso!',
            type: 'positive'
        });
    } catch (error) {
        console.log(error);
        Notify.create({
            message: 'Não foi possível salvar o trabalho!',
            type: 'negative'
        });
    }
};

</script>