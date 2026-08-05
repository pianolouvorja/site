import type { Meta, StoryObj } from '@storybook/vue3'
import TheFooter from './TheFooter.vue'

const meta = {
  title: 'Layout/TheFooter',
  component: TheFooter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Site footer with social links, navigation, copyright year, and legal links.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TheFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
