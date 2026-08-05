/**
 * Ajustes pós-install/pre-build para ambientes que removem o bit de execução
 * dos binários nativos (ex.: Hostinger) e que quebram com sass-embedded.
 *
 * Importante: allowBuilds.esbuild deve ficar `false` — o postinstall do esbuild
 * tenta EXECUTAR o binário ainda sem +x e falha com EACCES na instalação.
 */
import { chmodSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const nodeModules = join(root, 'node_modules')
const pnpmDir = join(nodeModules, '.pnpm')

function makeExecutable(file) {
  try {
    const mode = statSync(file).mode
    chmodSync(file, mode | 0o111)
    return true
  } catch {
    return false
  }
}

function stripSassEmbedded() {
  if (!existsSync(pnpmDir)) return 0
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
  return removed
}

function chmodEsbuildBins() {
  if (!existsSync(pnpmDir)) return 0
  let fixed = 0
  for (const entry of readdirSync(pnpmDir)) {
    if (!entry.startsWith('@esbuild+') && !entry.startsWith('esbuild@')) continue
    const base = join(pnpmDir, entry, 'node_modules')
    if (!existsSync(base)) continue
    for (const pkg of readdirSync(base)) {
      const pkgDir = join(base, pkg)
      if (pkg === '@esbuild') {
        for (const platform of readdirSync(pkgDir)) {
          const bin = join(pkgDir, platform, 'bin', 'esbuild')
          if (existsSync(bin) && makeExecutable(bin)) fixed++
        }
      }
      if (pkg === 'esbuild') {
        const bin = join(pkgDir, 'bin', 'esbuild')
        if (existsSync(bin) && makeExecutable(bin)) fixed++
      }
    }
  }
  return fixed
}

function chmodDotBins() {
  let fixed = 0
  const bins = join(nodeModules, '.bin')
  if (existsSync(bins)) {
    for (const name of readdirSync(bins)) {
      if (makeExecutable(join(bins, name))) fixed++
    }
  }
  if (!existsSync(pnpmDir)) return fixed
  for (const entry of readdirSync(pnpmDir)) {
    const nested = join(pnpmDir, entry, 'node_modules', '.bin')
    if (!existsSync(nested)) continue
    for (const name of readdirSync(nested)) {
      if (makeExecutable(join(nested, name))) fixed++
    }
  }
  return fixed
}

const stripped = stripSassEmbedded()
const esbuildFixed = chmodEsbuildBins()
const binsFixed = chmodDotBins()

process.stdout.write(
  `[postinstall-host] strip-sass-embedded=${stripped} esbuild=+x:${esbuildFixed} bins=+x:${binsFixed}\n`,
)
