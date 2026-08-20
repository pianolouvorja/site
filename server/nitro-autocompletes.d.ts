// Global declarations for Nitro auto-imported server utils.
// These are auto-imported at runtime by Nitro but vue-tsc needs explicit types.

declare function verifyMailConnection(): Promise<{
  configured: boolean
  connected: boolean
  error?: string
}>

declare function sendMail(options: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<{ success: boolean; error?: string }>

declare function fetchSubscribers(): Promise<
  Array<{
    email: string
    createdAt: string
    tags: string[]
    active: boolean
  }>
>

declare function getSubscriberCount(): Promise<number>

declare function removeSubscriber(email: string): Promise<boolean>

declare function renderTemplate(
  template: string,
  params: { subject: string; body: string; unsubscribeUrl: string },
): string

declare function addToHistory(record: {
  date: string
  subject: string
  template: string
  total: number
  sent: number
  failed: number
  errors: string[]
}): void

declare function getHistory(): Array<{
  date: string
  subject: string
  template: string
  total: number
  sent: number
  failed: number
  errors: string[]
}>
