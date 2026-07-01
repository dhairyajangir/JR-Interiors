import { User } from "@jr/types";
import { Permission } from "@jr/validation/permissions";

export interface CommandContext {
  router: {
    push: (href: string) => void;
    refresh: () => void;
  };
  logout: () => Promise<void>;
  user: User;
  [key: string]: any;
}

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. "Navigation", "Actions", "Administration"
  shortcut?: string[]; // e.g. ["g", "d"]
  permission?: Permission;
  action: (context: CommandContext) => void | Promise<void>;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. "Navigation", "Products", "CRM"
  href?: string;
  action?: () => void;
  metadata?: any;
}

export interface SearchProvider {
  id: string;
  name: string;
  search: (query: string, user: User) => Promise<SearchResult[]> | SearchResult[];
}
