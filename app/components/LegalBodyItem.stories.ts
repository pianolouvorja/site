import type { Meta, StoryObj } from '@storybook/vue3'
import LegalBodyItem from './LegalBodyItem.vue'

const meta = {
  title: 'Legal/LegalBodyItem',
  component: LegalBodyItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Renders a legal document paragraph. Supports inline links via `{link}` placeholder in message text, subsection detection (regex `^\\d+\\.\\d+`), and optional external link styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Paragraph text. Use `{link}` to insert a link at that position.',
    },
    linkUrl: {
      control: 'text',
      description: 'URL for the inline link (optional).',
    },
    linkText: {
      control: 'text',
      description: 'Text for the inline link (optional, replaces `{link}`).',
    },
    external: {
      control: 'boolean',
      description: 'If true, link opens in new tab with rel=noopener.',
    },
    paragraphClass: {
      control: 'text',
      description: 'Custom CSS class for the paragraph element.',
    },
  },
} satisfies Meta<typeof LegalBodyItem>

export default meta
type Story = StoryObj<typeof meta>

export const PlainText: Story = {
  args: {
    message: 'This is a plain paragraph without any links. It renders as a simple text block.',
  },
}

export const Subsection: Story = {
  args: {
    message: '1.1 This is a subsection with a numbered prefix.',
  },
}

export const WithInternalLink: Story = {
  args: {
    message: 'Check our {link} for more information about how we handle data.',
    linkUrl: '/privacy',
    linkText: 'privacy policy',
    external: false,
  },
}

export const WithExternalLink: Story = {
  args: {
    message: 'Visit the {link} to explore the codebase.',
    linkUrl: 'https://github.com/pianolouvorja',
    linkText: 'GitHub repository',
    external: true,
  },
}

export const CustomClass: Story = {
  args: {
    message: 'This paragraph has a custom CSS class applied.',
    paragraphClass: 'legal-highlight',
  },
}
