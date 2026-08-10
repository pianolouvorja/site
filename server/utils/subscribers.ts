export interface Subscriber {
  email: string
  createdAt: string
  tags: string[]
  active: boolean
}

interface ButtondownSub {
  email: string
  creation_date?: string
  created_at?: string
  tags?: string[]
  secondary_type?: string
}

interface ButtondownResponse {
  results?: ButtondownSub[]
  next?: string | null
  count?: number
}

function parseSub(raw: ButtondownSub): Subscriber {
  return {
    email: raw.email,
    createdAt: raw.creation_date ?? raw.created_at ?? '',
    tags: raw.tags ?? [],
    active: !raw.secondary_type || raw.secondary_type === 'regular',
  }
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return []

  const subscribers: Subscriber[] = []
  let url: string | null = 'https://api.buttondown.com/api/v1/subscribers'

  while (url !== null) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!res.ok) break
    const data: ButtondownResponse = await res.json()
    const results = data.results ?? []
    for (const sub of results) {
      subscribers.push(parseSub(sub))
    }
    url = data.next ?? null
  }

  return subscribers
}

export async function getSubscriberCount(): Promise<number> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return 0
  try {
    const res: Response = await fetch('https://api.buttondown.com/api/v1/subscribers', {
      headers: { Authorization: `Token ${config.buttondownApiKey}` },
    })
    if (!res.ok) return 0
    const data: ButtondownResponse = await res.json()
    return data.count ?? data.results?.length ?? 0
  } catch {
    return 0
  }
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const config = useRuntimeConfig()
  if (!config.buttondownApiKey) return false
  try {
    const res: Response = await fetch(
      `https://api.buttondown.com/api/v1/subscribers/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Token ${config.buttondownApiKey}` },
      },
    )
    return res.ok || res.status === 204
  } catch {
    return false
  }
}
