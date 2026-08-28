export interface Subscriber {
  email: string
  createdAt: string
  tags: string[]
  active: boolean
  locale: string
}

interface ButtondownSubscriber {
  email: string
  creation_date?: string
  created_at?: string
  tags?: string[]
  secondary_type?: string
  metadata?: Record<string, string>
}

interface ButtondownResponse {
  results?: ButtondownSubscriber[]
  next?: string | null
  count?: number
}

export function parseSubscriber(raw: ButtondownSubscriber): Subscriber {
  return {
    email: raw.email,
    createdAt: raw.creation_date ?? raw.created_at ?? '',
    tags: raw.tags ?? [],
    active: !raw.secondary_type || raw.secondary_type === 'regular',
    locale: raw.metadata?.locale ?? 'pt-BR',
  }
}

export const parseSub = parseSubscriber

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return []

  const subscribers: Subscriber[] = []
  let url: string | null = 'https://api.buttondown.com/v1/subscribers'

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!response.ok) break

    const data = (await response.json()) as ButtondownResponse
    subscribers.push(...(data.results ?? []).map(parseSubscriber))
    url = data.next ?? null
  }

  return subscribers
}

export async function getSubscriberCount(): Promise<number> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return 0

  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!response.ok) return 0

    const data = (await response.json()) as ButtondownResponse
    return data.count ?? data.results?.length ?? 0
  } catch {
    return 0
  }
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return false

  try {
    const response = await fetch(
      `https://api.buttondown.com/v1/subscribers/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Token ${config.buttondownApiKey}` },
      },
    )
    return response.ok || response.status === 204
  } catch {
    return false
  }
}
