import { cancel } from '@clack/prompts'

export function cancelProgram(
  message = '¡Te fuiste sin saludar, commit cancelado!',
  code = 1
) {
  cancel(message)
  process.exit(code)
}
