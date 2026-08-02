import type { Meta, StoryObj } from '@storybook/vue3'
import StatsSection from './StatsSection.vue'

const meta = {
  title: 'Sections/StatsSection',
  component: StatsSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Stats bar showing key metrics (8+ features, 100% free, 0 installs, PWA offline).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
