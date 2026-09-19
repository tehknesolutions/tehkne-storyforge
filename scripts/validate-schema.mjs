import fs from "node:fs/promises";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaPath = new URL("../schemas/tnir-v0.1.schema.json", import.meta.url);
const samplePath = process.argv[2]
  ? new URL(`../${process.argv[2]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const [schemaText, sampleText] = await Promise.all([
  fs.readFile(schemaPath, "utf8"),
  fs.readFile(samplePath, "utf8")
]);

const schema = JSON.parse(schemaText);
const sample = JSON.parse(sampleText);

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
});

addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(sample);

if (!valid) {
  console.error("T-NIR validation failed.");
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

console.log("T-NIR validation passed.");
