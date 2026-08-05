import type { Meta, StoryObj } from '@storybook/vue3'
import NewsletterForm from './NewsletterForm.vue'

const meta = {
  title: 'Components/NewsletterForm',
  component: NewsletterForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof NewsletterForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
