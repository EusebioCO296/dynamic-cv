#!/usr/bin/env node
/**
 * Actualización v2 del contenido del CV (ES + EN) en Sanity.
 *
 * Fuente ES (autoritativa, copiada literal, sin parafrasear):
 *   /Users/xklbr/Downloads/CV_Arturo_Dangond_ES_final.md
 *
 * El inglés no existe como fuente: se genera aquí con traducción profesional
 * de CV, conservando términos técnicos que ya están en inglés en el .md
 * (tool calling, agentic tool-calling loop, guardrails, human-in-the-loop,
 * context engineering, tool routing, LLM-agnostic, Agentic UI, OpenAPI,
 * Swagger, CASL, LLM, REST APIs, GraphQL, nombres de tecnologías, etc.) y el
 * mismo énfasis en negrita que el original en español.
 *
 * Escribe:
 *   - aboutMe (documento único): jobTitle/jobTitleEs, bio/bioEs,
 *     skills/skillsEs
 *     (languages/languagesEs NO se tocan: ya viven dentro de skills/skillsEs)
 *     Además BORRA (unset) coreTech/coreTechEs: campo redundante con
 *     skills/skillsEs, eliminado del schema.
 *   - workExperience (match por companyName): jobTitle/jobTitleEs,
 *     jobDescription/jobDescriptionEs (+ hideDescription:false en O.S Group)
 *   - volunteering (match por organization): role/roleEs,
 *     description/descriptionEs
 *   - education (match por institutionOrSchool): degree/degreeEs,
 *     description/descriptionEs
 *
 * Dry-run por defecto: imprime el diff campo por campo y NO escribe nada.
 * Pasa --commit para escribir de verdad (requiere SANITY_API_WRITE_TOKEN o
 * SANITY_API_TOKEN en .env.local).
 *
 * Uso:
 *   pnpm content:v2            # dry-run
 *   pnpm content:v2 -- --commit
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

/**
 * Bloque de párrafo/viñeta, con marcas opcionales por texto (para negritas).
 * `parts` puede ser un string (sin negrita) o un array de
 * { text, strong? } para alternar spans normales y en negrita dentro del
 * mismo bloque.
 */
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
// aboutMe
// ---------------------------------------------------------------------------

