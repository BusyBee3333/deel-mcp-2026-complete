#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

const SERVER_NAME = "mcp-server-deel";
const SERVER_VERSION = "1.0.0";

async function main(): Promise<void> {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all Deel tools
  registerAllTools(server);

  // Connect via stdio transport (works with Claude Desktop, Cursor, etc.)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(
    `[${SERVER_NAME}] v${SERVER_VERSION} running on stdio\n`
  );
}

main().catch((err: unknown) => {
  process.stderr.write(
    `[${SERVER_NAME}] Fatal error: ${String(err)}\n`
  );
  process.exit(1);
});
