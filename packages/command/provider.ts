import { SearchProvider, SearchResult } from "./types";
import { User } from "@jr/types";

class SearchRegistry {
  private providers = new Map<string, SearchProvider>();

  /**
   * Register a search provider.
   * Returns a cleanup function to unregister.
   */
  register(provider: SearchProvider): () => void {
    this.providers.set(provider.id, provider);
    return () => this.unregister(provider.id);
  }

  /**
   * Unregister a provider by ID.
   */
  unregister(id: string): void {
    this.providers.delete(id);
  }

  /**
   * Query all registered search providers concurrently.
   */
  async search(query: string, user: User): Promise<SearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const searchPromises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        const results = await provider.search(cleanQuery, user);
        return results;
      } catch (error) {
        console.error(`[SearchRegistry] provider '${provider.name}' failed:`, error);
        return [];
      }
    });

    const resultsArray = await Promise.all(searchPromises);
    return resultsArray.flat();
  }

  /**
   * Clear all registered search providers.
   */
  clear(): void {
    this.providers.clear();
  }
}

export const searchRegistry = new SearchRegistry();
