#!/usr/bin/env node
/**
 * Seed del CV de Eusebio José Caballero Olivella en un dataset de Sanity vacío.
 *
 * Contenido del PDF fuente, bilingüe: campos base en inglés (traducción) y
 * campos *Es en español (transcripción literal), igual que el repo de Arturo.
 * `languages` (requerido por el schema) no existe en el PDF y se omite a
 * propósito: Studio mostrará un aviso de validación, esperado y aceptado.
 *
 * Dry-run por defecto: imprime lo que crearía y NO escribe nada.
 * Pasa --commit para escribir (requiere SANITY_API_WRITE_TOKEN o
 * SANITY_API_TOKEN en .env.local). Usa createOrReplace con _id deterministas.
 *
 * Uso:
 *   pnpm seed:eu              # dry-run
 *   pnpm seed:eu -- --commit
 */

import { createClient } from "@sanity/client";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const COMMIT = process.argv.includes("--commit");

// ---------------------------------------------------------------------------
// Carga de variables de entorno (.env y .env.local, sin dependencias externas)
// ---------------------------------------------------------------------------

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, "utf8");
  const env = {};
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const envFromDotenv = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, ".env.local")),
};

function getEnv(key) {
  return process.env[key] ?? envFromDotenv[key] ?? "";
}

const projectId = getEnv("PUBLIC_SANITY_PROJECT_ID");
const dataset = getEnv("PUBLIC_SANITY_DATASET");
const writeToken =
  getEnv("SANITY_API_WRITE_TOKEN") || getEnv("SANITY_API_TOKEN");

if (!projectId || !dataset) {
  console.error(
    "Faltan PUBLIC_SANITY_PROJECT_ID y/o PUBLIC_SANITY_DATASET en .env",
  );
  process.exit(1);
}

