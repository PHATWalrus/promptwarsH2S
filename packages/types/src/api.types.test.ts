import { describe, expect, test } from "bun:test";
import { contractUploadSchema, registerSchema } from "./api.types";

describe("shared API schemas", () => {
  test("register rejects unknown fields", () => {
    expect(() =>
      registerSchema.parse({
        email: "person@example.com",
        password: "correct horse battery staple",
        name: "Person",
        role: "admin",
      }),
    ).toThrow();
  });

  test("upload metadata accepts supported contract types", () => {
    const parsed = contractUploadSchema.parse({
      contractType: "employment",
      jurisdiction: "US-CA",
      title: "Employment Agreement",
    });

    expect(parsed.contractType).toBe("employment");
  });
});
