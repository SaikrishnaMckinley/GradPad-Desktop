import { NextResponse, type NextRequest } from "next/server";
import { ACTIVE_COMMUNITY_COOKIE } from "@/lib/communities/constants";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/verify-otp"];
const PUBLIC_PREFIXES = ["/auth/", "/api/auth/"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isDemoStaticUi() {
  return process.env.NEXT_PUBLIC_DEMO_STATIC_UI !== "false";
}

function hasAccessToken(request: NextRequest) {
  return Boolean(request.cookies.get("gradpad_access_token")?.value);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const authed = hasAccessToken(request);
  const demo = isDemoStaticUi();

  if (authed && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (
    !demo &&
    !authed &&
    !isAuthRoute(pathname) &&
    !isPublicRoute(pathname) &&
    pathname !== "/"
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const communityMatch = pathname.match(/^\/communities\/([^/]+)/);
  const slug = communityMatch?.[1];
  if (slug && slug !== "new" && slug !== "discover") {
    response.cookies.set(ACTIVE_COMMUNITY_COOKIE, slug, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
