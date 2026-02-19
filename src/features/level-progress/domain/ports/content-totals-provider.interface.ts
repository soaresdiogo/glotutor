export type ContentTotals = {
  lessonsTotal: number;
  podcastsTotal: number;
  readingsTotal: number;
  conversationsTotal: number;
};

export interface IContentTotalsProvider {
  getTotals(language: string, cefrLevel: string): Promise<ContentTotals>;
}
