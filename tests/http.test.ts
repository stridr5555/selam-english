import { describe, expect, it, vi } from "vitest";
import { allowTrustedOrigin, finishPreflight } from "../api/_http";

function responseMock() {
  const response = {
    headers: new Map<string, string>(),
    statusCode: 200,
    body: undefined as unknown,
    setHeader: vi.fn((key: string, value: string) => response.headers.set(key, value)),
    status: vi.fn((code: number) => {
      response.statusCode = code;
      return response;
    }),
    json: vi.fn((value: unknown) => {
      response.body = value;
      return response;
    }),
    end: vi.fn(() => response)
  };
  return response;
}

describe("API origin handling", () => {
  it("allows the production origin", () => {
    const response = responseMock();
    const request = { headers: { origin: "https://selam.example", host: "selam.example" } };
    expect(allowTrustedOrigin(request as never, response as never)).toBe(true);
  });

  it("allows Capacitor and adds CORS headers", () => {
    const response = responseMock();
    const request = { headers: { origin: "capacitor://localhost", host: "selam.example" } };
    expect(allowTrustedOrigin(request as never, response as never)).toBe(true);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("capacitor://localhost");
  });

  it("rejects an unrelated browser origin", () => {
    const response = responseMock();
    const request = { headers: { origin: "https://attacker.example", host: "selam.example" } };
    expect(allowTrustedOrigin(request as never, response as never)).toBe(false);
    expect(response.statusCode).toBe(403);
  });

  it("finishes a native preflight request", () => {
    const response = responseMock();
    expect(finishPreflight({ method: "OPTIONS" } as never, response as never)).toBe(true);
    expect(response.statusCode).toBe(204);
    expect(response.end).toHaveBeenCalledOnce();
  });
});
