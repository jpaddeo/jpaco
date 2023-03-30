import { trytm } from '@bdsqqq/try'
import { select } from '@clack/prompts'
import { confirm } from '@clack/prompts'
import { isCancel } from '@clack/prompts'
import { cancel } from '@clack/prompts'
import { multiselect } from '@clack/prompts'
import { intro, outro, text } from '@clack/prompts'

import colors from 'picocolors'

import { COMMIT_TYPES } from './commit-types.js'
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit } from './git.js'
import { cancelProgram } from './utils.js'

intro(
  colors.cyan(
    `Comando asistente para la creación de commits desarrollado por ${colors.inverse(
      colors.blue(colors.bold('@jpaddeo'))
    )}`
  )
)

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles())
// const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles) {
  outro(colors.red('Error: comprobá que estás es un repositorio de git'))
  process.exit(1)
}
if (changedFiles.length > 0) {
  const files = await multiselect({
    message: colors.cyan(
      'Selecciona los archivos que quieras agregar al commit'
    ),
    options: changedFiles.map((file) => ({ value: file, label: file }))
  })

  if (isCancel(files)) cancelProgram()

  await gitAdd(files)
}

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit'),
  options: Object.entries(COMMIT_TYPES).map(([cKey, cValue]) => ({
    value: `${cKey}${cValue.emoji}`,
    label: `${cValue.emoji} ${cKey.padEnd(8, ' ')} - ${cValue.description}`
  }))
})

if (isCancel(commitType)) {
  cancel('¡Te fuiste sin saludar, commit cancelado!')
  process.exit(1)
}

const commitScope = await text({
  message: colors.cyan('Introduce el módulo / alcance del commit (scope)'),
  placeholder: 'db'
})

if (isCancel(commitScope)) cancelProgram()

const commitMessage = await text({
  message: colors.cyan('Introduce el mensaje del commit'),
  placeholder: 'fixing error',
  validate: (value) => {
    if (value.length === 0)
      return colors.red('❌ El mensaje de commit no puede ser vacío')
    if (value.length > 50)
      return colors.yellow(
        '❕ El mensaje de commit no puede ser mayor a 50 caracteres'
      )
  }
})
if (isCancel(commitMessage)) cancelProgram()

const commit = `${commitType}(${commitScope}): ${commitMessage}`

const commitConfirm = await confirm({
  initialValue: true,
  message: `${colors.cyan(
    '¿Estás seguro que commitear con el siguiente mensaje'
  )}: ${colors.blue(colors.bold(commit))}?`
})
if (isCancel(commitConfirm)) cancelProgram()

if (!commitConfirm) {
  outro(
    colors.yellow(
      '❕ Commit cancelado. De todos modos, ¡gracias por usar nuestro comando asistente!'
    )
  )
  process.exit(0)
}

await gitCommit(commit)

outro(
  colors.green(
    '✅ Commit creado con éxito. ¡Gracias por usar nuestro comando asistente!'
  )
)
