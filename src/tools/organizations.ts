import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import type { ApiResponse, Organization, Entity, Department } from "../types.js";

export function registerOrganizationTools(server: McpServer): void {
  // ── get_organization ─────────────────────────────────────────────────────
  server.tool(
    "get_organization",
    "Get the current organization's profile and settings.",
    {},
    {
      readOnlyHint: true,
      title: "Get Organization",
    },
    async () => {
      const client = getClient();
      const result = await client.get<ApiResponse<Organization>>(
        "/v2/organizations/me"
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { organization: result.data },
      };
    }
  );

  // ── list_entities ────────────────────────────────────────────────────────
  server.tool(
    "list_entities",
    "List legal entities belonging to the organization.",
    {
      country: z.string().optional().describe("Filter by country code (ISO 2)"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Entities",
    },
    async ({ country, limit, offset }) => {
      const client = getClient();
      const params: Record<string, unknown> = {
        limit,
        offset,
        ...(country && { country }),
      };
      const result = await client.get<ApiResponse<Entity[]>>(
        "/v2/entities",
        params
      );
      const entities = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { entities, meta: result.meta, count: entities.length },
              null,
              2
            ),
          },
        ],
        structuredContent: { entities, meta: result.meta, count: entities.length },
      };
    }
  );

  // ── get_entity ───────────────────────────────────────────────────────────
  server.tool(
    "get_entity",
    "Get details of a specific legal entity.",
    {
      entity_id: z.string().describe("The entity ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Entity",
    },
    async ({ entity_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Entity>>(
        `/v2/entities/${entity_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { entity: result.data },
      };
    }
  );

  // ── list_departments ─────────────────────────────────────────────────────
  server.tool(
    "list_departments",
    "List all departments in the organization.",
    {
      parent_id: z
        .string()
        .optional()
        .describe("Filter by parent department ID"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Departments",
    },
    async ({ parent_id, limit, offset }) => {
      const client = getClient();
      const params: Record<string, unknown> = {
        limit,
        offset,
        ...(parent_id && { parent_id }),
      };
      const result = await client.get<ApiResponse<Department[]>>(
        "/v2/departments",
        params
      );
      const departments = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { departments, meta: result.meta, count: departments.length },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          departments,
          meta: result.meta,
          count: departments.length,
        },
      };
    }
  );

  // ── create_department ────────────────────────────────────────────────────
  server.tool(
    "create_department",
    "Create a new department in the organization.",
    {
      name: z.string().describe("Department name"),
      description: z.string().optional().describe("Department description"),
      parent_id: z
        .string()
        .optional()
        .describe("Parent department ID (for sub-departments)"),
    },
    {
      title: "Create Department",
    },
    async (payload) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Department>>(
        "/v2/departments",
        payload
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { department: result.data, created: true },
      };
    }
  );
}
