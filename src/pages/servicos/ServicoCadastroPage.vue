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
                            v-model="valorServico" 
                            type="text" 
                            label="Preço" 
                            prefix="R$"
                            outlined
                        />
                    </div>

                    <q-toggle
                        class="q-mb-md"
                        v-model="servico.ativo"
                        label="Status"
                    >
                        <q-tooltip>
                            Usada para ativar ou inativar o serviço.
                        </q-tooltip>
                    </q-toggle>

                    <q-toggle
                        class="q-mb-md"
                        v-model="servico.flagCombo"
                        label="Combo"
                    >
                        <q-tooltip>
                            Usado para transformar este serviço em um combo.
                        </q-tooltip>
                    </q-toggle>

                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useServicoStore } from 'src/stores/servicos/ServicoStore'
import type { ServicoModel } from 'src/models/servicos/ServicoModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = useServicoStore()
const crudForm = ref<QForm>()

const servico = ref<ServicoModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    nome: '',
    valor: 0,
    flagCombo: false
});

const valorServico = computed({
    get: () => servico.value.valor,
    set: (value: string) => {
        const numericValue = parseFloat(value.trim());
        servico.value.valor = isNaN(numericValue) ? 0 : numericValue;
    }
});

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getServicoById(id);
        if (model) {
            servico.value = { ...model };
        } else {
            Notify.create({
                message: 'Serviço não encontrado.',
                type: 'negative'
            });
            await router.push('/servicos');
        }
    }
});

const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    if (servico.value.id) {
        await store.updateServico(servico.value);
    } else {
        await store.addServico(servico.value);
    }
    await router.push('/servicos');
};
</script>