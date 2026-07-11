import { APP_VERSION } from '../appVersion'

export type RemoteVersion = {
  version: string
  builtAt?: number
}

function versionUrl(): string {
  const base = import.meta.env.BASE_URL || './'
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}version.json`
}

/** 拉取线上最新版本号（绕过缓存） */
export async function fetchRemoteVersion(
  signal?: AbortSignal,
): Promise<RemoteVersion | null> {
  try {
    const res = await fetch(`${versionUrl()}?_=${Date.now()}`, {
      cache: 'no-store',
      signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as RemoteVersion
    if (!data?.version || typeof data.version !== 'string') return null
    return data
  } catch {
    return null
  }
}

export function isOutdated(
  local: string = APP_VERSION,
  remote: string,
): boolean {
  return Boolean(remote) && remote !== local
}
