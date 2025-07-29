import { describe, it, expect, beforeEach } from "vitest";
import { JiraPlugin } from "../src/index";
import type { PluginContext } from "changelogen";
import type { GitCommit, ResolvedChangelogConfig } from "changelogen";

// Mock logger
const mockLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

// Mock context
const mockContext: PluginContext = {
  config: {} as ResolvedChangelogConfig,
  logger: mockLogger,
};

// Mock commit data
const createMockCommit = (message: string, body = ""): GitCommit => ({
  message,
  body,
  shortHash: "abc123",
  fullHash: "abc123456",
  author: { name: "Test User", email: "test@example.com" },
  description: message.replace(/^[a-z]+(\([^)]+\))?!?: /, ""),
  type: "feat",
  scope: "",
  references: [],
  authors: [],
  isBreaking: false,
});

describe("JiraPlugin", () => {
  let plugin: JiraPlugin;

  beforeEach(() => {
    plugin = new JiraPlugin({
      baseUrl: "https://company.atlassian.net",
      projectKeys: ["PROJ", "TASK"],
    });
  });

  describe("initialization", () => {
    it("should initialize with correct name and version", () => {
      expect(plugin.name).toBe("jira-plugin");
      expect(plugin.version).toBe("1.0.0");
    });

    it("should set default ticket pattern", () => {
      expect((plugin as any).config.ticketPattern).toEqual(/([A-Z]+-\d+)/g);
    });

    it("should allow custom ticket pattern", () => {
      const customPattern = /([A-Z]{2,}-\d+)/g;
      const customPlugin = new JiraPlugin({
        baseUrl: "https://company.atlassian.net",
        projectKeys: ["PROJ"],
        ticketPattern: customPattern,
      });
      expect((customPlugin as any).config.ticketPattern).toEqual(customPattern);
    });

    it("should initialize with context", () => {
      plugin.init(mockContext);
      expect((plugin as any).logger).toBe(mockLogger);
    });
  });

  describe("afterCommitParsing", () => {
    beforeEach(() => {
      plugin.init(mockContext);
    });

    it("should extract JIRA tickets from commit message", () => {
      const commits = [
        createMockCommit("feat: add new feature PROJ-123"),
        createMockCommit("fix: resolve issue TASK-456"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-123",
        url: "https://company.atlassian.net/browse/PROJ-123",
      });

      expect(result[1].references).toContainEqual({
        type: "jira-ticket",
        value: "TASK-456",
        url: "https://company.atlassian.net/browse/TASK-456",
      });
    });

    it("should extract JIRA tickets from commit body", () => {
      const commits = [
        createMockCommit("feat: add new feature", "Related to PROJ-789"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-789",
        url: "https://company.atlassian.net/browse/PROJ-789",
      });
    });

    it("should extract multiple JIRA tickets from same commit", () => {
      const commits = [
        createMockCommit("feat: add feature PROJ-123 TASK-456", "Also fixes PROJ-789"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-123",
        url: "https://company.atlassian.net/browse/PROJ-123",
      });

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "TASK-456",
        url: "https://company.atlassian.net/browse/TASK-456",
      });

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-789",
        url: "https://company.atlassian.net/browse/PROJ-789",
      });
    });

    it("should ignore tickets not matching project keys", () => {
      const commits = [
        createMockCommit("feat: add feature OTHER-123 PROJ-456"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).not.toContainEqual(
        expect.objectContaining({ value: "OTHER-123" })
      );

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-456",
        url: "https://company.atlassian.net/browse/PROJ-456",
      });
    });

    it("should not modify commits without JIRA tickets", () => {
      const commits = [
        createMockCommit("feat: add new feature without tickets"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      const jiraReferences = result[0].references.filter(ref => ref.type === "jira-ticket");
      expect(jiraReferences).toHaveLength(0);
    });

    it("should preserve existing references", () => {
      const commits = [
        createMockCommit("feat: add feature PROJ-123"),
      ];
      commits[0].references = [
        { type: "issue", value: "#456" },
        { type: "hash", value: "abc123" },
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).toHaveLength(3);
      expect(result[0].references).toContainEqual({ type: "issue", value: "#456" });
      expect(result[0].references).toContainEqual({ type: "hash", value: "abc123" });
      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-123",
        url: "https://company.atlassian.net/browse/PROJ-123",
      });
    });

    it("should handle case-sensitive project keys", () => {
      const commits = [
        createMockCommit("feat: add feature proj-123 PROJ-456"),
      ];

      const result = plugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).not.toContainEqual(
        expect.objectContaining({ value: "proj-123" })
      );

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "PROJ-456",
        url: "https://company.atlassian.net/browse/PROJ-456",
      });
    });

    it("should handle custom ticket patterns", () => {
      const customPlugin = new JiraPlugin({
        baseUrl: "https://company.atlassian.net",
        projectKeys: ["ABC"],
        ticketPattern: /([A-Z]{3}-\d{4})/g,
      });
      customPlugin.init(mockContext);

      const commits = [
        createMockCommit("feat: add feature ABC-1234 AB-123"),
      ];

      const result = customPlugin.afterCommitParsing(commits, {} as ResolvedChangelogConfig);

      expect(result[0].references).toContainEqual({
        type: "jira-ticket",
        value: "ABC-1234",
        url: "https://company.atlassian.net/browse/ABC-1234",
      });

      expect(result[0].references).not.toContainEqual(
        expect.objectContaining({ value: "AB-123" })
      );
    });
  });
});