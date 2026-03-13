import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContractTools } from "./contracts.js";
import { registerWorkerTools } from "./workers.js";
import { registerPaymentTools } from "./payments.js";
import { registerInvoiceTools } from "./invoices.js";
import { registerDocumentTools } from "./documents.js";
import { registerOffCyclePaymentTools } from "./off_cycle_payments.js";
import { registerTimeOffTools } from "./time_off.js";
import { registerExpenseTools } from "./expenses.js";
import { registerOrganizationTools } from "./organizations.js";
import { registerComplianceTools } from "./compliance.js";

export function registerAllTools(server: McpServer): void {
  registerContractTools(server);      // 6 tools
  registerWorkerTools(server);        // 6 tools
  registerPaymentTools(server);       // 5 tools
  registerInvoiceTools(server);       // 5 tools
  registerDocumentTools(server);      // 5 tools
  registerOffCyclePaymentTools(server); // 4 tools
  registerTimeOffTools(server);       // 4 tools
  registerExpenseTools(server);       // 5 tools
  registerOrganizationTools(server);  // 5 tools
  registerComplianceTools(server);    // 3 tools
  // Total: 48 tools
}
