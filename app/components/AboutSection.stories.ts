import type { Meta, StoryObj } from '@storybook/vue3'
import AboutSection from './AboutSection.vue'

const meta = {
  title: 'Sections/AboutSection',
  component: AboutSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'About section with open-source card visual, description text, and stats (100% free, 0 installs, PWA).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
