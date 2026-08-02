import type { Meta, StoryObj } from '@storybook/vue3'
import PlatformsSection from './PlatformsSection.vue'

const meta = {
  title: 'Sections/PlatformsSection',
  component: PlatformsSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Platform comparison: Desktop (Electron) and Web (PWA) with feature lists.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PlatformsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
