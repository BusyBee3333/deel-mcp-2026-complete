import { z } from "zod";
import { getClient } from "../client.js";
export function registerExpenseTools(server) {
    // ── list_expenses ────────────────────────────────────────────────────────
    server.tool("list_expenses", "List expense reports with optional filters.", {
        contract_id: z.string().optional().describe("Filter by contract ID"),
        status: z
            .enum(["draft", "pending", "approved", "declined", "paid"])
            .optional()
            .describe("Filter by expense status"),
        category: z.string().optional().describe("Filter by expense category"),
        from_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Expenses",
    }, async ({ contract_id, status, category, from_date, to_date, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(contract_id && { contract_id }),
            ...(status && { status }),
            ...(category && { category }),
            ...(from_date && { from_date }),
            ...(to_date && { to_date }),
        };
        const result = await client.get("/v2/expenses", params);
        const expenses = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ expenses, meta: result.meta, count: expenses.length }, null, 2),
                },
            ],
            structuredContent: { expenses, meta: result.meta, count: expenses.length },
        };
    });
    // ── get_expense ──────────────────────────────────────────────────────────
    server.tool("get_expense", "Get details of a specific expense report.", {
        expense_id: z.string().describe("The expense ID"),
    }, {
        readOnlyHint: true,
        title: "Get Expense",
    }, async ({ expense_id }) => {
        const client = getClient();
        const result = await client.get(`/v2/expenses/${expense_id}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { expense: result.data },
        };
    });
    // ── create_expense ───────────────────────────────────────────────────────
    server.tool("create_expense", "Submit a new expense report.", {
        contract_id: z.string().describe("The contract ID"),
        amount: z.number().positive().describe("Expense amount"),
        currency: z.string().describe("Currency code (e.g. USD)"),
        category: z
            .enum([
            "travel",
            "accommodation",
            "meals",
            "equipment",
            "software",
            "training",
            "other",
        ])
            .describe("Expense category"),
        description: z.string().describe("Expense description"),
        expense_date: z.string().describe("Date of expense (YYYY-MM-DD)"),
        receipt_url: z.string().url().optional().describe("URL of receipt image"),
    }, {
        title: "Create Expense",
    }, async (payload) => {
        const client = getClient();
        const result = await client.post("/v2/expenses", payload);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { expense: result.data, created: true },
        };
    });
    // ── approve_expense ──────────────────────────────────────────────────────
    server.tool("approve_expense", "Approve a pending expense report.", {
        expense_id: z.string().describe("The expense ID to approve"),
        notes: z.string().optional().describe("Approval notes"),
    }, {
        title: "Approve Expense",
    }, async ({ expense_id, notes }) => {
        const client = getClient();
        const result = await client.post(`/v2/expenses/${expense_id}/approve`, { notes });
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { expense: result.data, approved: true },
        };
    });
    // ── decline_expense ──────────────────────────────────────────────────────
    server.tool("decline_expense", "Decline a pending expense report.", {
        expense_id: z.string().describe("The expense ID to decline"),
        reason: z.string().describe("Reason for declining"),
    }, {
        title: "Decline Expense",
    }, async ({ expense_id, reason }) => {
        const client = getClient();
        const result = await client.post(`/v2/expenses/${expense_id}/decline`, { reason });
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { expense: result.data, declined: true },
        };
    });
}
//# sourceMappingURL=expenses.js.map