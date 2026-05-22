const API_URL = '/api/portfolio'

export async function fetchPortfolioData() {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 1500) // Timeout after 1.5 seconds

    const res = await fetch(API_URL, { signal: controller.signal })
    clearTimeout(id)

    if (res.ok) {
      const data = await res.json()
      // Basic sanity check to ensure we received populated arrays
      if (data && data.projects && data.certificates) {
        return data
      }
    }
    return null
  } catch (err) {
    console.warn('FastAPI backend not running or unreachable. Falling back to local static data.', err.message)
    return null
  }
}
