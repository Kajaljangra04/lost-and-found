import { Prisma } from "@prisma/client";

const models = Prisma.dmmf.datamodel.models;

for (const name of ["User", "ItemCategory", "FoundItem", "LostItem"]) {
  const model = models.find((m) => m.name === name);

  console.log(`\n===== ${name} =====`);

  if (!model) {
    console.log("Model not found");
    continue;
  }

  for (const field of model.fields) {
    console.log({
      name: field.name,
      type: field.type,
      kind: field.kind,
      required: !field.isRequired ? false : true,
      hasDefault: field.hasDefaultValue,
      relation: field.relationName ?? null,
    });
  }
}
