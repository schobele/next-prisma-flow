import type { DMMF } from "@prisma/generator-helper";

export function getModels(dmmf: DMMF.Document){
  return dmmf.datamodel.models;
}

export type Field = DMMF.Field;

export function modelByName(dmmf: DMMF.Document, name: string){
  const m = dmmf.datamodel.models.find(m => m.name === name);
  if(!m) throw new Error(`Model ${name} not found in DMMF`);
  return m;
}

export function isScalar(field: Field){ return field.kind === "scalar"; }
export function isEnum(field: Field){ return field.kind === "enum"; }
export function isRelation(field: Field){ return field.kind === "object"; }
export function targetModel(field: Field){ return field.type; }

export function scalarZodFor(field: Field){
  const t = field.type;
  const base = scalarZod(t);
  let z = base;
  if (field.isList) z = `z.array(${z})`;
  if (!field.isRequired && !field.isList) z = `${z}.optional().nullable()`;
  // Note: isNullable doesn't exist on DMMF.Field, handle nullability through isRequired
  return z;
}

function scalarZod(t: string){
  switch(t){
    case "String": return "z.string()";
    case "Int": return "z.number().int()";
    case "BigInt": return "z.bigint()";
    case "Float": return "z.number()";
    case "Decimal": return "z.string()";
    case "Boolean": return "z.boolean()";
    case "DateTime": return "z.date()";
    case "Json": return "z.any()";
    case "Bytes": return "z.instanceof(Buffer)";
    default: return "z.any()";
  }
}