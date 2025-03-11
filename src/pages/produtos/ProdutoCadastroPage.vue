<template>
  <q-page padding>
      <q-form ref="crudForm">
          <div class="column">
              <div class="column">
                  <div class="q-mb-md">
                    <q-input 
                      v-model="produto.nome" 
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
                      v-model="produto.valor" 
                      type="text" 
                      label="Preço" 
                      prefix="R$"
                      outlined
                    />
                  </div>

                  <div class="q-mb-md">
                    <q-select 
                      outlined 
                      v-model="produto.categoria_id" 
                      :options="categorias" 
                      label="Categoria"
                      option-value="id"
                      option-label="nome"
                      emit-value
                      map-options
                    >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          Nenhum resultado encontrado...
                        </q-item-section>
                      </q-item>
                    </template>
                    </q-select>
                  </div>

                  <div class="q-mb-md">
                    <q-toggle
                      class="q-mb-md"
                      v-model="produto.ativo"
                      label="Status"
                    >
                      <q-tooltip>
                        Usada para ativar ou inativar o produto.
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useProdutoStore } from 'src/stores/produtos/ProdutoStore';
import { useCategoriaStore } from 'src/stores/categorias/CategoriaStore';
import type { ProdutoModel } from 'src/models/produtos/ProdutoModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = useProdutoStore();
const categoriaStore = useCategoriaStore();
const crudForm = ref<QForm>();

const categorias = computed(() => categoriaStore.getAllCategoriasAtivas);

const produto = ref<ProdutoModel>({
  id: '',
  alteracaoData: null,
  alteracaoUsuario: '',
  cadastroData: null,
  cadastroUsuario: '',
  ativo: true,
  nome: '',
  valor: 0,
  categoria_id: ''
});

onMounted(async () => {
    await categoriaStore.loadAllCategorias();

    const id = route.params.id as string | undefined;
    if (id) {
        const model = await store.getProdutoById(id);
        if (model) {
            produto.value = { ...model };
        } else {
            Notify.create({
                message: 'Produto não encontrado.',
                type: 'negative'
            });
            await router.push('/produtos');
        }
    }
});

const onSave = async () => {
  const isValid = await crudForm.value?.validate(true);
  if (crudForm.value && !isValid) {
      return;
  }

  if (produto.value.id) {
      await store.updateProduto(produto.value);
  } else {
      await store.addProduto(produto.value);
  }
  await router.push('/produtos');
};

</script>