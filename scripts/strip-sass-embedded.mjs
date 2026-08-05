/**
 * Remove sass-embedded do grafo resolvível pelo Vite.
 * Sem o binário nativo (bloqueado no Hostinger), o embedded trava/falha;
 * o Vite então cai no pacote `sass` (JS puro).
 */
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm')
if (!existsSync(pnpmDir)) process.exit(0)

let removed = 0
for (const entry of readdirSync(pnpmDir)) {
  const isVite = entry.startsWith('vite@') || entry.startsWith('vite-node@')
  const isEmbedded = entry.startsWith('sass-embedded')
  if (!isVite && !isEmbedded) continue

  if (isEmbedded) {
    rmSync(join(pnpmDir, entry), { recursive: true, force: true })
    removed++
    continue
  }

  const link = join(pnpmDir, entry, 'node_modules', 'sass-embedded')
  if (existsSync(link)) {
    rmSync(link, { recursive: true, force: true })
    removed++
  }
}

if (removed > 0) {
  console.log(`[strip-sass-embedded] removed ${removed} path(s)`)
}
