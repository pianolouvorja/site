import type { Meta, StoryObj } from '@storybook/vue3'
import FeaturesSection from './FeaturesSection.vue'

const meta = {
  title: 'Sections/FeaturesSection',
  component: FeaturesSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Grid of 8 feature cards (media, liturgy, bible, projection, tools, player, settings, offline). Data from `webFeatures` in `~/data/site`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeaturesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