const aboutMeContent = {
  jobTitle: "Full-Stack Software Engineer",
  jobTitleEs: "Full-Stack Software Engineer",

  // Campo `text` plano: no admite negrita. El .md ES trae **ingeniería de
  // sistemas agénticos** en negrita dentro del segundo párrafo — se pierde
  // ese énfasis al no poder representarse en un campo de texto plano (ver
  // aviso en el reporte).
  bioEs:
    "Ingeniero de software Full-Stack con más de 6 años de experiencia en desarrollo web, especializado en TypeScript, React, Next.js, Node.js y NestJS. Experiencia construyendo y evolucionando aplicaciones web modernas, escalables y mantenibles, desde el diseño técnico y la arquitectura hasta la implementación, optimización y despliegue.\n\nExperiencia trabajando en entornos remotos y multidisciplinarios, transformando requisitos de negocio en soluciones técnicas robustas y priorizando calidad, rendimiento, seguridad y mantenibilidad. Experiencia práctica en ingeniería de sistemas agénticos: diseño y desarrollo de agentes que interpretan solicitudes en lenguaje natural y ejecutan operaciones reales sobre APIs, con herramientas generadas desde OpenAPI, autorización, guardrails determinísticos, confirmación humana y trazabilidad.",

  bio: "Full-Stack software engineer with 6+ years of experience in web development, specialising in TypeScript, React, Next.js, Node.js, and NestJS. Experience building and evolving modern, scalable, and maintainable web applications, from technical design and architecture through implementation, optimisation, and deployment.\n\nExperience working in remote, multidisciplinary environments, translating business requirements into robust technical solutions while prioritising quality, performance, security, and maintainability. Hands-on experience in agentic systems engineering: designing and building agents that interpret natural-language requests and execute real operations against APIs, with tools generated from OpenAPI, authorization, deterministic guardrails, human confirmation, and traceability.",

  skillsEs: [
    block([{ text: "Lenguajes", strong: true }]),
    block("TypeScript · JavaScript · SQL"),
    block([{ text: "Front-End", strong: true }]),
    block(
      "React · Next.js · HTML · CSS · Sass · Tailwind CSS · Redux · Redux Saga",
    ),
    block([{ text: "Back-End", strong: true }]),
    block(
      "Node.js · NestJS · PostgreSQL · MongoDB · SQL · NoSQL · REST APIs · GraphQL",
    ),
    block([{ text: "Ingeniería de software", strong: true }]),
    block(
      "Arquitectura de aplicaciones · Diseño de APIs · Desarrollo Full-Stack · Optimización de rendimiento · Seguridad de aplicaciones · Git · GitHub · Metodologías ágiles",
    ),
    block([{ text: "IA y sistemas agénticos", strong: true }]),
    block(
      "LLMs · Tool / Function Calling · Agentic Workflows · LLM Orchestration · OpenAPI-based Tool Generation · Tool Routing · Context Engineering · Human-in-the-Loop · Deterministic Guardrails · Agent Authorization · Auditability · Agentic UI",
    ),
    block([{ text: "Idiomas", strong: true }]),
    block("Español · Inglés"),
  ],

  skills: [
    block([{ text: "Programming Languages", strong: true }]),
    block("TypeScript · JavaScript · SQL"),
    block([{ text: "Front-End", strong: true }]),
    block(
      "React · Next.js · HTML · CSS · Sass · Tailwind CSS · Redux · Redux Saga",
    ),
    block([{ text: "Back-End", strong: true }]),
    block(
      "Node.js · NestJS · PostgreSQL · MongoDB · SQL · NoSQL · REST APIs · GraphQL",
    ),
    block([{ text: "Software Engineering", strong: true }]),
    block(
      "Application Architecture · API Design · Full-Stack Development · Performance Optimization · Application Security · Git · GitHub · Agile Methodologies",
    ),
    block([{ text: "AI & Agentic Systems", strong: true }]),
    block(
      "LLMs · Tool / Function Calling · Agentic Workflows · LLM Orchestration · OpenAPI-based Tool Generation · Tool Routing · Context Engineering · Human-in-the-Loop · Deterministic Guardrails · Agent Authorization · Auditability · Agentic UI",
    ),
    block([{ text: "Languages", strong: true }]),
    block("Spanish · English"),
  ],
};

// ---------------------------------------------------------------------------
// workExperience — match: companyName tal cual está en Sanity.
// ---------------------------------------------------------------------------

