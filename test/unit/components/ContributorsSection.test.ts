import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import ContributorsSection from '~/components/ContributorsSection.vue'

describe('ContributorsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state on mount', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.contributors__state').exists()).toBe(true)
    expect(wrapper.find('.contributors__spinner').exists()).toBe(true)
  })

  it('shows error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(wrapper.find('.contributors__state--error').exists()).toBe(true)
  })

  it('shows error state when fetch returns non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    } as never)
    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(wrapper.find('.contributors__state--error').exists()).toBe(true)
  })

  it('renders contributors grid with data from API', async () => {
    const mockContributors = Array.from({ length: 15 }, (_, i) => ({
      login: `user${i}`,
      avatar_url: `https://example.com/avatar${i}.png`,
      html_url: `https://github.com/user${i}`,
      contributions: i + 1,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockContributors,
    } as never)

    const wrapper = mount(ContributorsSection, {
      global: {
        stubs: ['i'],
      },
    })
    await flushPromises()

    // Should only show 12 (sliced)
    const cards = wrapper.findAll('.contributors__card')
    expect(cards).toHaveLength(12)

    // Check first card
    expect(cards[0].attributes('href')).toBe('https://github.com/user0')
    expect(cards[0].find('img').attributes('src')).toBe('https://example.com/avatar0.png')
  })

  it('shows view-all link when contributors are loaded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          login: 'user1',
          avatar_url: 'https://example.com/a.png',
          html_url: 'https://github.com/user1',
          contributions: 5,
        },
      ],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(wrapper.find('.contributors__view-all').exists()).toBe(true)
  })

  it('hides view-all link when no contributors and no error', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(wrapper.find('.contributors__view-all').exists()).toBe(false)
  })

  it('renders CTA section with 4 ways', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(wrapper.find('.contributors__cta').exists()).toBe(true)
    const ways = wrapper.findAll('.contributors__ways li')
    expect(ways).toHaveLength(4)
  })
})
