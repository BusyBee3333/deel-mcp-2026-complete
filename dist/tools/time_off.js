import { z } from "zod";
import { getClient } from "../client.js";
export function registerTimeOffTools(server) {
    // ── list_time_off_policies ───────────────────────────────────────────────
    server.tool("list_time_off_policies", "List all time-off policies configured in the organization.", {
        country: z.string().optional().describe("Filter by country code (ISO 2)"),
        type: z
            .string()
            .optional()
            .describe("Policy type (e.g. vacation, sick, parental)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Time Off Policies",
    }, async ({ country, type, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(country && { country }),
            ...(type && { type }),
        };
        const result = await client.get("/v2/time-off/policies", params);
        const policies = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ policies, meta: result.meta, count: policies.length }, null, 2),
                },
            ],
            structuredContent: { policies, meta: result.meta, count: policies.length },
        };
    });
    // ── list_time_off_requests ───────────────────────────────────────────────
    server.tool("list_time_off_requests", "List time-off requests with optional filters by worker, status, or date range.", {
        worker_id: z.string().optional().describe("Filter by worker ID"),
        status: z
            .enum(["pending", "approved", "declined", "cancelled"])
            .optional()
            .describe("Filter by request status"),
        from_date: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Time Off Requests",
    }, async ({ worker_id, status, from_date, to_date, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(worker_id && { worker_id }),
            ...(status && { status }),
            ...(from_date && { from_date }),
            ...(to_date && { to_date }),
        };
        const result = await client.get("/v2/time-off/requests", params);
        const requests = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ requests, meta: result.meta, count: requests.length }, null, 2),
                },
            ],
            structuredContent: { requests, meta: result.meta, count: requests.length },
        };
    });
    // ── create_time_off_request ──────────────────────────────────────────────
    server.tool("create_time_off_request", "Create a new time-off request for a worker.", {
        worker_id: z.string().describe("The worker ID"),
        policy_id: z.string().describe("The time-off policy ID"),
        start_date: z.string().describe("Start date (YYYY-MM-DD)"),
        end_date: z.string().describe("End date (YYYY-MM-DD)"),
        notes: z.string().optional().describe("Notes for the request"),
    }, {
        title: "Create Time Off Request",
    }, async (payload) => {
        const client = getClient();
        const result = await client.post("/v2/time-off/requests", payload);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { request: result.data, created: true },
        };
    });
    // ── approve_time_off_request ─────────────────────────────────────────────
    server.tool("approve_time_off_request", "Approve a pending time-off request.", {
        request_id: z.string().describe("The time-off request ID to approve"),
        notes: z.string().optional().describe("Approval notes"),
    }, {
        title: "Approve Time Off Request",
    }, async ({ request_id, notes }) => {
        const client = getClient();
        const result = await client.post(`/v2/time-off/requests/${request_id}/approve`, { notes });
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { request: result.data, approved: true },
        };
    });
}
//# sourceMappingURL=time_off.js.map