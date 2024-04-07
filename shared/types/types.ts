export type BackendResponse<TypeVar> = {
  success: Boolean;
  code: string;
  result: TypeVar;
};

export const BackendCodes = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  METHOD_NOT_FOUND: "METHOD_NOT_FOUND",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNAUTHORIZED_RECORD: "UNAUTHORIZED_RECORD",
};

export type PaginationMethod = "start_after" | "end_before" | null;

export enum UserStatus {
  new = "new",
  extension_user = "extension_user",
  admin = "admin",
}
export enum ConfigMode {
  dev_browser = "dev_browser", // when compiling for testing in dev server
  dev_extension = "dev_extension", // when compiling for temp_extension_install
  sandbox = "sandbox", // sandbox
  dev = "dev", // development
  prod = "prod", // production
}
export enum PriceName {
  yearly = "yearly",
  monthly = "monthly",
  free = "free",
}

export interface Team {
  id: string;
  name: string;
  roles?: string[];
}

export interface Dict<D> {
  [key: string]: D;
}

export type SortDir = "asc" | "desc";

export type TableGetRowsRequestConfig = {
  limit: number;
  cursor_id?: string;
  pagin_method?: PaginationMethod;
  sort?: { field: string; dir: SortDir };
  filter?: any[][];
  include_query_meta?: boolean;
};

export type ExtensionConfig = {
  urls: {
    hosting: string;
  };
  mode: "dev" | "prod" | "extension" | "test";
  ext_name: string;
  ext_id: string;
  fb_id: string;
  extension_id: string;
};
