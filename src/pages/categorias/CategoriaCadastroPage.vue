<template>
    <q-page padding>
        <q-form ref="crudForm">
            <div class="column">
                <div class="column">
                    <q-input 
                        class="q-mb-md"
                        v-model="categoria.nome" 
                        type="text" 
                        label="Nome" 
                        lazy-rules
                        :rules="[
                            val => !!val || 'Necessário informar um nome.',
                        ]"
                        outlined
                    />

                    <q-toggle
                        class="q-mb-md"
                        v-model="categoria.ativo"
                        label="Status"
                    >
                        <q-tooltip>
                            Usada para ativar ou inativar a categoria.
                        </q-tooltip>
                    </q-toggle>
                    
                    <q-btn color="primary" icon="check" label="Salvar" @click="onSave" />
                </div>
            </div>
        </q-form>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useCategoriaStore } from 'src/stores/categorias/CategoriaStore'
import type { CategoriaModel } from 'src/models/categorias/CategoriaModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = useCategoriaStore()
const crudForm = ref<QForm>()

const categoria = ref<CategoriaModel>({
    id: '',
    alteracaoData: null,
    alteracaoUsuario: '',
    cadastroData: null,
    cadastroUsuario: '',
    ativo: true,
    nome: ''
});

onMounted(async () => {
    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getCategoriaById(id);
        if (model) {
            categoria.value = { ...model };
        } else {
            Notify.create({
                message: 'Categoria não encontrada.',
                type: 'negative'
            })
            await router.push('/categorias');
        }
    }
});

const onSave = async () => {
    const isValid = await crudForm.value?.validate(true);
    if (crudForm.value && !isValid) {
        return;
    }

    if (categoria.value.id) {
        await store.updateCategoria(categoria.value);
    } else {
        await store.addCategoria(categoria.value);
    }
    await router.push('/categorias');
};
</script>