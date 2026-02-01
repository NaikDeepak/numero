import { LRUCache } from "lru-cache"

// Cache for storing generated forecasts for 24 hours
// Key: "YYYY-MM-DD-moolank-bhagyank-gender"
export const forecastCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
})
