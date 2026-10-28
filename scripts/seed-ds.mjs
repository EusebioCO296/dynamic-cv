#!/usr/bin/env node
/**
 * Seed del perfil "DS" (Desarrollador de Software) del CV, ES + EN.
 *
 * SOLO escribe seis campos nuevos del documento aboutMe:
 *   jobTitleDs, jobTitleDsEs, bioDs, bioDsEs, skillsDs, skillsDsEs
 * Nunca toca ningún campo existente (el perfil IE queda intacto).
 *
 * Dry-run por defecto: imprime el diff y NO escribe nada.
 * Pasa --commit para escribir (requiere SANITY_API_TOKEN en .env.local).
 *
 * Uso:
 *   pnpm content:ds              # dry-run
 *   pnpm content:ds -- --commit
 */

import { createClient } from "@sanity/client";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const COMMIT = process.argv.includes("--commit");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of readFileSync(filePath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, eqIdx).trim()] = value;
  }
  return env;
}

const envFromDotenv = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local")),
};
const getEnv = (key) => process.env[key] ?? envFromDotenv[key] ?? "";

const projectId = getEnv("PUBLIC_SANITY_PROJECT_ID");
const dataset = getEnv("PUBLIC_SANITY_DATASET");
const token = getEnv("SANITY_API_TOKEN");

if (!projectId || !dataset) {
  console.error("Faltan PUBLIC_SANITY_PROJECT_ID y/o PUBLIC_SANITY_DATASET en .env");
  process.exit(1);
}
if (!token) {
  console.error("Falta SANITY_API_TOKEN en .env.local (se usa también para leer en dry-run).");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Portable Text (mismo formato que skills/skillsEs: etiqueta en negrita + línea
// con ítems separados por " · ")
// ---------------------------------------------------------------------------

const key = () => randomBytes(6).toString("hex");

function block(text, strong = false) {
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      { _key: key(), _type: "span", text, marks: strong ? ["strong"] : [] },
    ],
  };
}

const groups = (list) => list.flatMap(([label, items]) => [block(label, true), block(items)]);

const content = {
  jobTitleDsEs: "Desarrollador de Software Junior | Ingeniero Electrónico",
  jobTitleDs: "Junior Software Developer | Electronic Engineer",

  bioDsEs:
    "Desarrollador de Software Junior con formación técnica en desarrollo de software (CESDE), orientado a construir aplicaciones web y para dispositivos móviles con las herramientas, metodologías y lenguajes de programación que demanda la industria. Formación en lógica de programación, bases de datos, metodologías ágiles, backend y frontend (lenguaje y framework) y nuevas tecnologías de programación, complementada con conocimientos de Python, Java y C. Ingeniero Electrónico con más de 3.5 años en plantas de manufactura de alimentos, con experiencia en automatización industrial, SAP ERP y análisis de datos para la optimización de procesos. Aporta disciplina de proceso, rigor en la calidad y la trazabilidad, y toma de decisiones basada en datos. En búsqueda de su primera oportunidad como desarrollador de software para aprender en equipo y aportar soluciones confiables y mantenibles.",
  bioDs:
    "Junior Software Developer with technical training in software development (CESDE), focused on building web and mobile applications using the tools, methodologies and programming languages the industry requires. Training in programming logic, databases, agile methodologies, backend and frontend (language and framework) and new programming technologies, complemented by knowledge of Python, Java and C. Electronic Engineer with over 3.5 years in food manufacturing plants, with experience in industrial automation, SAP ERP and data analysis for process optimization. Brings process discipline, rigor in quality and traceability, and data-driven decision making. Seeking a first opportunity as a software developer to learn within a team and deliver reliable, maintainable solutions.",

  skillsDsEs: groups([
    [
      "Desarrollo de software",
      "Lógica de programación · Python · Java · Lenguaje C · Backend (lenguaje y framework) · Frontend (lenguaje y framework) · Aplicaciones web y para dispositivos móviles",
    ],
    [
      "Datos y herramientas",
      "Gestión de bases de datos · Análisis de datos con Power BI · Automatización con Excel · SAP ERP · Ofimática y G Suite",
    ],
    [
      "Metodologías",
      "Metodologías ágiles · Nuevas tecnologías de programación · Control de calidad y trazabilidad (normativa ISO)",
    ],
    [
      "Competencias transversales",
      "Automatización industrial · Liderazgo de equipos técnicos · Toma de decisiones basada en datos · Gestión de indicadores (KPIs) · Inglés conversacional",
    ],
  ]),
  skillsDs: groups([
    [
      "Software Development",
      "Programming logic · Python · Java · C language · Backend (language and framework) · Frontend (language and framework) · Web and mobile applications",
    ],
    [
      "Data & Tools",
      "Database management · Data analysis with Power BI · Excel automation · SAP ERP · Office suites and G Suite",
    ],
    [
      "Methodologies",
      "Agile methodologies · New programming technologies · Quality control and traceability (ISO standards)",
    ],
    [
      "Transferable Skills",
      "Industrial automation · Technical team leadership · Data-driven decision making · KPI management · Conversational English",
    ],
  ]),
};

const FIELDS = [
  ["jobTitleDs", false],
  ["jobTitleDsEs", false],
  ["bioDs", false],
  ["bioDsEs", false],
  ["skillsDs", true],
  ["skillsDsEs", true],
];

const ptToText = (blocks) =>
  (blocks ?? [])
    .map((b) =>
      b.children.map((c) => (c.marks?.includes("strong") ? `**${c.text}**` : c.text)).join(""),
    )
    .join("\n");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-07-24",
  token,
  useCdn: false,
  perspective: "raw",
});

async function main() {
  console.log(
    `Sanity project=${projectId} dataset=${dataset} modo=${COMMIT ? "COMMIT (escribe)" : "DRY-RUN (solo lectura)"}`,
  );
  const docs = await client.fetch(
    `*[_type=="aboutMe"]{_id, jobTitleDs, jobTitleDsEs, bioDs, bioDsEs, skillsDs, skillsDsEs}`,
  );
  if (docs.length !== 1) {
    throw new Error(`Se esperaba un único aboutMe, hay ${docs.length}.`);
  }
  const doc = docs[0];
  console.log(`Documento: ${doc._id}`);

  const patch = {};
  for (const [field, isPt] of FIELDS) {
    const current = isPt ? ptToText(doc[field]) || "(vacío)" : (doc[field] ?? "(vacío)");
    const next = isPt ? ptToText(content[field]) : content[field];
    console.log(`\n  ${field}:`);
    console.log(`    actual -> ${JSON.stringify(current)}`);
    console.log(`    nuevo  -> ${JSON.stringify(next)}`);
    patch[field] = content[field];
  }

  console.log("\n===================================");
  console.log(`Campos que se escribirían: ${Object.keys(patch).join(", ")}`);
  if (!COMMIT) {
    console.log("DRY-RUN: no se escribió nada. Corre con --commit para aplicar.");
    return;
  }
  await client.patch(doc._id).set(patch).commit();
  console.log("Listo.");
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