if (COMMIT && !writeToken) {
  console.error(
    "No se encontró SANITY_API_WRITE_TOKEN ni SANITY_API_TOKEN en .env.local — no se puede escribir en Sanity.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Utilidades de Portable Text
// ---------------------------------------------------------------------------

function key() {
  return randomBytes(6).toString("hex");
}

function block(text, { style = "normal", list = false } = {}) {
  return {
    _key: key(),
    _type: "block",
    style,
    markDefs: [],
    ...(list ? { level: 1, listItem: "bullet" } : {}),
    children: [{ _key: key(), _type: "span", text, marks: [] }],
  };
}

function group(title, items) {
  return [
    {
      _key: key(),
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [
        { _key: key(), _type: "span", text: title, marks: ["strong"] },
      ],
    },
    block(items.join(" · ")),
  ];
}

const loc = (en, es) => ({ en, es });

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

const docs = [
  {
    _id: "aboutMe",
    _type: "aboutMe",
    title: "About Me",
    firstName: "Eusebio José",
    surname: "Caballero Olivella",
    jobTitle:
      "Electronic Engineer | Specialist in Metrological Assurance and Industrial Instrumentation",
    jobTitleEs:
      "Ingeniero Electrónico | Especialista en Aseguramiento Metrológico e Instrumentación Industrial",
    email: "eusebiocaballero7@gmail.com",
    defaultContactInfo: {
      isActive: true,
      phone: "(+57) 3045563862",
      city: "Marinilla, Antioquia",
      cityEs: "Marinilla, Antioquia",
      country: "Colombia",
      countryEs: "Colombia",
    },
    dynamicContactInfo: [],
    links: [
      {
        _key: key(),
        platformName: "LinkedIn",
        link: "https://www.linkedin.com/in/eusebio-caballero-olivella",
      },
    ],
    bio: "Electronic Engineer with over 3.5 years of experience in industrial metrology, instrumentation and process automation in demanding manufacturing plants (Food/Consumer Goods sector). Specialist in the management, calibration and metrological assurance of critical process variables. Strong skills in optimizing calibration plans through SAP ERP, data analysis and control of automated systems for routine tasks. Committed to strict compliance with quality standards, traceability and continuous improvement, ensuring that measuring equipment conforms to regulatory standards.",
    bioEs: "Ingeniero Electrónico con más de 3.5 años de experiencia en metrología industrial, instrumentación y automatización de procesos en plantas de manufactura de alta exigencia (Sector Alimentos/Consumo Masivo). Especialista en la gestión, calibración y aseguramiento metrológico de variables críticas de proceso. Con sólidas competencias en la optimización de planes de calibración mediante SAP ERP, análisis de datos y control de sistemas automatizados para tareas rutinarias. Orientado al cumplimiento estricto de normativas de calidad, trazabilidad y mejora continua, y asegurar la conformidad de los equipos de medición bajo estándares regulatorios.",
    skills: [
      ...group("Metrology and Quality", [
        "Metrological assurance",
        "Calibration and instrumentation",
        "Uncertainty estimation",
        "ISO standards (9001 / 17025 / 14001 / 45001 / HACCP / FSSC 22000)",
      ]),
      ...group("Automation and Software", [
        "SAP ERP",
        "Python",
        "Java",
        "C language (programming language knowledge)",
        "Industrial automation systems",
        "Office suites and G Suite",
      ]),
      ...group("Management Skills", [
        "Technical team leadership",
        "Data-driven decision making",
        "KPI management",
        "Supplier management",
      ]),
    ],
    skillsEs: [
      ...group("Metrología y Calidad", [
        "Aseguramiento metrológico",
        "Calibración e instrumentación",
        "Estimación de incertidumbre",
        "Normativa ISO (9001 / 17025 / 14001 / 45001 / HACCP / FSSC 22000)",
      ]),
      ...group("Automatización y Software", [
        "SAP ERP",
        "Python",
        "Java",
        "Lenguaje C (conocimientos de lenguajes de programación)",
        "Automatismos industriales",
        "Ofimática y G Suite",
      ]),
      ...group("Competencias de Gestión", [
        "Liderazgo de equipos técnicos",
        "Toma de decisiones basada en datos",
        "Gestión de indicadores (KPIs)",
        "Gestión de proveedores",
      ]),
    ],
  },
  {
    _id: "work-alimentos-carnicos",
    _type: "workExperience",
    title:
      "Técnico de Mantenimiento – Rol Metrología | Alimentos Cárnicos S.A.S",
    jobTitle: "Maintenance Technician – Metrology Role",
    jobTitleEs: "Técnico de Mantenimiento – Rol Metrología",
    companyName: "Alimentos Cárnicos S.A.S",
    startDate: "2024-01-01",
    current: true,
    hideDescription: true,
    chronoIndex: 2,
  },
  {
    _id: "work-a-hora",
    _type: "workExperience",
    title: "Técnico de Mantenimiento – Rol Metrología | A-hora S.A.S",
    jobTitle: "Maintenance Technician – Metrology Role",
    jobTitleEs: "Técnico de Mantenimiento – Rol Metrología",
    companyName: "A-hora S.A.S",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    current: false,
    hideDescription: true,
    chronoIndex: 1,
  },
  {
    _id: "edu-upc",
    _type: "education",
    title: "Ingeniero Electrónico",
    degree: "Electronic Engineer",
    degreeEs: "Ingeniero Electrónico",
    institutionOrSchool: "Universidad Popular Del Cesar",
    chronoIndex: 3,
  },
  {
    _id: "edu-sena",
    _type: "education",
    degree: "Technician in Industrial Automation Maintenance",
    degreeEs: "Técnico en mantenimiento de Automatismos Industriales",
    institutionOrSchool: "SENA",
    chronoIndex: 2,
  },
  {
    _id: "edu-cesde",
    _type: "education",
    degree: "Technician in Software Analysis and Development",
    degreeEs: "Técnico en análisis y desarrollo de software",
    institutionOrSchool: "CESDE",
    chronoIndex: 1,
  },
  {
    _id: "uiStrings",
    _type: "uiStrings",
    sectionTitles: {
      professionalProfile: loc("Professional profile", "Perfil profesional"),
      skills: loc("Skills", "Habilidades"),
      workExperience: loc("Work experience", "Experiencia"),
      volunteering: loc("Volunteering", "Voluntariado"),
      education: loc("Education", "Educación"),
    },
    present: loc("Present", "Presente"),
  },
];

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------

console.log(
  `${COMMIT ? "COMMIT" : "DRY-RUN"} — ${projectId}/${dataset} — ${docs.length} documentos`,
);
for (const d of docs) {
  console.log(`\n[createOrReplace] ${d._type} ${d._id}`);
  console.log(JSON.stringify(d, null, 2));
}

if (!COMMIT) {
  console.log("\nDry-run: no se escribió nada. Pasa --commit para escribir.");
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-07-24",
  token: writeToken,
  useCdn: false,
  perspective: "raw",
});

let tx = client.transaction();
for (const d of docs) tx = tx.createOrReplace(d);
const res = await tx.commit();
console.log(`\nEscritos ${res.results.length} documentos.`);
