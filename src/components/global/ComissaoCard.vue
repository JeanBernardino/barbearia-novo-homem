<template>
    <q-card style="width: 600px">
        <q-card-section>
            <div class="text-h6">Gerenciar Comissões</div>
        </q-card-section>

        <!-- Formulário para adicionar nova comissão -->
        <q-card-section>
            <q-form ref="crudForm">
                <div class="column">
                    <div class="row q-col-gutter-xs">
                        <div class="col-8">
                            <q-select 
                                v-model="comissao.servico_id" 
                                :options="servicos" 
                                label="Serviço"
                                option-label="nome"
                                option-value="id"
                                emit-value
                                map-options
                                outlined
                                :rules="[
                                    val => !!val || 'Selecione um serviço.',
                                ]"
                            />
                            </div>
                        <div class="col-4">
                            <q-input 
                                v-model.number="comissao.valor" 
                                type="number" 
                                suffix="%" 
                                label="Valor"
                                outlined
                                :rules="[
                                    val => val !== 0 || 'Informe um valor para a comissão.',
                                ]"
                            />
                        </div>
                    </div>
                    <div class="q-mt-xs">
                        <q-btn color="primary" label="Salvar" icon="check" @click="onSave" style="width: 100%;"  />
                    </div>
                </div>
            </q-form>
        </q-card-section>

        <q-separator />

        <!-- Lista de comissões registradas -->
        <q-card-section>
            <div class="text-subtitle2 q-mb-md">Comissões Registradas</div>
            <q-list bordered separator>
                <q-item v-for="(comissao, index) in comissoes" :key="index">
                    <q-item-section>
                        <q-item-label>{{ getServicoNome(comissao.servico_id) }}</q-item-label>
                        <q-item-label caption>Valor: {{ comissao.valor }}%</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn icon="edit" color="primary" flat @click="onEdit(comissao)" />
                    </q-item-section>
                    <q-item-section side>
                        <q-btn icon="delete" color="negative" flat @click="onDelete(comissao)" />
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>

        <q-card-actions align="right">
            <q-btn flat label="Fechar" @click="onClose" />
        </q-card-actions>
    </q-card>

    <ConfirmDialog
        v-model="isConfirmDialogOpen"
        :message="'Deseja remover esta comissão?'"
        :confirmar-text="'Sim'"
        :cancel-text="'Não'"
        :onConfirm="removeComissao" 
        :onClose="closeConfirmDialog"
    />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, computed, ref } from 'vue';
import { Notify, QForm } from 'quasar';
import { useServicoStore } from 'src/stores/servicos/ServicoStore';
import { useComissaoStore } from 'src/stores/comissoes/ComissaoStore';
import type { FuncionarioModel } from 'src/models/funcionarios/FuncionarioModel';
import type { ComissaoModel } from 'src/models/comissoes/ComissaoModel';

const servicoStore = useServicoStore();
const comissaoStore = useComissaoStore();

const servicos = computed(() => servicoStore.getAllServicos);
const comissoes = computed(() => comissaoStore.getComissoesByFuncionarioId(props.funcionario.id));

const crudForm = ref<QForm>()

const comissaoInicial = {
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    funcionario_id: '',
    servico_id: '',
    valor: 0
};
const comissao = ref<ComissaoModel>({...comissaoInicial});

const comissaoToDelete = ref<string>('');
const isConfirmDialogOpen = ref(false);
  
const props = defineProps<{
    funcionario: FuncionarioModel;
}>();

const emit = defineEmits<{
    (event: 'closeDialog', value: boolean): void;
}>();

onMounted(async () => {
    await servicoStore.loadAllServicos();
    await comissaoStore.loadAllComissoes();
});

const onClose = () => {
    emit('closeDialog', true);
}
  
const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    comissao.value.funcionario_id = props.funcionario.id;

    if (comissao.value.id !== '') {
        const comissaoExistente = comissaoStore.getComissoesByServicoIdAndFuncionarioId(comissao.value.servico_id, comissao.value.funcionario_id);
        if (comissaoExistente.length === 0) {
            await saveComissao();
        } else {
            Notify.create({
                message: 'Já existe uma comissão para este serviço!',
                type: 'negative'
            });
        }
    } else {
        await saveComissao();
    }
};

const saveComissao = async () => {
    await comissaoStore.saveComissao(comissao.value);
    comissao.value = {...comissaoInicial};

    Notify.create({
        message: 'Comissão salva com sucesso!',
        type: 'positive'
    });
};

const onEdit = (comissaoToEdit: ComissaoModel) => {
    comissao.value = comissaoToEdit;
};

const onDelete = (comissao: ComissaoModel) => {
    comissaoToDelete.value = comissao.id;
    isConfirmDialogOpen.value = true;
};

const removeComissao = async () => {
    if (comissaoToDelete.value !== '') {
        await comissaoStore.removeComissao(comissaoToDelete.value);
    }

    isConfirmDialogOpen.value = false;
};

const closeConfirmDialog = () => {
    comissaoToDelete.value = '';
    isConfirmDialogOpen.value = false;
};

const getServicoNome = (servicoId: string): string => {
    const servico = servicos.value.find(s => s.id === servicoId);
    return servico ? servico.nome : '';
};
</script>
  