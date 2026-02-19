import { httpClient } from '@/shared/lib/http-client';

export type SearchResultLesson = { id: string; title: string; level: string };
export type SearchResultTopic = { id: string; slug: string; title: string };
export type SearchResultText = { id: string; title: string };

export type SearchResponse = {
  lessons: SearchResultLesson[];
  topics: SearchResultTopic[];
  texts: SearchResultText[];
};

export const searchApi = {
  search: (q: string) =>
    httpClient.get('search', { searchParams: { q } }).json<SearchResponse>(),
};
