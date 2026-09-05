#!/usr/bin/env node
/**
 * Migración de contenido ES a Sanity.
 *
 * Carga el texto en español (extraído literalmente de /Users/xklbr/Documents/me/cv_es_eu.pdf,
 * limpiado de los saltos de línea que el extractor de PDF mete dentro de las palabras, y
 * verificado párrafo por párrafo contra cv_en_eu.pdf) en los campos *Es de:
 *   - aboutMe (documento único): jobTitleEs, bioEs, skillsEs, languagesEs
 *   - workExperience (match por companyName): jobTitleEs, jobDescriptionEs
 *   - education (match por institutionOrSchool): degreeEs, descriptionEs
 *   - volunteering (match por organization): roleEs, descriptionEs
 *
 * Dry-run por defecto: imprime el diff campo por campo y NO escribe nada.
 * Pasa --commit para escribir de verdad (requiere SANITY_API_WRITE_TOKEN en .env.local).
 *
 * Uso:
 *   pnpm migrate:es            # dry-run
 *   pnpm migrate:es -- --commit
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
const readToken = getEnv("SANITY_API_READ_TOKEN");
const writeToken = getEnv("SANITY_API_WRITE_TOKEN") || getEnv("SANITY_API_TOKEN");

if (!projectId || !dataset) {
  console.error(
    "Faltan PUBLIC_SANITY_PROJECT_ID y/o PUBLIC_SANITY_DATASET en .env",
  );
  process.exit(1);
}

if (COMMIT && !writeToken) {
  console.error(
    [
      "",
      "No se encontró SANITY_API_WRITE_TOKEN ni SANITY_API_TOKEN — no se puede escribir en Sanity.",
      "",
      "Cómo generarlo:",
      `  1. Ve a https://www.sanity.io/manage/project/${projectId}/api#tokens`,
      "  2. Crea un token nuevo con permisos de escritura (Editor o Write).",
      "  3. Copia el token.",
      "",
      "Dónde ponerlo:",
      "  Añade esta línea a .env.local (en la raíz del proyecto, NO a .env — .env.local no se versiona):",
      "    SANITY_API_WRITE_TOKEN=<tu-token>",
      "  (o usa SANITY_API_TOKEN como alternativa)",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Utilidades de Portable Text
// ---------------------------------------------------------------------------

function key() {
  return randomBytes(6).toString("hex");
}

/** Bloque de párrafo normal, con marcas opcionales por texto (para negritas). */
function block(parts, { list = false } = {}) {
  const children = (Array.isArray(parts) ? parts : [{ text: parts }]).map(
    (p) => ({
      _key: key(),
      _type: "span",
      text: p.text,
      marks: p.strong ? ["strong"] : [],
    }),
  );
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [],
    ...(list ? { level: 1, listItem: "bullet" } : {}),
    children,
  };
}

function bulletList(items) {
  return items.map((text) => block(text, { list: true }));
}

// ---------------------------------------------------------------------------
// Contenido ES (extraído literalmente de cv_es_eu.pdf, reconstruido a partir
// de las palabras partidas por el extractor y verificado contra cv_en_eu.pdf).
//
// NOTA sobre bioEs: el PDF ES dice "más de 5 años" (versión más vieja); el
// usuario confirmó sincronizarlo con el EN actual ("6+ years") -> "más de 6 años".
// ---------------------------------------------------------------------------

const aboutMeEs = {
  jobTitleEs: "Desarrollador Front-End",
  bioEs:
    "Desarrollador web con más de 6 años de experiencia construyendo y manteniendo aplicaciones web dinámicas en diversas industrias. Capacidad demostrada para aprender continuamente, trabajar en equipo de forma colaborativa y entregar soluciones innovadoras y técnicamente robustas. Apasionado por crear productos digitales, funcionales, modernos y escalables.",
  skillsEs: [
    block([{ text: "Lenguajes de programación", strong: true }]),
    block("JavaScript | TypeScript"),
    block(""),
    block([{ text: "Tecnologías Front-End", strong: true }]),
    block(
      "HTML | CSS | Sass | Tailwindcss | React.js | Next.js\nRedux | Redux Saga",
    ),
    block([{ text: "", strong: true }]),
    block([{ text: "Tecnologías Back-End", strong: true }]),
    block("Node.js | Nest.js | SQL | NoSQL"),
  ],
  languagesEs: [block("Inglés | Español")],
};

