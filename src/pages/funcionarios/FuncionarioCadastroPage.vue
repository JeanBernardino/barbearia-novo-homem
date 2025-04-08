<template>
    <q-page padding>
        <q-form ref="crudForm">
            <div class="column">
                <div class="column">
                    <div class="q-mb-md">
                        <q-input 
                            v-model="funcionario.nome" 
                            type="text" 
                            label="Nome" 
                            lazy-rules
                            :rules="[
                                val => !!val || 'Necessário informar um nome.',
                            ]"
                            outlined
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-toggle
                            v-model="funcionario.ativo"
                            label="Status"
                        >
                            <q-tooltip>
                                Usada para ativar ou inativar o funcionário.
                            </q-tooltip>
                        </q-toggle>
                    </div>

                    <div class="q-mb-md" v-show="showComissoes">
                        <q-btn 
                            color="secondary" 
                            icon="attach_money" 
                            label="Gerenciar Comissões" 
                            @click="exibirDialogComissoes = true" 
                        />
                    </div>

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </q-page>

    <q-dialog v-model="exibirDialogComissoes">
        <ComissaoCard 
            :funcionario="funcionario"
            @close-dialog="exibirDialogComissoes = false"
        />
    </q-dialog>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Notify, QForm } from 'quasar';
import type { FuncionarioModel } from 'src/models/funcionarios/FuncionarioModel';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore';

const route = useRoute();
const router = useRouter();
const store = useFuncionarioStore();
const crudForm = ref<QForm>()

const funcionario = ref<FuncionarioModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    nome: '',
});

const exibirDialogComissoes = ref(false);

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getFuncionarioById(id);
        if (model) {
            funcionario.value = { ...model };
        } else {
            Notify.create({
                message: 'Barbeiro não encontrado.',
                type: 'negative'
            })
            await router.push('/barbeiros');
        }
    }

});

const showComissoes = () => {
    return funcionario.value.id !== null;
};

const onSave = async () => {
    try {
        const isValid = await crudForm.value?.validate(true);
        if (crudForm.value && !isValid) {
            return;
        }

        if (funcionario.value.id) {
            await store.updateFuncionario(funcionario.value);
        } else {
            await store.addFuncionario(funcionario.value);
        }
        
        await router.push('/barbeiros');
        Notify.create({
          message: "Barbeiro salvo com sucesso!",
          type: "positive",
        });
    } catch (error) {
        console.error("Erro ao salvar barbeiro:", error);
        Notify.create({
          message: "Ocorreu um erro ao salvar o barbeiro!",
          type: "negative",
        });
      }
};

</script>