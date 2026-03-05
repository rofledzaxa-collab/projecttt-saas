import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "projecttt API",
      version: "1.0.0",
      description: "Event ingestion + auth endpoints"
    },
    paths: {
      "/api/auth/register": {
        post: {
          summary: "Register",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "OK" } }
        }
      },
      "/api/auth/login": {
        post: {
          summary: "Login",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "OK" } }
        }
      },
      "/api/auth/logout": { post: { summary: "Logout", responses: { "200": { description: "OK" } } } },
      "/api/auth/refresh": { post: { summary: "Refresh access token", responses: { "200": { description: "OK" } } } },
      "/api/events": {
        post: {
          summary: "Ingest event",
          description: "Requires access_token cookie",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
          responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } }
        }
      },
      "/api/private/me": { get: { summary: "Current user", responses: { "200": { description: "OK" } } } },
      "/api/private/plan": { post: { summary: "Set plan (mock billing)", responses: { "200": { description: "OK" } } } }
    }
  };
  return NextResponse.json(spec);
}
