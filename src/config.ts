import type { GeneratorOptions } from "@prisma/generator-helper";

export type FlowConfig = {
  prismaImport: string;           
  zodPrismaImport?: string;       
  models: "all" | string[];
  perModelSelect: Record<string, string[]>; 
  perRelationLimit: Record<string, number>; 
  perRelationOrder: Record<string, string>; 
  tenantField?: string; // DB field name used for tenancy scoping (e.g., tenantId, orgId, companyId, company_id)
  tenantModel?: string; // Model name that represents the tenant (e.g., Company, Organization, Tenant)
};

const DEFAULT_LIMIT = 50;

export function parseConfig(opts: GeneratorOptions): FlowConfig {
  const c = opts.generator.config as Record<string, unknown>;

  function getString(v: unknown): string | undefined {
    return typeof v === "string" ? v : undefined;
  }
  function getStringArray(v: unknown): string[] | undefined {
    return Array.isArray(v) ? (v as string[]) : undefined;
  }

  const modelsRaw = getString(c.models)?.trim();
  const models: FlowConfig["models"] = modelsRaw === "all"
    ? "all"
    : (getStringArray(c.models) ?? (modelsRaw ? modelsRaw.split(",").map((s)=>s.trim()) : []));

  const perModelSelect: Record<string, string[]> = {};
  const perRelationLimit: Record<string, number> = {};
  const perRelationOrder: Record<string, string> = {};

  for (const [k, v] of Object.entries(c)) {
    if (/Select$/.test(k)) {
      const model = k.slice(0, -"Select".length);
      perModelSelect[capitalize(model)] = Array.isArray(v) ? v : String(v).split(",").map(s=>s.trim()).filter(Boolean);
    }
    if (/Limit$/.test(k)) {
      const parts = k.slice(0, -"Limit".length).match(/([A-Z][a-z]+)/g);
      if (parts && parts.length >= 2) {
        const model = parts[0];
        const field = uncapitalize(parts.slice(1).join(""));
      perRelationLimit[`${model}.${field}`] = Number(v) || DEFAULT_LIMIT;
      }
    }
    if (/Order$/.test(k)) {
      const parts = k.slice(0, -"Order".length).match(/([A-Z][a-z]+)/g);
      if (parts && parts.length >= 2) {
        const model = parts[0];
        const field = uncapitalize(parts.slice(1).join(""));
        perRelationOrder[`${model}.${field}`] = String(v);
      }
    }
  }

  // Determine models value: default to "all" when unspecified or empty
  const modelsField: FlowConfig["models"] = Array.isArray(models)
    ? (models.length ? models : "all")
    : "all";

  const parsed: FlowConfig = {
    prismaImport: getString(c.prismaImport) || "@prisma/client",
    zodPrismaImport: getString(c.zodPrismaImport),
    models: modelsField,
    perModelSelect,
    perRelationLimit,
    perRelationOrder,
    tenantField: getString(c.tenantField) || "tenantId",
    tenantModel: getString(c.tenantModel),
  };
  return parsed;
}

export const DEFAULTS = { DEFAULT_LIMIT } as const;

function capitalize(s: string){ return s.charAt(0).toUpperCase() + s.slice(1);}
function uncapitalize(s: string){ return s.charAt(0).toLowerCase() + s.slice(1);}