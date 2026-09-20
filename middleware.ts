import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback", // Google OAuth callback - phai cho qua truoc khi luu token
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const {pathname} = request.nextUrl;

  if (!token && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
