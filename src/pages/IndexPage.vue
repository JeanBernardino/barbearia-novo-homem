<template>
  <q-page>
    <q-tabs
      v-model="tab"
      dense
      active-color="primary"
      indicator-color="primary"
      class="bg-secondary"
      align="justify"
    >
      <q-tab name="trabalho" label="Trabalho" icon="work" />
      <q-tab name="venda" label="Venda" icon="inventory" />
    </q-tabs>

    <q-tab-panels v-model="tab" 
      animated
      swipeable
      infinite
      class="fit"
    >
      <q-tab-panel name="trabalho">
        <TrabalhoTabContent class="fit" />
      </q-tab-panel>

      <q-tab-panel name="venda">
        <VendaTabContent class="fit" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('trabalho')

</script>