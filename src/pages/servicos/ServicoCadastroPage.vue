<template>
    <q-page padding>
        <q-form ref="crudForm">
            <div class="column">
                <div class="column">
                    <div class="q-mb-md">
                        <q-input 
                            v-model="servico.nome" 
                            type="text" 
                            label="Nome" 
                            :rules="[
                                val => !!val || 'Necessário informar um nome.',
                            ]"
                            outlined
                        />
                    </div>

                    <div class="q-mb-md">
                        <q-input 
                            v-model="servico.valor" 
                            type="text" 
                            label="Preço" 
                            prefix="R$"
                            outlined
                        />
                    </div>

                    <q-toggle
                        class="q-mb-md"
                        v-model="servico.flagCombo"
                        label="Combo"
                    >
                        <q-tooltip>
                            Usada para transformar este serviço em um combo
                        </q-tooltip>
                    </q-toggle>

                    <q-btn color="primary" icon="check" label="Salvar" @click="saveServico" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useServicoStore } from 'src/stores/servicos/ServicoStore'
import type { ServicoModel } from 'src/models/servicos/ServicoModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const servicoStore = useServicoStore()
const crudForm = ref<QForm>()

const servico = ref<ServicoModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    nome: '',
    valor: 0,
    flagCombo: false
});

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const servicoEncontrado = await servicoStore.getServicoById(id);
        if (servicoEncontrado) {
            servico.value = { ...servicoEncontrado };
        } else {
            Notify.create({
                message: 'Serviço não encontrado',
                type: 'negative'
            })
        }
    }
});

const saveServico = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    if (servico.value.id) {
        await servicoStore.updateServico(servico.value);
    } else {
        await servicoStore.addServico(servico.value);
    }
    await router.push('/servicos');
};
</script>