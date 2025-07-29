import pkg from "../package.json" assert { type: "json" };

import type { ChangelogPlugin, PluginContext } from "changelogen";
import type { GitCommit, Reference } from "changelogen";
import type { JiraPluginConfig } from "./types";

export type { JiraPluginConfig } from "./types";

export class JiraPlugin implements ChangelogPlugin {
  name = pkg.name;
  version = pkg.version;

  private config: JiraPluginConfig;
  private logger: any;

  constructor(config: JiraPluginConfig) {
    this.config = {
      ticketPattern: /([A-Z]+-\d+)/g,
      ...config,
    };
  }

  init(context: PluginContext): void {
    this.logger = context.logger;
    this.logger.debug(
      `Initialized Jira plugin with base URL: ${this.config.baseUrl}`
    );
  }

  afterCommitParsing(commits: GitCommit[]): GitCommit[] {
    this.logger.debug(`Processing ${commits.length} commits for Jira tickets`);

    return commits.map((commit) => {
      const jiraTickets = this.extractJiraTickets(
        commit.message + " " + commit.body
      );

      if (jiraTickets.length > 0) {
        this.logger.debug(
          `Found Jira tickets in commit ${commit.shortHash}: ${jiraTickets.join(", ")}`
        );

        // Add Jira ticket references
        const jiraReferences: Reference[] = jiraTickets.map((ticket) => ({
          type: "jira-ticket" as any, // Extend the Reference type
          value: ticket,
          url: `${this.config.baseUrl}/browse/${ticket}`,
        }));

        commit.references.push(...jiraReferences);
      }

      return commit;
    });
  }

  private extractJiraTickets(text: string): string[] {
    const matches = text.match(this.config.ticketPattern!) || [];
    return matches.filter((ticket: string) =>
      this.config.projectKeys.some((key) => ticket.startsWith(key + "-"))
    );
  }
}

// Export as default for easy importing
export default JiraPlugin;
