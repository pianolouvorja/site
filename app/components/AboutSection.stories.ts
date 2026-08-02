import type { Meta, StoryObj } from '@storybook/vue3'
import AboutSection from './AboutSection.vue'

const meta = {
  title: 'Sections/AboutSection',
  component: AboutSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AboutSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