const workExperienceContent = [
  {
    match: "Archie",
    jobTitleEs: "Desarrollador Full-Stack",
    jobTitle: "Full-Stack Developer",
    jobDescriptionEs: bulletList([
      [
        { text: "Desarrollo Full-Stack con " },
        { text: "NestJS, Next.js y TypeScript", strong: true },
        { text: ": servicios backend, APIs orientadas a negocio e interfaces web mantenibles, en un entorno remoto y ágil." },
      ],
      [
        { text: "Harness agéntico basado en OpenAPI con " },
        { text: "Agentic UI", strong: true },
        { text: ": " },
        { text: "tool-calling loop", strong: true },
        { text: " iterativo, generación dinámica de tools desde el spec y arquitectura " },
        { text: "LLM-agnostic", strong: true },
        { text: "." },
      ],
      [
        { text: "Producción a escala: " },
        { text: "tool routing", strong: true },
        { text: " sobre 140+ herramientas, " },
        { text: "context engineering", strong: true },
        { text: ", " },
        { text: "guardrails determinísticos", strong: true },
        { text: " y flujos " },
        { text: "human-in-the-loop", strong: true },
        { text: "." },
      ],
      [
        { text: "Autorización con " },
        { text: "CASL", strong: true },
        { text: " multi-tenant, " },
        { text: "trazabilidad", strong: true },
        { text: " y seguimiento de consumo de LLM." },
      ],
    ]),
    jobDescription: bulletList([
      [
        { text: "Full-Stack development with " },
        { text: "NestJS, Next.js, and TypeScript", strong: true },
        { text: ": backend services, business-oriented APIs, and maintainable web interfaces, in a remote, agile environment." },
      ],
      [
        { text: "OpenAPI-based agentic harness with " },
        { text: "Agentic UI", strong: true },
        { text: ": iterative " },
        { text: "tool-calling loop", strong: true },
        { text: ", dynamic tool generation from the spec, and " },
        { text: "LLM-agnostic", strong: true },
        { text: " architecture." },
      ],
      [
        { text: "Production at scale: " },
        { text: "tool routing", strong: true },
        { text: " across 140+ tools, " },
        { text: "context engineering", strong: true },
        { text: ", " },
        { text: "deterministic guardrails", strong: true },
        { text: ", and " },
        { text: "human-in-the-loop", strong: true },
        { text: " flows." },
      ],
      [
        { text: "Authorization with " },
        { text: "multi-tenant CASL", strong: true },
        { text: ", " },
        { text: "traceability", strong: true },
        { text: ", and LLM usage tracking." },
      ],
    ]),
  },
  {
    match: "DaVinci Health Malta (Europa)",
    jobTitleEs: "Desarrollador Full-Stack",
    jobTitle: "Full-Stack Developer",
    jobDescriptionEs: bulletList([
      "Participación en la modernización de un sistema ERP hospitalario mediante el diseño e implementación de una solución web unificada.",
      [
        { text: "Desarrollo Full-Stack con " },
        { text: "NestJS, PostgreSQL, Next.js, TypeScript y Redux Saga", strong: true },
        { text: "." },
      ],
      "Diseño de soluciones orientadas a escalabilidad, mantenibilidad y seguridad en un entorno con requisitos exigentes de protección de datos.",
      "Colaboración con equipos multidisciplinarios para transformar procesos y requisitos del negocio en funcionalidades de software.",
      "Aplicación de buenas prácticas de ingeniería, optimización de procesos y desarrollo iterativo mediante metodologías ágiles.",
    ]),
    jobDescription: bulletList([
      "Participated in the modernisation of a hospital ERP system by designing and implementing a unified web solution.",
      [
        { text: "Full-Stack development with " },
        { text: "NestJS, PostgreSQL, Next.js, TypeScript, and Redux Saga", strong: true },
        { text: "." },
      ],
      "Designed solutions focused on scalability, maintainability, and security in an environment with demanding data-protection requirements.",
      "Collaborated with multidisciplinary teams to translate business processes and requirements into software features.",
      "Applied engineering best practices, process optimisation, and iterative development through agile methodologies.",
    ]),
  },
  {
    match: "RV Dev",
    jobTitleEs: "Desarrollador Full-Stack",
    jobTitle: "Full-Stack Developer",
    jobDescriptionEs: bulletList([
      [
        { text: "Desarrollo de aplicaciones web modernas y sitios de alto rendimiento utilizando " },
        { text: "React, Gatsby.js, Sanity.io, GraphQL, Node.js, NestJS y PostgreSQL", strong: true },
        { text: "." },
      ],
      "Construcción de aplicaciones dinámicas y escalables con arquitectura orientada a mantenibilidad y rendimiento.",
      "Desarrollo de soluciones WordPress personalizadas a partir de diseños y requisitos funcionales proporcionados por equipos de diseño.",
      "Integración de interfaces de usuario con servicios backend y APIs para entregar experiencias web completas.",
      [
        { text: "Colaboración mediante " },
        { text: "Git, GitHub y metodologías ágiles", strong: true },
        { text: ", participando en debugging, optimización y despliegue de aplicaciones." },
      ],
    ]),
    jobDescription: bulletList([
      [
        { text: "Developed modern web applications and high-performance sites using " },
        { text: "React, Gatsby.js, Sanity.io, GraphQL, Node.js, NestJS, and PostgreSQL", strong: true },
        { text: "." },
      ],
      "Built dynamic, scalable applications with an architecture focused on maintainability and performance.",
      "Developed custom WordPress solutions from designs and functional requirements provided by design teams.",
      "Integrated user interfaces with backend services and APIs to deliver complete web experiences.",
      [
        { text: "Collaborated using " },
        { text: "Git, GitHub, and agile methodologies", strong: true },
        { text: ", participating in debugging, optimisation, and deployment of applications." },
      ],
    ]),
  },
  {
    match: "O.S Group",
    jobTitleEs: "Desarrollador Front-End",
    jobTitle: "Front-End Developer",
    hideDescription: false,
    jobDescriptionEs: bulletList([
      "Desarrollo y mantenimiento de interfaces web orientadas a las necesidades funcionales y visuales de los productos.",
      "Implementación de componentes y experiencias de usuario utilizando tecnologías modernas del ecosistema JavaScript.",
    ]),
    jobDescription: bulletList([
      "Developed and maintained web interfaces aligned with the functional and visual needs of the products.",
      "Implemented components and user experiences using modern technologies from the JavaScript ecosystem.",
    ]),
  },
];

