import { z } from "zod";
import { getClient } from "../client.js";
export function registerDocumentTools(server) {
    // ── list_documents ───────────────────────────────────────────────────────
    server.tool("list_documents", "List all documents in the organization, with optional filters.", {
        contract_id: z.string().optional().describe("Filter by contract ID"),
        worker_id: z.string().optional().describe("Filter by worker ID"),
        status: z
            .enum(["pending", "signed", "expired", "declined"])
            .optional()
            .describe("Filter by document status"),
        type: z.string().optional().describe("Filter by document type"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Documents",
    }, async ({ contract_id, worker_id, status, type, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(contract_id && { contract_id }),
            ...(worker_id && { worker_id }),
            ...(status && { status }),
            ...(type && { type }),
        };
        const result = await client.get("/v2/documents", params);
        const documents = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ documents, meta: result.meta, count: documents.length }, null, 2),
                },
            ],
            structuredContent: {
                documents,
                meta: result.meta,
                count: documents.length,
            },
        };
    });
    // ── get_document ─────────────────────────────────────────────────────────
    server.tool("get_document", "Get details of a specific document including download URL.", {
        document_id: z.string().describe("The document ID"),
    }, {
        readOnlyHint: true,
        title: "Get Document",
    }, async ({ document_id }) => {
        const client = getClient();
        const result = await client.get(`/v2/documents/${document_id}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { document: result.data },
        };
    });
    // ── sign_document ────────────────────────────────────────────────────────
    server.tool("sign_document", "Sign a pending document on behalf of the authenticated user.", {
        document_id: z.string().describe("The document ID to sign"),
        signature: z
            .string()
            .optional()
            .describe("Signature text (name or initials)"),
    }, {
        title: "Sign Document",
    }, async ({ document_id, signature }) => {
        const client = getClient();
        const result = await client.post(`/v2/documents/${document_id}/sign`, { signature });
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { document: result.data, signed: true },
        };
    });
    // ── list_document_templates ──────────────────────────────────────────────
    server.tool("list_document_templates", "List available document templates for creating contracts and agreements.", {
        type: z.string().optional().describe("Filter by template type"),
        country: z.string().optional().describe("Filter by country code (ISO 2)"),
        limit: z.number().int().min(1).max(100).default(20).describe("Results per page"),
        offset: z.number().int().min(0).default(0).describe("Pagination offset"),
    }, {
        readOnlyHint: true,
        title: "List Document Templates",
    }, async ({ type, country, limit, offset }) => {
        const client = getClient();
        const params = {
            limit,
            offset,
            ...(type && { type }),
            ...(country && { country }),
        };
        const result = await client.get("/v2/document-templates", params);
        const templates = result.data ?? [];
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ templates, meta: result.meta, count: templates.length }, null, 2),
                },
            ],
            structuredContent: {
                templates,
                meta: result.meta,
                count: templates.length,
            },
        };
    });
    // ── get_document_template ────────────────────────────────────────────────
    server.tool("get_document_template", "Get a specific document template by ID.", {
        template_id: z.string().describe("The document template ID"),
    }, {
        readOnlyHint: true,
        title: "Get Document Template",
    }, async ({ template_id }) => {
        const client = getClient();
        const result = await client.get(`/v2/document-templates/${template_id}`);
        return {
            content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
            structuredContent: { template: result.data },
        };
    });
}
//# sourceMappingURL=documents.js.map