/** match: companyName tal cual está en Sanity. */
const workExperienceEs = [
  {
    match: "O.S Group",
    jobTitleEs: "Desarrollador Front-End",
    // El PDF ES (igual que el EN) no incluye descripción para esta empresa —
    // el documento de Sanity SÍ tiene jobDescription en inglés. No hay fuente
    // en el PDF para traducir este campo: se omite (ver advertencia en el reporte).
    jobDescriptionEs: null,
  },
  {
    match: "RV Dev",
    jobTitleEs: "Desarrollador Full Stack",
    jobDescriptionEs: bulletList([
      "Experiencia en tecnologías web modernas como Gatsby.js, Sanity.io y GraphQL, especializado en la construcción de sitios web estáticos de alto rendimiento, escalables y fáciles de mantener.",
      "Habilidad en desarrollo WordPress personalizado, alineando diseños de UI y requisitos funcionales provistos por equipos de diseño para entregar sitios web a medida, visualmente atractivos y completamente funcionales.",
      "Experiencia en el desarrollo de aplicaciones web dinámicas robustas utilizando React.js, Redux Saga, Node.js, Nest.js y PostgreSQL, garantizando funcionalidad fluida, escalabilidad y rendimiento óptimo.",
    ]),
  },
  {
    match: "DaVinci Health Malta (Europe)",
    jobTitleEs: "Desarrollador Full Stack",
    jobDescriptionEs: bulletList([
      "Contribuí significativamente a la modernización del sistema ERP del hospital diseñando e implementando una solución unificada. Este trabajo optimizó procesos, mejoró la atención al paciente y potenció la toma de decisiones basada en datos.",
      "Colaboré estrechamente con colegas para entregar soluciones escalables y de alta calidad, utilizando tecnologías como Nest.js, PostgreSQL, Next.js, TypeScript y Redux Saga. Aseguré el seguimiento de buenas prácticas de desarrollo e implementé medidas avanzadas de seguridad de datos para cumplir con las regulaciones sanitarias.",
      "Trabajé eficazmente en equipos multidisciplinarios, traduciendo requisitos en soluciones técnicas escalables, optimizando procesos y adaptándome a las necesidades cambiantes del sector salud mediante metodologías ágiles.",
    ]),
  },
  {
    match: "Archie",
    jobTitleEs: "Desarrollador Full-Stack",
    jobDescriptionEs: [
      block(
        "Contribuí a la construcción y mejora de aplicaciones full-stack desarrollando servicios backend escalables en NestJS e interfaces frontend modernas en Next.js. Creé nuevas funcionalidades y herramientas internas en múltiples lenguajes de programación.",
      ),
      block(
        "Colaboré estrechamente con equipos multifuncionales para entregar soluciones confiables y de alta calidad, garantizando una arquitectura limpia, alto rendimiento y manejo seguro de datos. Traduje requisitos en diseños técnicos efectivos y apoyé la iteración rápida mediante metodologías ágiles.",
      ),
    ],
  },
];

