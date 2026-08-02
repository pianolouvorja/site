import type { Meta, StoryObj } from '@storybook/vue3'
import HowItWorksSection from './HowItWorksSection.vue'

const meta = {
  title: 'Sections/HowItWorksSection',
  component: HowItWorksSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Timeline with 4 steps. Data from `steps` in `~/data/site`. Alternating left/right layout.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HowItWorksSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
