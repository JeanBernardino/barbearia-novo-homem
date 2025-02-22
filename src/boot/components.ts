import { defineBoot } from '#q-app/wrappers'
import PasswordInput from 'src/components/global/PasswordInput.vue'
import ConfirmDialog from 'src/components/global/ConfirmDialog.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    PasswordInput: typeof PasswordInput,
    ConfirmDialog: typeof ConfirmDialog
  }
}

export default defineBoot(({ app }) => {
  app.component('PasswordInput', PasswordInput)
  app.component('ConfirmDialog', ConfirmDialog)
})
