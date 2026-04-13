export interface NavigationItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  order: number;
  parent_key?: string;
  roles?: string[];
  badge_source?: string;
}

export interface NavigationConfig {
  items: NavigationItem[];
}
