const API_URL = '/api/portfolio'

let cachedData = null
let activePromise = null

export async function fetchPortfolioData(force = false) {
  if (cachedData && !force) {
    return cachedData
  }
  if (activePromise && !force) {
    return activePromise
  }

  activePromise = (async () => {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 6000) // 6.0 seconds timeout to support Vercel cold starts

      const res = await fetch(`${API_URL}?t=${Date.now()}`, { signal: controller.signal })
      clearTimeout(id)

      if (res.ok) {
        const data = await res.json()
        // Basic sanity check to ensure we received populated arrays
        if (data && data.projects && data.certificates) {
          cachedData = data
          return data
        }
      }
      return null
    } catch (err) {
      console.warn('FastAPI backend not running or unreachable. Falling back to local static data.', err.message)
      return null
    } finally {
      activePromise = null
    }
  })()

  return activePromise
}

export function clearPortfolioCache() {
  cachedData = null
  activePromise = null
}

