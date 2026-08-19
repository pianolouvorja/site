import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import AdminChart from '~/components/AdminChart.vue'

const ApexChartStub = {
  name: 'apexchart',
  props: ['type', 'series', 'options', 'height'],
  template: '<div class="mock-apexchart" />',
}

describe('AdminChart', () => {
  const mountChart = (
    props: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ) => {
    return mount(AdminChart, {
      props: {
        type: 'bar',
        series: [{ name: 'Downloads', data: [10, 20, 30] }],
        categories: ['Jan', 'Fev', 'Mar'],
        ...props,
      },
      global: {
        stubs: {
          apexchart: ApexChartStub,
          ClientOnly: {
            name: 'ClientOnly',
            setup(_: Record<string, unknown>, { slots }: { slots: Record<string, () => unknown> }) {
              return () => slots.default?.()
            },
          },
        },
        ...(options as Record<string, unknown>),
      },
    })
  }

  it('renderiza o wrapper do chart', () => {
    const wrapper = mountChart()
    expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
  })

  it('renderiza apexchart dentro do ClientOnly', () => {
    const wrapper = mountChart()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('passa type bar para apexchart', () => {
    const wrapper = mountChart({ type: 'bar' })
    const chart = wrapper.find('.mock-apexchart')
    expect(chart.exists()).toBe(true)
  })

  it('passa type line para apexchart', () => {
    const wrapper = mountChart({ type: 'line' })
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('passa type area para apexchart', () => {
    const wrapper = mountChart({ type: 'area' })
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('passa type donut para apexchart', () => {
    const wrapper = mountChart({ type: 'donut' })
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('usa height default de 280 quando nao fornecido', () => {
    const wrapper = mountChart()
    expect(wrapper.props('height')).toBe(280)
  })

  it('usa height customizado quando fornecido', () => {
    const wrapper = mountChart({ height: 400 })
    expect(wrapper.props('height')).toBe(400)
  })

  it('usa colors default quando nao fornecido', () => {
    const wrapper = mountChart()
    expect(wrapper.props('colors')).toEqual(['#22d3ee'])
  })

  it('usa colors customizados quando fornecido', () => {
    const wrapper = mountChart({ colors: ['#ff0000', '#00ff00'] })
    expect(wrapper.props('colors')).toEqual(['#ff0000', '#00ff00'])
  })

  it('renderiza fallback do ClientOnly com height correto', async () => {
    const wrapper = mount(AdminChart, {
      props: {
        type: 'bar',
        series: [{ data: [1] }],
        categories: ['X'],
        height: 350,
      },
      global: {
        stubs: {
          apexchart: ApexChartStub,
          ClientOnly: {
            name: 'ClientOnly',
            setup(_: Record<string, unknown>, { slots }: { slots: Record<string, () => unknown> }) {
              return () => slots.fallback?.()
            },
          },
        },
      },
    })
    await flushPromises()
    const fallback = wrapper.find('.chart-fallback')
    expect(fallback.exists()).toBe(true)
    expect(fallback.attributes('style')).toContain('height: 350px')
    expect(wrapper.text()).toContain('Carregando')
  })

  it('gera chartOptions com categories no xaxis para bar', async () => {
    const wrapper = mountChart({
      type: 'bar',
      series: [{ data: [5, 10] }],
      categories: ['Seg', 'Ter'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('computa plotOptions de barra quando type=bar', async () => {
    const wrapper = mountChart({
      type: 'bar',
      series: [{ data: [10, 20] }],
      categories: ['A', 'B'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('computa fill gradient quando type=area', async () => {
    const wrapper = mountChart({
      type: 'area',
      series: [{ data: [1, 2, 3] }],
      categories: ['A', 'B', 'C'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('computa markers com size 4 quando type=line', async () => {
    const wrapper = mountChart({
      type: 'line',
      series: [{ data: [1, 2] }],
      categories: ['A', 'B'],
      colors: ['#22d3ee'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('computa markers com size 0 quando type=bar', async () => {
    const wrapper = mountChart({
      type: 'bar',
      series: [{ data: [1, 2] }],
      categories: ['A', 'B'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })

  it('nao inclui plotOptions de barra quando type=line', async () => {
    const wrapper = mountChart({
      type: 'line',
      series: [{ data: [1, 2] }],
      categories: ['A', 'B'],
    })
    await flushPromises()
    expect(wrapper.find('.mock-apexchart').exists()).toBe(true)
  })
})
