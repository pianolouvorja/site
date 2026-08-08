import { describe, it, expect, vi } from 'vitest'

const mockUse = vi.fn()

vi.mock('vue3-apexcharts', () => ({
  default: { name: 'VueApexCharts' },
}))

vi.mock('#app', () => ({
  defineNuxtPlugin: (fn: (nuxtApp: { vueApp: { use: typeof mockUse } }) => void) => {
    return (nuxtApp: { vueApp: { use: typeof mockUse } }) => fn(nuxtApp)
  },
}))

import plugin from '~/plugins/apexcharts.client'

describe('apexcharts.client plugin', () => {
  it('registers VueApexCharts on the vue app', () => {
    const nuxtApp = { vueApp: { use: mockUse } }
    plugin(nuxtApp)
    expect(mockUse).toHaveBeenCalledTimes(1)
    expect(mockUse).toHaveBeenCalledWith({ name: 'VueApexCharts' })
  })
})
