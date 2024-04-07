export enum UserStatus {
  new = "new",
  extension_user = "extension_user",
  admin = "admin",
}
export enum ConfigMode {
  dev_browser = "dev_browser", // when compiling for testing in dev server
  dev_extension = "dev_extension", // when compiling for temp_extension_install
  prod = "prod", // production
}

export interface Loop extends LoopInput {
  id?: string;
  page_url: string;
  identeficator: string;
  video_duration: number;
  index: number;
  img: string | null;
  created_at?: number;
  user_id?: string;
  is_screenshot_available: boolean;
}

export interface LoopInput {
  title: string;
  time_start: number;
  time_end: number;
  playback_speed: number;
}

export interface ActionLoopState {
  is_active: boolean;
  loop_time: number;
  loop: Loop | null;
  is_looping: boolean;
}
export interface FBIframeInitData {
  location_data: ContentLocation;
  action_loop_state: ActionLoopState;
  domain_data: DomainData;
}

export interface INotification {
  text: string;
  type: "error" | "success";
  id?: string;
}

export interface DomainData {
  domain: string;
  selector: string;
}
export interface ContentLocation {
  url: string | null;
  is_landing: boolean;
}

export interface ContentVideo extends ContentVideoDetectedData {
  img: string | null;
  page_url: string;
  status?: string;
  autohide?: "hidden" | "visible";
}

export interface ContentVideoDetectedData {
  title: string;
  id: string;
  index: number;
  video_src: string;
  window_type: VideoWindowType;
  duration: number;
  current_time: number;
}

export interface GetScreenshotTaintedArg {
  content_video: ContentVideo;
  time_frame: number;
  screen_type: "video" | "loop";
  loop_id?: string;
}

export interface VideoScreenFromExtIframeResponse {
  args: GetScreenshotTaintedArg;
  img: string;
}

export type ErrorsCode = "unauthorized" | "handled" | "api_error" | "unhandled" | "no_words" | "recall" | "not-allowed";

export type VideoWindowType = "iframe" | "content";
