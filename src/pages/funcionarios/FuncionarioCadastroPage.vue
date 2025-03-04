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

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useFuncionarioStore } from 'src/stores/funcionarios/FuncionarioStore'
import type { FuncionarioModel } from 'src/models/funcionarios/FuncionarioModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = useFuncionarioStore()
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

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getFuncionarioById(id);
        if (model) {
            funcionario.value = { ...model };
        } else {
            Notify.create({
                message: 'Funcionário não encontrado.',
                type: 'negative'
            })
            await router.push('/funcionarios');
        }
    }
});

const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    if (funcionario.value.id) {
        await store.updateFuncionario(funcionario.value);
    } else {
        await store.addFuncionario(funcionario.value);
    }
    await router.push('/funcionarios');
};
</script>