// ---------------------------------------------------------------------------
// volunteering — match: organization tal cual está en Sanity.
// ---------------------------------------------------------------------------

const volunteeringContent = [
  {
    match: "BeeSoft Labs",
    roleEs: "Consultor de Educación Técnica",
    role: "Technical Education Consultant",
    descriptionEs: bulletList([
      "Diseño e implementación de rutas de aprendizaje para estudiantes de tecnología.",
      "Mentoría y acompañamiento técnico durante el proceso formativo.",
      [
        { text: "Gestión de alianzas con " },
        { text: "JetBrains", strong: true },
        { text: " y " },
        { text: "Blisk.io", strong: true },
        { text: " para obtener patrocinios y recursos tecnológicos." },
      ],
    ]),
    description: bulletList([
      "Designed and implemented learning paths for technology students.",
      "Provided mentorship and technical guidance throughout the training process.",
      [
        { text: "Managed partnerships with " },
        { text: "JetBrains", strong: true },
        { text: " and " },
        { text: "Blisk.io", strong: true },
        { text: " to secure sponsorships and technology resources." },
      ],
    ]),
  },
];

// ---------------------------------------------------------------------------
// education — match: institutionOrSchool tal cual está en Sanity.
// ---------------------------------------------------------------------------

const educationContent = [
  {
    match: "Servicio Nacional de Aprendizaje (SENA)",
    degreeEs: "Análisis y Desarrollo de Software",
    degree: "Software Analysis and Development",
    // El .md ES no trae descripción para esta entrada -> no hay nada que
    // migrar en ninguno de los dos idiomas.
    descriptionEs: null,
    description: null,
  },
  {
    match: "IELS Malta - Institute of English Language Studies",
    degreeEs: "Inglés",
    degree: "English",
    descriptionEs: [
      block(
        "Programa de Inglés General orientado al desarrollo de competencias de lectura, escritura, expresión oral y comprensión auditiva para contextos cotidianos y profesionales.",
      ),
    ],
    description: [
      block(
        "General English program focused on developing reading, writing, speaking, and listening skills for everyday and professional contexts.",
      ),
    ],
  },
  {
    match: "Code Your Future CO",
    degreeEs: "Desarrollador Full-Stack JavaScript",
    degree: "Full-Stack JavaScript Developer",
    descriptionEs: [
      block(
        "Bootcamp intensivo de desarrollo Full-Stack enfocado en JavaScript, React, Node.js, Express.js, MongoDB y PostgreSQL, con formación práctica en Git, GitHub, metodologías ágiles, debugging, optimización y despliegue.",
      ),
    ],
    description: [
      block(
        "Intensive Full-Stack development bootcamp focused on JavaScript, React, Node.js, Express.js, MongoDB, and PostgreSQL, with hands-on training in Git, GitHub, agile methodologies, debugging, optimization, and deployment.",
      ),
    ],
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
    console.log(`    SIN FUENTE — se omite, no se escribe nada.`);
    return;
  }
  const next = isPortableText ? ptToPlainText(newValue) : newValue;
  console.log(`  ${label}:`);
  console.log(`    actual -> ${JSON.stringify(current)}`);
  console.log(`    nuevo  -> ${JSON.stringify(next)}`);
}

