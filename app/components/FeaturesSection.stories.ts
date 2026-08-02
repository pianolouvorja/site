import type { Meta, StoryObj } from '@storybook/vue3'
import FeaturesSection from './FeaturesSection.vue'

const meta = {
  title: 'Sections/FeaturesSection',
  component: FeaturesSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FeaturesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
