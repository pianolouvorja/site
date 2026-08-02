import type { Meta, StoryObj } from '@storybook/vue3'
import PlatformsSection from './PlatformsSection.vue'

const meta = {
  title: 'Sections/PlatformsSection',
  component: PlatformsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlatformsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
