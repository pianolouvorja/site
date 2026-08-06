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

  // ========================================================================
  // ADDITIONAL TESTS — kill mutation survivors
  // ========================================================================

  it('slice(0,12): exactly 12 contributors shown when API returns 12', async () => {
    const mockContributors = Array.from({ length: 12 }, (_, i) => ({
      login: `user${i}`,
      avatar_url: `https://example.com/avatar${i}.png`,
      html_url: `https://github.com/user${i}`,
      contributions: i + 1,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockContributors,
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    const cards = wrapper.findAll('.contributors__card')
    // Exactly 12 — mutant changing 12→11 would show 11
    expect(cards).toHaveLength(12)
  })

  it('slice(0,12): exactly 13 from API => still 12 in UI (kills boundary mutants)', async () => {
    // Use unique names that aren't substrings of each other
    const names = [
      'alice',
      'bob',
      'carol',
      'dave',
      'eve',
      'frank',
      'grace',
      'heidi',
      'ivan',
      'judy',
      'ken',
      'leo',
      'mallory',
    ]
    const mockContributors = names.map((name, i) => ({
      login: name,
      avatar_url: `https://example.com/avatar${i}.png`,
      html_url: `https://github.com/${name}`,
      contributions: i + 1,
    }))

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockContributors,
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    const cards = wrapper.findAll('.contributors__card')
    // Mutant 12→13 would show 13 cards. Original shows 12.
    expect(cards).toHaveLength(12)
    // Verify 13th (mallory) is NOT present
    expect(wrapper.text()).not.toContain('mallory')
  })

  it('!res.ok: ok=true does NOT throw (kills ! → removal mutant)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ login: 'user1', avatar_url: 'url', html_url: 'url', contributions: 1 }],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // If mutant removes ! (res.ok instead of !res.ok), it would throw even on ok=true
    // => fetchError=true, no grid shown
    expect(wrapper.find('.contributors__grid').exists()).toBe(true)
    expect(wrapper.find('.contributors__state--error').exists()).toBe(false)
  })

  it('res.ok=false status=404 throws and shows error (kills res.ok→!res.ok mutant)', async () => {
    // Provide .json() so that if mutant removes the throw,
    // the code continues and tries to render grid (not error)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => [{ login: 'user1', avatar_url: 'url', html_url: 'url', contributions: 1 }],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // Original: !res.ok=true => throw => error state
    // Mutant (!res.ok → false): no throw, renders grid with the mock data
    // This test kills it because grid should NOT appear
    expect(wrapper.find('.contributors__state--error').exists()).toBe(true)
    expect(wrapper.find('.contributors__grid').exists()).toBe(false)
  })

  it('loading.value=false after success (kills finally block mutants)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ login: 'user1', avatar_url: 'url', html_url: 'url', contributions: 1 }],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // After success: loading=false, so loading state div should NOT be visible
    expect(wrapper.find('.contributors__state').exists()).toBe(false)
    // Grid should be visible instead
    expect(wrapper.find('.contributors__grid').exists()).toBe(true)
  })

  it('loading.value=false after error (kills finally block mutants)', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // After error: loading=false, error=true
    // loading state (spinner) should NOT be visible, error state SHOULD
    expect(wrapper.find('.contributors__spinner').exists()).toBe(false)
    expect(wrapper.find('.contributors__state--error').exists()).toBe(true)
  })

  it('view-all hidden when loading (kills v-if condition mutants)', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // loading=true => !loading is false => view-all hidden
    expect(wrapper.find('.contributors__view-all').exists()).toBe(false)
  })

  it('view-all hidden when fetchError=true (kills v-if !fetchError mutant)', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // fetchError=true => !fetchError is false => view-all hidden
    expect(wrapper.find('.contributors__view-all').exists()).toBe(false)
  })

  it('view-all hidden when contributors is empty array (kills length > 0 mutant)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    // contributors.length=0 => length > 0 is false => view-all hidden
    // Mutant (length >= 0 or removal) would show view-all
    expect(wrapper.find('.contributors__view-all').exists()).toBe(false)
  })

  it('contributor card renders all fields correctly (kills template mutants)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.png',
          html_url: 'https://github.com/testuser',
          contributions: 42,
        },
      ],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    const card = wrapper.find('.contributors__card')
    expect(card.attributes('href')).toBe('https://github.com/testuser')
    expect(card.attributes('target')).toBe('_blank')

    const img = card.find('img')
    expect(img.attributes('src')).toBe('https://example.com/avatar.png')
    expect(img.attributes('alt')).toBe('testuser')

    // Login with @ prefix
    expect(card.find('.contributors__name').text()).toBe('@testuser')
    // Contributions count
    expect(card.find('.contributors__count').text()).toContain('42')
  })

  it('ctaWays computed: verifies each way has icon and text (kills array mutants)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    const ways = wrapper.findAll('.contributors__ways li')
    expect(ways).toHaveLength(4)

    // Verify icons are different (kills reordering/duplication mutants)
    const icons = ways.map((w) => w.find('[class*="ti-"]').classes().join(' '))
    expect(icons[0]).toContain('ti-code')
    expect(icons[1]).toContain('ti-bug')
    expect(icons[2]).toContain('ti-language')
    expect(icons[3]).toContain('ti-share')
  })

  it('fetch is called with correct API URL (kills StringLiteral URL mutant)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('/api/github/contributors')
  })

  it('ctaWays: verifies each way has non-empty translated text (kills i18n key mutants)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await flushPromises()

    const ways = wrapper.findAll('.contributors__ways li')
    // Each way must have actual text content (kills t('') → empty string mutant)
    const texts = ways.map((w) => w.find('span').text())
    expect(texts[0]).not.toBe('')
    expect(texts[1]).not.toBe('')
    expect(texts[2]).not.toBe('')
    expect(texts[3]).not.toBe('')
    // All texts should be unique
    expect(new Set(texts).size).toBe(4)
  })

  it('initial contributors array is empty before fetch resolves (kills ArrayDeclaration mutant)', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves

    const wrapper = mount(ContributorsSection, { global: { stubs: ['i'] } })
    await wrapper.vm.$nextTick()

    // Access internal state — initial ref<Contributor[]>([]) must be empty
    // Mutant replacing [] with ["Stryker was here"] would make this length 1
    const vm = wrapper.vm as unknown as { contributors: unknown[] }
    expect(vm.contributors).toHaveLength(0)
  })
})
