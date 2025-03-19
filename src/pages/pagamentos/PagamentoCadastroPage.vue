<template>
  <q-page padding>
      <q-form ref="crudForm">
          <div class="column">
              <div class="column">
                  <div class="q-mb-md">
                    <q-input 
                      v-model="pagamento.nome" 
                      type="text" 
                      label="Nome" 
                      lazy-rules
                      :rules="[
                        val => !!val || 'Necessário informar um nome.',
                      ]"
                      outlined
                    />
                  </div>

                  <q-toggle
                    class="q-mb-md"
                    v-model="pagamento.ativo"
                    label="Status"
                  >
                    <q-tooltip>
                      Usada para ativar ou inativar o pagamento.
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
import { usePagamentoStore } from 'src/stores/pagamentos/PagamentoStore'
import type { PagamentoModel } from 'src/models/pagamentos/PagamentoModel';
import { Notify, QForm } from 'quasar';

const route = useRoute();
const router = useRouter();
const store = usePagamentoStore()
const crudForm = ref<QForm>()

const pagamento = ref<PagamentoModel>({
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
      const model = await store.getPagamentoById(id);
      if (model) {
          pagamento.value = { ...model };
      } else {
          Notify.create({
              message: 'Pagamento não encontrado.',
              type: 'negative'
          })
          await router.push('/pagamentos');
      }
  }
});

const onSave = async () => {
  const isValid = await crudForm.value?.validate(true);
  if (crudForm.value && !isValid) {
      return;
  }

  if (pagamento.value.id) {
      await store.updatePagamento(pagamento.value);
  } else {
      await store.addPagamento(pagamento.value);
  }
  await router.push('/pagamentos');
};
</script>