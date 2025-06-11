import type { DMMF } from "@prisma/generator-helper";

export interface RelationshipInfo {
	/** The field name in this model (e.g., 'user', 'category', 'tags') */
	fieldName: string;
	/** The related model name (e.g., 'User', 'Category', 'Tag') */
	relatedModel: string;
	/** The relationship type */
	type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
	/** Whether this relationship is required */
	isRequired: boolean;
	/** Whether this is the owning side of the relationship */
	isOwning: boolean;
	/** Foreign key fields if this is the owning side */
	foreignKeys?: string[];
	/** The field name on the related model that points back to this model */
	backReference?: string;
}

export interface ModelRelationships {
	modelName: string;
	/** Relationships where this model owns the foreign key */
	ownsRelations: RelationshipInfo[];
	/** Relationships where this model is referenced by others */
	referencedBy: RelationshipInfo[];
	/** All related models that this model can interact with */
	relatedModels: Set<string>;
}

/**
 * Analyze all relationships in a Prisma schema
 */
export function analyzeSchemaRelationships(dmmf: DMMF.Document): Map<string, ModelRelationships> {
	const modelRelationships = new Map<string, ModelRelationships>();

	// Initialize relationship maps for all models
	for (const model of dmmf.datamodel.models) {
		modelRelationships.set(model.name, {
			modelName: model.name,
			ownsRelations: [],
			referencedBy: [],
			relatedModels: new Set(),
		});
	}

	// Analyze each model's fields to build relationship graph
	for (const model of dmmf.datamodel.models) {
		const currentModelRels = modelRelationships.get(model.name);
		if (!currentModelRels) {
			throw new Error(`Model ${model.name} not found in modelRelationships`);
		}

		for (const field of model.fields) {
			if (!field.relationName) continue;

			// This is a relationship field
			const relatedModel = field.type;
			const isOwning = !!field.relationFromFields && field.relationFromFields.length > 0;
			const isRequired = field.isRequired;
			const isList = field.isList;

			// Determine relationship type
			let relationType: RelationshipInfo["type"];
			if (isList) {
				relationType = isOwning ? "many-to-many" : "one-to-many";
			} else {
				relationType = isOwning ? "many-to-one" : "one-to-one";
			}

			// Find the back reference field on the related model
			const relatedModelDef = dmmf.datamodel.models.find((m) => m.name === relatedModel);
			const backReferenceField = relatedModelDef?.fields.find(
				(f) => f.relationName === field.relationName && f.name !== field.name,
			);

			const relationshipInfo: RelationshipInfo = {
				fieldName: field.name,
				relatedModel,
				type: relationType,
				isRequired,
				isOwning,
				foreignKeys: field.relationFromFields ? [...field.relationFromFields] : undefined,
				backReference: backReferenceField?.name,
			};

			// Add to current model's relationships
			if (isOwning) {
				currentModelRels.ownsRelations.push(relationshipInfo);
			}
			currentModelRels.relatedModels.add(relatedModel);

			// Add reverse relationship info to the related model
			const relatedModelRels = modelRelationships.get(relatedModel);
			if (relatedModelRels && isOwning && backReferenceField) {
				// This is the owning side - add reverse relationship to the related model
				const reverseRelationType: RelationshipInfo["type"] = backReferenceField.isList ? "one-to-many" : "one-to-one";

				relatedModelRels.referencedBy.push({
					fieldName: backReferenceField.name,
					relatedModel: model.name,
					type: reverseRelationType,
					isRequired: false, // Back references are typically optional
					isOwning: false,
					backReference: field.name,
				});
				relatedModelRels.relatedModels.add(model.name);
			}
		}
	}

	return modelRelationships;
}

/**
 * Get all unique input types that a model needs to import based on its relationships
 */
export function getRequiredWhereUniqueImports(modelRels: ModelRelationships): string[] {
	const imports = new Set<string>();

	// Add imports for all related models
	for (const relatedModel of Array.from(modelRels.relatedModels)) {
		imports.add(`${relatedModel}WhereUniqueInput`);
	}

	return Array.from(imports).sort();
}

