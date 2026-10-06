// proxy.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/share/diet" ||
    pathname.startsWith("/share/diet/") ||
    pathname === "/api/diets/shared" ||
    pathname.startsWith("/api/diets/shared/")
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /*
   * Las dietas compartidas y sus PDFs son públicas
   * intencionadamente y se protegen mediante un token
   * validado por get_shared_diet().
   *
   * No necesitamos autenticar estas rutas.
   */
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          /*
           * Actualizamos las cookies de la request para que
           * el resto del procesamiento vea la sesión renovada.
           */
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          /*
           * Recreamos la respuesta con la request actualizada.
           */
          supabaseResponse = NextResponse.next({
            request,
          });

          /*
           * Enviamos también las cookies renovadas al navegador.
           */
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * getClaims() valida criptográficamente el JWT.
   *
   * No usamos getSession() para autorización porque
   * la sesión almacenada en cookies no debe considerarse
   * confiable sin validar el token.
   */
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const isAuthenticated =
    !error &&
    typeof data?.claims?.sub === "string" &&
    data.claims.sub.length > 0;

  if (!isAuthenticated) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname = "/login";

    const redirectResponse =
      NextResponse.redirect(redirectUrl);

    /*
     * Si getClaims() ha refrescado cookies durante esta
     * petición, debemos conservarlas también en el redirect.
     */
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });

    /*
     * Conservamos cabeceras de control de caché que
     * Supabase pueda haber establecido.
     */
    for (const header of [
      "cache-control",
      "expires",
      "pragma",
    ]) {
      const value =
        supabaseResponse.headers.get(header);

      if (value) {
        redirectResponse.headers.set(
          header,
          value
        );
      }
    }

    return redirectResponse;
  }

  /*
   * Es importante devolver esta misma respuesta:
   * puede contener cookies de sesión refrescadas.
   */
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};