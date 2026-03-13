import { z } from "zod";
import { getClient } from "../client.js";
export function registerOffCyclePaymentTools(server) {
    // ── list_off_cycle_payments ──────────────────────────────────────────────
    server.tool("list_off_cycle_payments", "List off-cycle payments (bonuses, commissions, etc.) with optional filters.", {
        contract_id: z.string().optional().describe("Filter by contract ID"),
        status: z
            .enum(["draft", "pending", "approved", "processing", "completed", "declined"])
            .optional()
            .describe("Filter by payment status"),
        from_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Off-Cycle Payments",
    }, async ({ contract_id, status, from_date, to_date, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(contract_id && { contract_id }),
            ...(status && { status }),
            ...(from_date && { from_date }),
            ...(to_date && { to_date }),
        };
        const result = await client.get("/v2/off-cycle-payments", params);
        const payments = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ off_cycle_payments: payments, meta: result.meta, count: payments.length }, null, 2),
                },
            ],
            structuredContent: {
                off_cycle_payments: payments,
                meta: result.meta,
                count: payments.length,
            },
        };
    });
    // ── create_off_cycle_payment ─────────────────────────────────────────────
    server.tool("create_off_cycle_payment", "Create an off-cycle payment (bonus, commission, reimbursement, etc.).", {
        contract_id: z.string().describe("The contract ID"),
        amount: z.number().positive().describe("Payment amount"),
        currency: z.string().describe("Currency code (e.g. USD)"),
        reason: z
            .enum([
            "bonus",
            "commission",
            "reimbursement",
            "severance",
            "other",
        ])
            .describe("Payment reason"),
        description: z.string().optional().describe("Payment description"),
        payment_date: z.string().optional().describe("Target payment date (YYYY-MM-DD)"),
    }, {
        title: "Create Off-Cycle Payment",
    }, async (payload) => {
        const client = getClient();
        const result = await client.post("/v2/off-cycle-payments", payload);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { off_cycle_payment: result.data, created: true },
        };
    });
    // ── get_off_cycle_payment ────────────────────────────────────────────────
    server.tool("get_off_cycle_payment", "Get details of a specific off-cycle payment.", {
        payment_id: z.string().describe("The off-cycle payment ID"),
    }, {
        readOnlyHint: true,
        title: "Get Off-Cycle Payment",
    }, async ({ payment_id }) => {
        const client = getClient();
        const result = await client.get(`/v2/off-cycle-payments/${payment_id}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { off_cycle_payment: result.data },
        };
    });
    // ── approve_off_cycle_payment ────────────────────────────────────────────
    server.tool("approve_off_cycle_payment", "Approve a pending off-cycle payment for processing.", {
        payment_id: z.string().describe("The off-cycle payment ID to approve"),
        notes: z.string().optional().describe("Approval notes"),
    }, {
        title: "Approve Off-Cycle Payment",
    }, async ({ payment_id, notes }) => {
        const client = getClient();
        const result = await client.post(`/v2/off-cycle-payments/${payment_id}/approve`, { notes });
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { off_cycle_payment: result.data, approved: true },
        };
    });
}
//# sourceMappingURL=off_cycle_payments.js.map