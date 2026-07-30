export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface NavLink {
  label: string
  href: string
}

export interface Step {
  num: number
  title: string
  desc: string
}

export const siteConfig = {
  name: 'PIANO LouvorJA',
  tagline: 'Gerenciamento de culto na web',
  description:
    'Sistema web para gerenciamento de cultos: bíblia, liturgia, hinário, cronômetro e muito mais. Simples, rápido, completo.',
  appUrl: 'https://app.pianolouvorja.com.br',
} as const

export const navLinks: NavLink[] = [
  { label: 'Início', href: '#hero' },
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Como funciona', href: '#how-it-works' },
  { label: 'Sobre', href: '#about' },
]

export const features: Feature[] = [
  {
    id: 'bible',
    title: 'Bíblia',
    description: 'Pesquisa rápida de textos, múltiplos idiomas e versões.',
    icon: 'ti-book-2',
  },
  {
    id: 'hymnal',
    title: 'Hinário',
    description: 'Acesso ao hinário completo com busca por número ou título.',
    icon: 'ti-music',
  },
  {
    id: 'liturgy',
    title: 'Liturgia',
    description: 'Monte a liturgia do culto com ordem programada e editável.',
    icon: 'ti-clipboard-text',
  },
  {
    id: 'projection',
    title: 'Projeção Multi-tela',
    description: 'Projete hinos, versículos e apresentações em múltiplas telas.',
    icon: 'ti-device-desktop',
  },
  {
    id: 'countdown',
    title: 'Contagem regressiva',
    description: 'Contagem regressiva para início do culto na tela de descanso.',
    icon: 'ti-clock',
  },
  {
    id: 'timer',
    title: 'Cronômetro',
    description: 'Controle de tempo de cada item da liturgia.',
    icon: 'ti-stopwatch',
  },
  {
    id: 'community',
    title: 'Comunidade',
    description: 'Templates compartilhados pela comunidade de usuários.',
    icon: 'ti-users',
  },
  {
    id: 'pwa',
    title: 'PWA',
    description: 'Instale como app no celular ou desktop, funciona offline.',
    icon: 'ti-device-mobile',
  },
]

export const steps: Step[] = [
  {
    num: 1,
    title: 'Acesse o app',
    desc: 'Entre no PIANO LouvorJA pelo navegador, sem instalação.',
  },
  {
    num: 2,
    title: 'Monte a liturgia',
    desc: 'Adicione hinários, textos bíblicos e ordem do culto.',
  },
  {
    num: 3,
    title: 'Projete e controle',
    desc: 'Projete para a congregação e controle o tempo de cada item.',
  },
]
