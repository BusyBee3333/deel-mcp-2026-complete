import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import type { ApiResponse, Contract } from "../types.js";

export function registerContractTools(server: McpServer): void {
  // ── list_contracts ───────────────────────────────────────────────────────
  server.tool(
    "list_contracts",
    "List all contracts in your Deel organization. Supports filtering by status, type, and worker.",
    {
      status: z
        .enum(["pending", "active", "terminated", "completed", "paused"])
        .optional()
        .describe("Filter by contract status"),
      type: z
        .enum(["eor", "contractor", "employee", "pay_as_you_go", "fixed"])
        .optional()
        .describe("Filter by contract type"),
      worker_id: z.string().optional().describe("Filter by worker ID"),
      country: z.string().optional().describe("Filter by country code (ISO 2)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe("Number of results per page"),
      offset: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Contracts",
    },
    async ({ status, type, worker_id, country, limit, offset }) => {
      const client = getClient();
      const params: Record<string, unknown> = {
        limit,
        offset,
        ...(status && { status }),
        ...(type && { type }),
        ...(worker_id && { worker_id }),
        ...(country && { country }),
      };
      const result = await client.get<ApiResponse<Contract[]>>(
        "/v2/contracts",
        params
      );
      const contracts = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                contracts,
                meta: result.meta,
                count: contracts.length,
              },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          contracts,
          meta: result.meta,
          count: contracts.length,
        },
      };
    }
  );

  // ── get_contract ─────────────────────────────────────────────────────────
  server.tool(
    "get_contract",
    "Get a single contract by ID with full details.",
    {
      contract_id: z.string().describe("The contract ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Contract",
    },
    async ({ contract_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Contract>>(
        `/v2/contracts/${contract_id}`
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(result.data, null, 2) },
        ],
        structuredContent: { contract: result.data },
      };
    }
  );

  // ── create_contract ──────────────────────────────────────────────────────
  server.tool(
    "create_contract",
    "Create a new contract in Deel.",
    {
      type: z
        .enum(["eor", "contractor", "employee", "pay_as_you_go", "fixed"])
        .describe("Contract type"),
      title: z.string().describe("Contract title"),
      country: z.string().describe("Worker country code (ISO 2)"),
      currency: z.string().describe("Payment currency (ISO 3 e.g. USD)"),
      start_date: z.string().describe("Start date (YYYY-MM-DD)"),
      worker_email: z
        .string()
        .email()
        .optional()
        .describe("Worker email (for invite)"),
      worker_id: z.string().optional().describe("Existing worker ID"),
      amount: z.number().optional().describe("Contract amount"),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
      job_title: z.string().optional().describe("Worker job title"),
      scope_of_work: z.string().optional().describe("Scope of work description"),
    },
    {
      title: "Create Contract",
    },
    async (payload) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Contract>>(
        "/v2/contracts",
        payload
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(result.data, null, 2) },
        ],
        structuredContent: { contract: result.data, created: true },
      };
    }
  );

  // ── update_contract ──────────────────────────────────────────────────────
  server.tool(
    "update_contract",
    "Update an existing contract's details.",
    {
      contract_id: z.string().describe("The contract ID to update"),
      title: z.string().optional().describe("New contract title"),
      amount: z.number().optional().describe("New contract amount"),
      end_date: z.string().optional().describe("New end date (YYYY-MM-DD)"),
      job_title: z.string().optional().describe("New job title"),
      scope_of_work: z.string().optional().describe("Updated scope of work"),
    },
    {
      title: "Update Contract",
    },
    async ({ contract_id, ...updates }) => {
      const client = getClient();
      const result = await client.patch<ApiResponse<Contract>>(
        `/v2/contracts/${contract_id}`,
        updates
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(result.data, null, 2) },
        ],
        structuredContent: { contract: result.data, updated: true },
      };
    }
  );

  // ── terminate_contract ───────────────────────────────────────────────────
  server.tool(
    "terminate_contract",
    "Terminate an active contract.",
    {
      contract_id: z.string().describe("The contract ID to terminate"),
      termination_reason: z.string().describe("Reason for termination"),
      last_day_of_work: z
        .string()
        .optional()
        .describe("Last day of work (YYYY-MM-DD)"),
      severance_amount: z
        .number()
        .optional()
        .describe("Severance payment amount"),
    },
    {
      title: "Terminate Contract",
    },
    async ({ contract_id, ...payload }) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Contract>>(
        `/v2/contracts/${contract_id}/terminate`,
        payload
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(result.data, null, 2) },
        ],
        structuredContent: { contract: result.data, terminated: true },
      };
    }
  );

  // ── get_contract_documents ───────────────────────────────────────────────
  server.tool(
    "get_contract_documents",
    "Retrieve all documents associated with a contract.",
    {
      contract_id: z.string().describe("The contract ID"),
      limit: z.number().int().min(1).max(100).default(20).describe("Limit"),
      offset: z.number().int().min(0).default(0).describe("Offset"),
    },
    {
      readOnlyHint: true,
      title: "Get Contract Documents",
    },
    async ({ contract_id, limit, offset }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<unknown[]>>(
        `/v2/contracts/${contract_id}/documents`,
        { limit, offset }
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { documents: result.data, meta: result.meta },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          documents: result.data,
          meta: result.meta,
          contract_id,
        },
      };
    }
  );
}
