import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import type { ApiResponse, Payment, PaymentMethod } from "../types.js";

export function registerPaymentTools(server: McpServer): void {
  // ── list_payments ────────────────────────────────────────────────────────
  server.tool(
    "list_payments",
    "List all payments with optional filters by status, contract, or date range.",
    {
      contract_id: z.string().optional().describe("Filter by contract ID"),
      status: z
        .enum(["pending", "processing", "completed", "failed", "cancelled"])
        .optional()
        .describe("Filter by payment status"),
      from_date: z
        .string()
        .optional()
        .describe("Start date filter (YYYY-MM-DD)"),
      to_date: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Payments",
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
      const result = await client.get<ApiResponse<Payment[]>>(
        "/v2/payments",
        params
      );
      const payments = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { payments, meta: result.meta, count: payments.length },
              null,
              2
            ),
          },
        ],
        structuredContent: { payments, meta: result.meta, count: payments.length },
      };
    }
  );

  // ── get_payment ──────────────────────────────────────────────────────────
  server.tool(
    "get_payment",
    "Get details of a specific payment by ID.",
    {
      payment_id: z.string().describe("The payment ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Payment",
    },
    async ({ payment_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Payment>>(
        `/v2/payments/${payment_id}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { payment: result.data },
      };
    }
  );

  // ── create_payment ───────────────────────────────────────────────────────
  server.tool(
    "create_payment",
    "Create a new payment for a contract.",
    {
      contract_id: z.string().describe("The contract ID"),
      amount: z.number().positive().describe("Payment amount"),
      currency: z.string().describe("Currency code (e.g. USD)"),
      payment_date: z
        .string()
        .optional()
        .describe("Payment date (YYYY-MM-DD), defaults to next cycle"),
      description: z.string().optional().describe("Payment description"),
      payment_method_id: z
        .string()
        .optional()
        .describe("Payment method ID (uses default if not specified)"),
    },
    {
      title: "Create Payment",
    },
    async (payload) => {
      const client = getClient();
      const result = await client.post<ApiResponse<Payment>>(
        "/v2/payments",
        payload
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        structuredContent: { payment: result.data, created: true },
      };
    }
  );

  // ── list_payment_methods ─────────────────────────────────────────────────
  server.tool(
    "list_payment_methods",
    "List available payment methods for the organization.",
    {
      limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    },
    {
      readOnlyHint: true,
      title: "List Payment Methods",
    },
    async ({ limit, offset }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<PaymentMethod[]>>(
        "/v2/payment-methods",
        { limit, offset }
      );
      const methods = result.data ?? [];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { payment_methods: methods, count: methods.length },
              null,
              2
            ),
          },
        ],
        structuredContent: { payment_methods: methods, count: methods.length },
      };
    }
  );

  // ── get_payment_status ───────────────────────────────────────────────────
  server.tool(
    "get_payment_status",
    "Check the current status of a payment.",
    {
      payment_id: z.string().describe("The payment ID"),
    },
    {
      readOnlyHint: true,
      title: "Get Payment Status",
    },
    async ({ payment_id }) => {
      const client = getClient();
      const result = await client.get<ApiResponse<Payment>>(
        `/v2/payments/${payment_id}`
      );
      const payment = result.data;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                payment_id,
                status: payment?.status,
                amount: payment?.amount,
                currency: payment?.currency,
                payment_date: payment?.payment_date,
              },
              null,
              2
            ),
          },
        ],
        structuredContent: {
          payment_id,
          status: payment?.status,
          amount: payment?.amount,
          currency: payment?.currency,
          payment_date: payment?.payment_date,
        },
      };
    }
  );
}
