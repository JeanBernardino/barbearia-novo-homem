import { defineBoot } from '#q-app/wrappers'
import PasswordInput from 'src/components/global/PasswordInput.vue'
import ConfirmDialog from 'src/components/global/ConfirmDialog.vue'
import ComissaoCard from 'src/components/global/ComissaoCard.vue'
import TrabalhoTabContent from 'src/components/index/TrabalhoTabContent.vue'
import VendaTabContent from 'src/components/index/VendaTabContent.vue'
import BarChart from 'src/components/global/BarChart.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    PasswordInput: typeof PasswordInput,
    ConfirmDialog: typeof ConfirmDialog,
    ComissaoCard: typeof ComissaoCard,
    TrabalhoTabContent: typeof TrabalhoTabContent,
    VendaTabContent: typeof VendaTabContent,
    BarChart: typeof BarChart,
  }
}

export default defineBoot(({ app }) => {
  app.component('PasswordInput', PasswordInput)
  app.component('ConfirmDialog', ConfirmDialog)
  app.component('ComissaoCard', ComissaoCard)
  app.component('TrabalhoTabContent', TrabalhoTabContent)
  app.component('VendaTabContent', VendaTabContent)
  app.component('BarChart', BarChart)
})
