import { useLocalStorage } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'

export type FeedItem = {
    title: string
    link: string
    pubDate: string
    content: string
    contentSnippet?: string
    guid?: string
    isoDate?: string
    itunes?: Record<string, any>
}

export const useNewsStore = defineStore('news', () => {
    const news = skipHydrate(useLocalStorage<FeedItem[]>('news', []))

    function newsToStore(newsInfo: FeedItem[]) {
        news.value = newsInfo
    }

    return {
        news,
        newsToStore
    }
})