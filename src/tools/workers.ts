import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import type { ApiResponse, Worker } from "../types.js";

export function registerWorkerTools(server: McpServer): void {
  // ── list_workers ─────────────────────────────────────────────────────────
  server.tool(
    "list_workers",
    "List all workers in your Deel organization.",
    {
      status: z
        .enum(["active", "pending", "invited", "offboarded"])
        .optional()
        .describe("Filter by worker status"),
      country: z.string().optional().describe("Filter by country code (ISO 2)"),
      department: z.string().optional().describe("Filter by department name or ID"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Workers",
    },
    async ({ status, country, department, limit, offset }) => {
      const client = getClient();
      const params: Record<string, unknown> = {
        limit,
        offset,
        ...(status && { status }),
        ...(country && { country }),
        ...(department && { department }),
      };
      const result = await client.get<ApiResponse<Worker[]>>(
        "/v2/workers",
        params
      );
      const workers = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { workers, meta: result.meta, count: workers.length },
              null,
              2
            ),
          },
        ],
        structuredContent: { workers, meta: result.meta, count: workers.length },
      };
    }
  );

  // ── get_worker ───────────────────────────────────────────────────────────
  server.tool(
    "get_worker",
    "Get detailed information about a specific worker.",
    {
      worker_id: z.string().describe("The worker ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Worker",
    },
    async ({ worker_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Worker>>(
        `/v2/workers/${worker_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { worker: result.data },
      };
    }
  );

  // ── invite_worker ────────────────────────────────────────────────────────
  server.tool(
    "invite_worker",
    "Invite a new worker to join Deel.",
    {
      first_name: z.string().describe("Worker's first name"),
      last_name: z.string().describe("Worker's last name"),
      email: z.string().email().describe("Worker's email address"),
      country: z.string().describe("Worker's country code (ISO 2)"),
      job_title: z.string().optional().describe("Job title"),
      department_id: z.string().optional().describe("Department ID"),
      contract_id: z.string().optional().describe("Existing contract to associate"),
    },
    {
      title: "Invite Worker",
    },
    async (payload) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Worker>>(
        "/v2/workers/invite",
        payload
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { worker: result.data, invited: true },
      };
    }
  );

  // ── update_worker ────────────────────────────────────────────────────────
  server.tool(
    "update_worker",
    "Update an existing worker's profile information.",
    {
      worker_id: z.string().describe("The worker ID to update"),
      first_name: z.string().optional().describe("First name"),
      last_name: z.string().optional().describe("Last name"),
      job_title: z.string().optional().describe("Job title"),
      department_id: z.string().optional().describe("Department ID"),
      manager_id: z.string().optional().describe("Manager worker ID"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    },
    {
      title: "Update Worker",
    },
    async ({ worker_id, ...updates }) => {
      const client = getClient();
      const result = await client.patch<ApiResponse<Worker>>(
        `/v2/workers/${worker_id}`,
        updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { worker: result.data, updated: true },
      };
    }
  );

  // ── offboard_worker ──────────────────────────────────────────────────────
  server.tool(
    "offboard_worker",
    "Initiate the offboarding process for a worker.",
    {
      worker_id: z.string().describe("The worker ID to offboard"),
      last_day: z.string().describe("Last day of work (YYYY-MM-DD)"),
      reason: z.string().describe("Reason for offboarding"),
      rehire_eligible: z
        .boolean()
        .optional()
        .describe("Whether worker is eligible for rehire"),
      notes: z.string().optional().describe("Additional offboarding notes"),
    },
    {
      title: "Offboard Worker",
    },
    async ({ worker_id, ...payload }) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Worker>>(
        `/v2/workers/${worker_id}/offboard`,
        payload
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { worker: result.data, offboarded: true },
      };
    }
  );

  // ── search_workers ───────────────────────────────────────────────────────
  server.tool(
    "search_workers",
    "Search for workers by name or email.",
    {
      query: z
        .string()
        .describe("Search query (name, email, or partial match)"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "Search Workers",
    },
    async ({ query, limit, offset }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Worker[]>>("/v2/workers", {
        q: query,
        limit,
        offset,
      });
      const workers = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { workers, meta: result.meta, count: workers.length, query },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          workers,
          meta: result.meta,
          count: workers.length,
          query,
        },
      };
    }
  );
}
