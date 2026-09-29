import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  type AccessHttpResult,
} from "@/lib/invoicebatch-access";

export function nextFromAccessResult(result: AccessHttpResult): NextResponse {
  const response =
    result.kind === "json"
      ? NextResponse.json(result.body, { status: result.status })
      : NextResponse.redirect(result.location);
  if (result.token) {
    response.cookies.set(ACCESS_COOKIE_NAME, result.token, accessCookieOptions());
  }
  return response;
}