/** match: institutionOrSchool tal cual está en Sanity. */
const educationEs = [
  {
    match: "Code Your Future CO",
    degreeEs: "Desarrollador Full Stack JavaScript",
    descriptionEs: [
      block([
        { text: "Bootcamp de Desarrollo Full-Stack", strong: true },
        {
          text: "\nCompleté un programa intensivo enfocado en el desarrollo web moderno, especializado en tecnologías JavaScript y buenas prácticas. Esta formación práctica proporcionó una base sólida para construir aplicaciones robustas, escalables y centradas en el usuario.",
        },
      ]),
      block(
        [
          { text: "Desarrollo Full-Stack:", strong: true },
          {
            text: " Competente en la construcción de interfaces de usuario dinámicas y responsivas con React.js y el desarrollo de aplicaciones escalables del lado del servidor usando Node.js, Express.js y bases de datos como MongoDB y PostgreSQL.",
          },
        ],
        { list: true },
      ),
      block(
        [
          { text: "Colaboración y Resolución de Problemas:", strong: true },
          {
            text: " Experiencia en control de versiones con Git y GitHub, utilizando metodologías Ágiles para un trabajo en equipo eficiente. Fuerte capacidad para depurar, optimizar y desplegar aplicaciones, garantizando confiabilidad en escenarios reales.",
          },
        ],
        { list: true },
      ),
    ],
  },
  {
    match: "IELS Malta - Institute of English Language Studies",
    degreeEs: "Inglés",
    descriptionEs: [
      block(
        "Estudié Inglés General, enfocándome en mejorar las habilidades lingüísticas en lectura, escritura, expresión oral y comprensión auditiva. El programa incluyó gramática, vocabulario y práctica comunicativa para mejorar la competencia y confianza general en el uso del inglés cotidiano y profesional.",
      ),
    ],
  },
  {
    match: "Servicio Nacional de Aprendizaje (SENA)",
    degreeEs: "Análisis y desarrollo de software",
    // El campo description (EN) de este documento está vacío en Sanity y el
    // PDF ES tampoco trae texto para esta entrada -> no hay nada que migrar.
    descriptionEs: null,
  },
];

/** match: organization tal cual está en Sanity. */
const volunteeringEs = [
  {
    match: "BeeSoft Labs",
    roleEs: "Consultor de Educación Técnica",
    descriptionEs: bulletList([
      "Desarrollé e implementé una ruta de aprendizaje efectiva para estudiantes.",
      "Mentoricé a estudiantes, brindando orientación y apoyo a lo largo de su proceso formativo.",
      "Establecí alianzas estratégicas con JetBrains y Blisk.io, asegurando patrocinios tecnológicos.",
    ]),
  },
];

// ---------------------------------------------------------------------------
// Sanity client
// ---------------------------------------------------------------------------

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-07-24",
  token: COMMIT ? writeToken : readToken,
  useCdn: false,
  perspective: "raw",
});

// ---------------------------------------------------------------------------
// Helpers de reporte
// ---------------------------------------------------------------------------

function ptToPlainText(blocks) {
  if (!blocks) return "(vacío)";
  return blocks
    .map((b) =>
      (b.children ?? [])
        .map((c) => (c.marks?.includes("strong") ? `**${c.text}**` : c.text))
        .join(""),
    )
    .join("\n");
}

function printFieldDiff(label, currentValue, newValue, isPortableText) {
  const current = isPortableText
    ? ptToPlainText(currentValue)
    : (currentValue ?? "(vacío)");
  if (newValue === null || newValue === undefined) {
    console.log(`  ${label}:`);
    console.log(`    SIN FUENTE EN EL PDF — se omite, no se escribe nada.`);
    return;
  }
  const next = isPortableText ? ptToPlainText(newValue) : newValue;
  console.log(`  ${label}:`);
  console.log(`    actual -> ${JSON.stringify(current)}`);
  console.log(`    nuevo  -> ${JSON.stringify(next)}`);
}

// ---------------------------------------------------------------------------
// Migración por tipo de documento
// ---------------------------------------------------------------------------

async function migrateSingleton({
  typeName,
  label,
  query,
  translation,
  fields,
}) {
  console.log(`\n=== ${label} ===`);
  const docs = await client.fetch(query);
  if (docs.length === 0) {
    throw new Error(`No se encontró ningún documento ${typeName} en Sanity.`);
  }
  if (docs.length > 1) {
    throw new Error(
      `Se esperaba un único documento ${typeName}, pero se encontraron ${docs.length}.`,
    );
  }
  const doc = docs[0];
  console.log(`Documento: ${doc._id}`);

  const patch = {};
  for (const f of fields) {
    const newValue = translation[f.esField];
    printFieldDiff(f.esField, doc[f.esField], newValue, f.portableText);
    if (newValue !== null && newValue !== undefined) {
      patch[f.esField] = newValue;
    }
  }

  return [{ _id: doc._id, patch }];
}

