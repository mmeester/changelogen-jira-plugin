export interface JiraPluginConfig {
  baseUrl: string;
  projectKeys: string[];
  ticketPattern?: RegExp;
}
