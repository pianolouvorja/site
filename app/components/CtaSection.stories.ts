import type { Meta, StoryObj } from '@storybook/vue3'
import CtaSection from './CtaSection.vue'

const meta = {
  title: 'Sections/CtaSection',
  component: CtaSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Call-to-action section with rocket icon, gradient button linking to app, and meta badges.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CtaSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