async function migrateCollection({
  typeName,
  label,
  query,
  matchField,
  translations,
  fields,
}) {
  console.log(`\n=== ${label} ===`);
  const docs = await client.fetch(query);

  const docsByMatch = new Map(docs.map((d) => [d[matchField], d]));
  const translationsByMatch = new Map(translations.map((t) => [t.match, t]));

  const unmatchedDocs = docs.filter(
    (d) => !translationsByMatch.has(d[matchField]),
  );
  const unmatchedTranslations = translations.filter(
    (t) => !docsByMatch.has(t.match),
  );

  if (unmatchedDocs.length > 0 || unmatchedTranslations.length > 0) {
    const lines = [
      `Desajuste de documentos en ${typeName} (match por "${matchField}"):`,
    ];
    if (unmatchedDocs.length > 0) {
      lines.push(
        `  Documentos en Sanity SIN traducción en el PDF: ${unmatchedDocs
          .map((d) => `"${d[matchField]}" (${d._id})`)
          .join(", ")}`,
      );
    }
    if (unmatchedTranslations.length > 0) {
      lines.push(
        `  Entradas del PDF SIN documento en Sanity: ${unmatchedTranslations
          .map((t) => `"${t.match}"`)
          .join(", ")}`,
      );
    }
    throw new Error(lines.join("\n"));
  }

  const patches = [];
  for (const t of translations) {
    const doc = docsByMatch.get(t.match);
    console.log(`\n--- ${t.match} (${doc._id}) ---`);
    const patch = {};
    for (const f of fields) {
      const newValue = t[f.esField];
      printFieldDiff(f.esField, doc[f.esField], newValue, f.portableText);
      if (newValue !== null && newValue !== undefined) {
        patch[f.esField] = newValue;
      }
    }
    patches.push({ _id: doc._id, patch });
  }

  return patches;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    `Sanity project=${projectId} dataset=${dataset} modo=${COMMIT ? "COMMIT (escribe)" : "DRY-RUN (solo lectura)"}`,
  );

  const allPatches = [];

  allPatches.push(
    ...(await migrateSingleton({
      typeName: "aboutMe",
      label: "About Me",
      query: `*[_type=="aboutMe"]{_id, jobTitleEs, bioEs, skillsEs, languagesEs}`,
      translation: aboutMeEs,
      fields: [
        { esField: "jobTitleEs" },
        { esField: "bioEs" },
        { esField: "skillsEs", portableText: true },
        { esField: "languagesEs", portableText: true },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "workExperience",
      label: "Work Experience",
      query: `*[_type=="workExperience"]{_id, companyName, jobTitleEs, jobDescriptionEs}`,
      matchField: "companyName",
      translations: workExperienceEs,
      fields: [
        { esField: "jobTitleEs" },
        { esField: "jobDescriptionEs", portableText: true },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "education",
      label: "Education",
      query: `*[_type=="education"]{_id, institutionOrSchool, degreeEs, descriptionEs}`,
      matchField: "institutionOrSchool",
      translations: educationEs,
      fields: [
        { esField: "degreeEs" },
        { esField: "descriptionEs", portableText: true },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "volunteering",
      label: "Volunteering",
      query: `*[_type=="volunteering"]{_id, organization, roleEs, descriptionEs}`,
      matchField: "organization",
      translations: volunteeringEs,
      fields: [
        { esField: "roleEs" },
        { esField: "descriptionEs", portableText: true },
      ],
    })),
  );

  console.log("\n===================================");
  if (!COMMIT) {
    console.log(
      "DRY-RUN: no se escribió nada. Corre con --commit para aplicar estos cambios.",
    );
    return;
  }

  console.log(`Escribiendo ${allPatches.length} documento(s) en Sanity...`);
  const tx = client.transaction();
  for (const { _id, patch } of allPatches) {
    if (Object.keys(patch).length === 0) continue;
    tx.patch(_id, (p) => p.set(patch));
  }
  await tx.commit();
  console.log("Listo.");
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
