import type { Meta, StoryObj } from '@storybook/vue3'
import StatsSection from './StatsSection.vue'

const meta = {
  title: 'Sections/StatsSection',
  component: StatsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StatsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
