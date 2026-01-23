/**
 * PanSou API 搜索相关类型定义
 */

/** 网盘链接对象 */
export interface Link {
  type: CloudType;
  url: string;
  password: string;
  datetime?: string;
  work_title?: string;
}

/** 搜索结果对象 */
export interface SearchResult {
  message_id: string;
  unique_id: string;
  channel: string;
  datetime: string;
  title: string;
  content: string;
  links: Link[];
  tags?: string[];
  images?: string[];
}

/** 合并后的网盘链接对象 */
export interface MergedLink {
  url: string;
  password: string;
  note: string;
  datetime: string;
  source: string;
  images?: string[];
}

/** 搜索API响应 */
export interface SearchResponse {
  total: number;
  results: SearchResult[];
  merged_by_type: Record<CloudType, MergedLink[]>;
}

/** 网盘类型 */
export type CloudType =
  | "baidu"
  | "aliyun"
  | "quark"
  | "tianyi"
  | "uc"
  | "mobile"
  | "115"
  | "pikpak"
  | "xunlei"
  | "123"
  | "magnet"
  | "ed2k"
  | "others";

/** 网盘类型配置 */
export interface CloudTypeConfig {
  label: string;
  color: string;
  icon: string;
}

/** 健康检查响应 */
export interface HealthResponse {
  status: string;
  auth_enabled: boolean;
  plugins_enabled: boolean;
  plugin_count: number;
  plugins: string[];
  channels_count: number;
  channels: string[];
}

/** 认证响应 */
export interface AuthResponse {
  token: string;
  expires_at: number;
  username: string;
}

/** 令牌验证响应 */
export interface VerifyResponse {
  valid: boolean;
  username: string;
}
