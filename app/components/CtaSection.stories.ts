import type { Meta, StoryObj } from '@storybook/vue3'
import CtaSection from './CtaSection.vue'

const meta = {
  title: 'Sections/CtaSection',
  component: CtaSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CtaSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
