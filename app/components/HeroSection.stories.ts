import type { Meta, StoryObj } from '@storybook/vue3'
import HeroSection from './HeroSection.vue'

const meta = {
  title: 'Sections/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hero section with headline, stats, and CTA buttons. No props — all content comes from i18n.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
