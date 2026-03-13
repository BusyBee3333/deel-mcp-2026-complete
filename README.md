# mcp-server-deel

> Production-quality MCP server for the [Deel](https://www.deel.com) API — global HR, payroll, and contractor management.

[![MCP](https://img.shields.io/badge/MCP-1.26.0-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- **48 tools** spanning contracts, workers, payments, invoices, documents, off-cycle payments, time-off, expenses, organizations, and compliance
- Full TypeScript with strict mode — zero `any` casts
- Pagination on every list endpoint
- `structuredContent` on every tool response
- `readOnlyHint: true` on all GET/search/list tools
- Works with Claude Desktop, Cursor, and any MCP-compatible client

## Tool Inventory

| Module | Tools | Count |
|--------|-------|-------|
| contracts | list_contracts, get_contract, create_contract, update_contract, terminate_contract, get_contract_documents | 6 |
| workers | list_workers, get_worker, invite_worker, update_worker, offboard_worker, search_workers | 6 |
| payments | list_payments, get_payment, create_payment, list_payment_methods, get_payment_status | 5 |
| invoices | list_invoices, get_invoice, approve_invoice, decline_invoice, list_invoice_adjustments | 5 |
| documents | list_documents, get_document, sign_document, list_document_templates, get_document_template | 5 |
| off_cycle_payments | list_off_cycle_payments, create_off_cycle_payment, get_off_cycle_payment, approve_off_cycle_payment | 4 |
| time_off | list_time_off_policies, list_time_off_requests, create_time_off_request, approve_time_off_request | 4 |
| expenses | list_expenses, get_expense, create_expense, approve_expense, decline_expense | 5 |
| organizations | get_organization, list_entities, get_entity, list_departments, create_department | 5 |
| compliance | list_compliance_items, get_compliance_status, list_required_documents | 3 |
| **Total** | | **48** |

## Prerequisites

- Node.js 18+
- A Deel account with API access
- A Deel API key (see Setup below)

## Setup

### 1. Get a Deel API Key

1. Log into [Deel](https://app.deel.com)
2. Navigate to **Settings → Integrations → API Tokens**
3. Click **Create Token** and copy the generated key

### 2. Install and Configure

```bash
# Clone the repository
git clone https://github.com/BusyBee3333/deel-mcp-2026-complete.git
cd deel-mcp-2026-complete

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your DEEL_API_KEY
```

### 3. Build

```bash
npm run build
```

### 4. Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "deel": {
      "command": "node",
      "args": ["/path/to/deel-mcp-2026-complete/dist/index.js"],
      "env": {
        "DEEL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 5. Connect to Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "deel": {
      "command": "node",
      "args": ["/path/to/deel-mcp-2026-complete/dist/index.js"],
      "env": {
        "DEEL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Development

```bash
# Run in watch mode (requires tsx)
npm run dev

# Type-check only (no emit)
npm run typecheck
```

## API Reference

This server wraps the [Deel REST API v2](https://developer.deel.com/docs). All requests are authenticated with a Bearer token.

**Base URL:** `https://app.deel.com/api`

## License

MIT
