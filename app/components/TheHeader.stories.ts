import type { Meta, StoryObj } from '@storybook/vue3'
import TheHeader from './TheHeader.vue'

const meta = {
  title: 'Layout/TheHeader',
  component: TheHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TheHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