/**
 * Get relationship functions that should be generated for a model
 */
export function getRelationshipFunctions(modelRels: ModelRelationships): {
	setRequired: RelationshipInfo[];
	setOptional: RelationshipInfo[];
	remove: RelationshipInfo[];
	addMany: RelationshipInfo[];
	setMany: RelationshipInfo[];
	removeMany: RelationshipInfo[];
	clearMany: RelationshipInfo[];
} {
	const setRequired: RelationshipInfo[] = [];
	const setOptional: RelationshipInfo[] = [];
	const remove: RelationshipInfo[] = [];
	const addMany: RelationshipInfo[] = [];
	const setMany: RelationshipInfo[] = [];
	const removeMany: RelationshipInfo[] = [];
	const clearMany: RelationshipInfo[] = [];

	// Process owned relationships (where this model has the foreign key)
	for (const rel of modelRels.ownsRelations) {
		switch (rel.type) {
			case "many-to-one":
				if (rel.isRequired) {
					setRequired.push(rel);
				} else {
					setOptional.push(rel);
					remove.push(rel);
				}
				break;
			case "one-to-one":
				if (rel.isRequired) {
					setRequired.push(rel);
				} else {
					setOptional.push(rel);
					remove.push(rel);
				}
				break;
			case "many-to-many":
				addMany.push(rel);
				setMany.push(rel);
				removeMany.push(rel);
				clearMany.push(rel);
				break;
		}
	}

	// Process relationships where this model is referenced by others
	for (const rel of modelRels.referencedBy) {
		switch (rel.type) {
			case "one-to-many":
				// Can add/remove items from the collection
				addMany.push(rel);
				removeMany.push(rel);
				clearMany.push(rel);
				break;
			case "many-to-one":
				// This model is on the "one" side, can set/remove the reference
				setOptional.push(rel);
				remove.push(rel);
				break;
		}
	}

	return {
		setRequired,
		setOptional,
		remove,
		addMany,
		setMany,
		removeMany,
		clearMany,
	};
}

/**
 * Generate dynamic imports based on actual model relationships
 */
export function generateRelationshipImports(
	modelName: string,
	modelRels: ModelRelationships,
	includeBaseTypes = true,
): string[] {
	const imports = new Set<string>();

	// Always include the model's own types
	if (includeBaseTypes) {
		imports.add(modelName);
		imports.add(`${modelName}CreateInput`);
		imports.add(`${modelName}CreateManyInput`);
		imports.add(`${modelName}UpdateInput`);
		imports.add(`${modelName}WhereInput`);
		imports.add(`${modelName}WhereUniqueInput`);
	}

	// Add relationship-specific imports
	for (const relatedModel of Array.from(modelRels.relatedModels)) {
		imports.add(`${relatedModel}WhereUniqueInput`);
	}

	return Array.from(imports).sort();
}

/**
 * Check if a model has any relationships at all
 */
export function hasRelationships(modelRels: ModelRelationships): boolean {
	return modelRels.ownsRelations.length > 0 || modelRels.referencedBy.length > 0;
}

/**
 * Get a human-readable summary of model relationships for debugging
 */
export function getRelationshipSummary(modelRels: ModelRelationships): string {
	const lines: string[] = [];
	lines.push(`${modelRels.modelName} relationships:`);

	if (modelRels.ownsRelations.length > 0) {
		lines.push("  Owns:");
		for (const rel of modelRels.ownsRelations) {
			const required = rel.isRequired ? " (required)" : " (optional)";
			lines.push(`    ${rel.fieldName} -> ${rel.relatedModel} (${rel.type})${required}`);
		}
	}

	if (modelRels.referencedBy.length > 0) {
		lines.push("  Referenced by:");
		for (const rel of modelRels.referencedBy) {
			lines.push(`    ${rel.relatedModel}.${rel.fieldName} -> ${modelRels.modelName} (${rel.type})`);
		}
	}

	if (modelRels.relatedModels.size === 0) {
		lines.push("  No relationships");
	}

	return lines.join("\n");
}
