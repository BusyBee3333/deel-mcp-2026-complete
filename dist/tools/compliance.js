import { z } from "zod";
import { getClient } from "../client.js";
export function registerComplianceTools(server) {
    // ── list_compliance_items ────────────────────────────────────────────────
    server.tool("list_compliance_items", "List all compliance items and their status for the organization.", {
        worker_id: z.string().optional().describe("Filter by worker ID"),
        contract_id: z.string().optional().describe("Filter by contract ID"),
        country: z.string().optional().describe("Filter by country code (ISO 2)"),
        status: z.string().optional().describe("Filter by compliance status"),
        type: z.string().optional().describe("Filter by compliance item type"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Compliance Items",
    }, async ({ worker_id, contract_id, country, status, type, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(worker_id && { worker_id }),
            ...(contract_id && { contract_id }),
            ...(country && { country }),
            ...(status && { status }),
            ...(type && { type }),
        };
        const result = await client.get("/v2/compliance", params);
        const items = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ compliance_items: items, meta: result.meta, count: items.length }, null, 2),
                },
            ],
            structuredContent: {
                compliance_items: items,
                meta: result.meta,
                count: items.length,
            },
        };
    });
    // ── get_compliance_status ────────────────────────────────────────────────
    server.tool("get_compliance_status", "Get an overall compliance status summary for the organization or a specific worker/contract.", {
        worker_id: z.string().optional().describe("Get compliance status for a specific worker"),
        contract_id: z.string().optional().describe("Get compliance status for a specific contract"),
        country: z.string().optional().describe("Filter by country code (ISO 2)"),
    }, {
        readOnlyHint: true,
        title: "Get Compliance Status",
    }, async ({ worker_id, contract_id, country }) => {
        const client = getClient();
        const params = {
            ...(worker_id && { worker_id }),
            ...(contract_id && { contract_id }),
            ...(country && { country }),
        };
        const result = await client.get("/v2/compliance/status", params);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { compliance_status: result.data },
        };
    });
    // ── list_required_documents ──────────────────────────────────────────────
    server.tool("list_required_documents", "List required compliance documents for a worker, contract, or country.", {
        worker_id: z.string().optional().describe("Filter by worker ID"),
        contract_id: z.string().optional().describe("Filter by contract ID"),
        country: z.string().optional().describe("Filter by country code (ISO 2)"),
        is_submitted: z
            .boolean()
            .optional()
            .describe("Filter by submission status"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Required Documents",
    }, async ({ worker_id, contract_id, country, is_submitted, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(worker_id && { worker_id }),
            ...(contract_id && { contract_id }),
            ...(country && { country }),
            ...(is_submitted !== undefined && { is_submitted }),
        };
        const result = await client.get("/v2/compliance/required-documents", params);
        const documents = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ required_documents: documents, meta: result.meta, count: documents.length }, null, 2),
                },
            ],
            structuredContent: {
                required_documents: documents,
                meta: result.meta,
                count: documents.length,
            },
        };
    });
}
//# sourceMappingURL=compliance.js.map