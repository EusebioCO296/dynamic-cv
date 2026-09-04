import { defineMiddleware } from "astro:middleware";
import { createHash, timingSafeEqual } from "node:crypto";

// Rutas que requieren Basic Auth. Todo lo demás (incluido /studio, que ya
// tiene su propia autenticación de Sanity) pasa sin tocar.
const PROTECTED_PATHS = ["/resume", "/resume-es"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

// Compara dos strings en tiempo constante independientemente de su longitud:
// hashea ambos lados a un tamaño fijo antes de usar timingSafeEqual, así la
// duración no depende de cuántos caracteres coincidan ni de la longitud.
function constantTimeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

function unauthorizedResponse(): Response {
  return new Response("Autenticación requerida.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CV", charset="UTF-8"',
    },
  });
}

function unavailableResponse(): Response {
  return new Response(
    "Autenticación no configurada. El sitio no puede servirse.",
    { status: 503 },
  );
}

// Solo se valida la contraseña; el campo usuario del diálogo Basic Auth se
// ignora (el visitante puede dejarlo vacío o poner cualquier cosa).
function checkCredentials(
  authHeader: string | null,
  expectedPassword: string,
): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(authHeader.slice("Basic ".length));
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const password = decoded.slice(separatorIndex + 1);

  return constantTimeEqual(password, expectedPassword);
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (!isProtectedPath(pathname)) {
    return next();
  }

  const expectedPassword = import.meta.env.PASSWORD_SITE;

  if (!expectedPassword) {
    if (import.meta.env.DEV) {
      console.warn(
        "[auth] PASSWORD_SITE no configurada: Basic Auth deshabilitada en desarrollo.",
      );
      return next();
    }
    return unavailableResponse();
  }

  const authHeader = context.request.headers.get("authorization");
  if (!checkCredentials(authHeader, expectedPassword)) {
    return unauthorizedResponse();
  }

  return next();
});
