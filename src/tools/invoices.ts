import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import type { ApiResponse, Invoice, InvoiceAdjustment } from "../types.js";

export function registerInvoiceTools(server: McpServer): void {
  // ── list_invoices ────────────────────────────────────────────────────────
  server.tool(
    "list_invoices",
    "List invoices with optional filters by status, contract, or date range.",
    {
      contract_id: z.string().optional().describe("Filter by contract ID"),
      status: z
        .enum(["pending", "approved", "declined", "paid", "overdue"])
        .optional()
        .describe("Filter by invoice status"),
      from_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      to_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Invoices",
    },
    async ({ contract_id, status, from_date, to_date, limit, offset }) => {
      const client = getClient();
      const params: Record<string, unknown> = {
        limit,
        offset,
        ...(contract_id && { contract_id }),
        ...(status && { status }),
        ...(from_date && { from_date }),
        ...(to_date && { to_date }),
      };
      const result = await client.get<ApiResponse<Invoice[]>>(
        "/v2/invoices",
        params
      );
      const invoices = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { invoices, meta: result.meta, count: invoices.length },
              null,
              2
            ),
          },
        ],
        structuredContent: { invoices, meta: result.meta, count: invoices.length },
      };
    }
  );

  // ── get_invoice ──────────────────────────────────────────────────────────
  server.tool(
    "get_invoice",
    "Get a specific invoice by ID with full line item details.",
    {
      invoice_id: z.string().describe("The invoice ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Invoice",
    },
    async ({ invoice_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Invoice>>(
        `/v2/invoices/${invoice_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { invoice: result.data },
      };
    }
  );

  // ── approve_invoice ──────────────────────────────────────────────────────
  server.tool(
    "approve_invoice",
    "Approve a pending invoice for payment.",
    {
      invoice_id: z.string().describe("The invoice ID to approve"),
      notes: z.string().optional().describe("Approval notes"),
    },
    {
      title: "Approve Invoice",
    },
    async ({ invoice_id, notes }) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Invoice>>(
        `/v2/invoices/${invoice_id}/approve`,
        { notes }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { invoice: result.data, approved: true },
      };
    }
  );

  // ── decline_invoice ──────────────────────────────────────────────────────
  server.tool(
    "decline_invoice",
    "Decline a pending invoice with a reason.",
    {
      invoice_id: z.string().describe("The invoice ID to decline"),
      reason: z.string().describe("Reason for declining the invoice"),
    },
    {
      title: "Decline Invoice",
    },
    async ({ invoice_id, reason }) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Invoice>>(
        `/v2/invoices/${invoice_id}/decline`,
        { reason }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { invoice: result.data, declined: true },
      };
    }
  );

  // ── list_invoice_adjustments ─────────────────────────────────────────────
  server.tool(
    "list_invoice_adjustments",
    "List adjustments (bonuses, deductions) for an invoice.",
    {
      invoice_id: z.string().describe("The invoice ID"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Invoice Adjustments",
    },
    async ({ invoice_id, limit, offset }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<InvoiceAdjustment[]>>(
        `/v2/invoices/${invoice_id}/adjustments`,
        { limit, offset }
      );
      const adjustments = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { adjustments, meta: result.meta, invoice_id },
              null,
              2
            ),
          },
        ],
        structuredContent: { adjustments, meta: result.meta, invoice_id },
      };
    }
  );
}
