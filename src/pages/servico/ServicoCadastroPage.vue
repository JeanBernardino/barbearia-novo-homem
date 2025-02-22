<template>
    <q-page padding>
        <q-form>
            <div class="column">
                <div class="column">
                    <div class="q-mb-md">
                        <q-input v-model="nome" type="text" label="Nome" outlined/>
                    </div>

                    <div class="q-mb-md">
                        <q-input v-model="valor" type="text" label="Preço" prefix="R$" outlined/>
                    </div>

                    <q-btn color="primary" icon="check" label="Salvar" @click="addServico" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useServicoStore } from 'src/stores/global/ServicoStore'

const servicoStore = useServicoStore()

const nome = ref('')
const valor = ref(0)

onMounted(async () => {
    await servicoStore.loadServicos()
});

const addServico = async () => {
    await servicoStore.addServico(nome.value, valor.value)
    nome.value = ''
    valor.value = 0
};

// const editServico = async (id: string) => {
//     await servicoStore.editServico(id, nome.value, valor.value)
// };
</script>