import { defineBoot } from '#q-app/wrappers'
import PasswordInput from 'src/components/global/PasswordInput.vue'
import ConfirmDialog from 'src/components/global/ConfirmDialog.vue'
import ComissaoCard from 'src/components/global/ComissaoCard.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    PasswordInput: typeof PasswordInput,
    ConfirmDialog: typeof ConfirmDialog,
    ComissaoCard: typeof ComissaoCard
  }
}

export default defineBoot(({ app }) => {
  app.component('PasswordInput', PasswordInput)
  app.component('ConfirmDialog', ConfirmDialog)
  app.component('ComissaoCard', ComissaoCard)
})