function printUnsetDiff(label, currentValue, isPortableText) {
  const current = isPortableText
    ? ptToPlainText(currentValue)
    : (currentValue ?? "(vacío)");
  console.log(`  ${label}:`);
  console.log(`    actual -> ${JSON.stringify(current)}`);
  console.log(
    `    SE BORRARÁ (unset) — campo eliminado del schema, ya no se escribe.`,
  );
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
  const unset = [];
  for (const f of fields) {
    if (f.unset) {
      printUnsetDiff(f.field, doc[f.field], f.portableText);
      unset.push(f.field);
      continue;
    }
    const newValue = translation[f.field];
    printFieldDiff(f.field, doc[f.field], newValue, f.portableText);
    if (newValue !== null && newValue !== undefined) {
      patch[f.field] = newValue;
    }
  }

  return [{ _id: doc._id, patch, unset }];
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
        `  Documentos en Sanity SIN entrada en el contenido nuevo: ${unmatchedDocs
          .map((d) => `"${d[matchField]}" (${d._id})`)
          .join(", ")}`,
      );
    }
    if (unmatchedTranslations.length > 0) {
      lines.push(
        `  Entradas del contenido nuevo SIN documento en Sanity: ${unmatchedTranslations
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
      const newValue = t[f.field];
      printFieldDiff(f.field, doc[f.field], newValue, f.portableText);
      if (newValue !== null && newValue !== undefined) {
        patch[f.field] = newValue;
      }
    }
    patches.push({ _id: doc._id, patch, unset: [] });
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
      query: `*[_type=="aboutMe"]{_id, jobTitle, jobTitleEs, bio, bioEs, skills, skillsEs, coreTech, coreTechEs}`,
      translation: aboutMeContent,
      fields: [
        { field: "jobTitle" },
        { field: "jobTitleEs" },
        { field: "bio" },
        { field: "bioEs" },
        { field: "skills", portableText: true },
        { field: "skillsEs", portableText: true },
        { field: "coreTech", portableText: true, unset: true },
        { field: "coreTechEs", portableText: true, unset: true },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "workExperience",
      label: "Work Experience",
      query: `*[_type=="workExperience"]{_id, companyName, jobTitle, jobTitleEs, jobDescription, jobDescriptionEs, hideDescription}`,
      matchField: "companyName",
      translations: workExperienceContent,
      fields: [
        { field: "jobTitle" },
        { field: "jobTitleEs" },
        { field: "jobDescription", portableText: true },
        { field: "jobDescriptionEs", portableText: true },
        { field: "hideDescription" },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "volunteering",
      label: "Volunteering",
      query: `*[_type=="volunteering"]{_id, organization, role, roleEs, description, descriptionEs}`,
      matchField: "organization",
      translations: volunteeringContent,
      fields: [
        { field: "role" },
        { field: "roleEs" },
        { field: "description", portableText: true },
        { field: "descriptionEs", portableText: true },
      ],
    })),
  );

  allPatches.push(
    ...(await migrateCollection({
      typeName: "education",
      label: "Education",
      query: `*[_type=="education"]{_id, institutionOrSchool, degree, degreeEs, description, descriptionEs}`,
      matchField: "institutionOrSchool",
      translations: educationContent,
      fields: [
        { field: "degree" },
        { field: "degreeEs" },
        { field: "description", portableText: true },
        { field: "descriptionEs", portableText: true },
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
  for (const { _id, patch, unset } of allPatches) {
    const hasSet = Object.keys(patch).length > 0;
    const hasUnset = unset && unset.length > 0;
    if (!hasSet && !hasUnset) continue;
    tx.patch(_id, (p) => {
      if (hasSet) p.set(patch);
      if (hasUnset) p.unset(unset);
      return p;
    });
  }
  await tx.commit();
  console.log("Listo.");
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
