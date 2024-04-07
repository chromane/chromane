export type PaginationDataRowPerPage = 10 | 20 | 30;

export interface PaginationData {
  total: number;
  row_per_page: PaginationDataRowPerPage;
  start_current_page: number;
  cursor_id: string;
}
