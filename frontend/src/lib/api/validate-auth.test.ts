import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateRegistrationFields,
} from "./validate-auth";

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("rejects missing or malformed emails", () => {
    expect(validateEmail("")).toMatch(/e-post/i);
    expect(validateEmail("not-an-email")).toMatch(/e-post/i);
    expect(validateEmail(123)).toMatch(/e-post/i);
  });

  it("rejects overly long emails", () => {
    const longLocal = "a".repeat(250);
    expect(validateEmail(`${longLocal}@example.com`)).toMatch(/e-post/i);
  });
});

describe("validatePassword", () => {
  it("accepts passwords within bounds", () => {
    expect(validatePassword("secret1")).toBeNull();
  });

  it("rejects short passwords", () => {
    expect(validatePassword("12345")).toMatch(/minst 6/i);
  });

  it("rejects overly long passwords", () => {
    expect(validatePassword("x".repeat(129))).toMatch(/högst 128/i);
  });
});

describe("validateRegistrationFields", () => {
  it("requires name and username", () => {
    expect(
      validateRegistrationFields({
        email: "user@example.com",
        password: "secret1",
      })
    ).toMatch(/namn/i);

    expect(
      validateRegistrationFields({
        name: "Test",
        email: "user@example.com",
        password: "secret1",
      })
    ).toMatch(/användarnamn/i);
  });

  it("accepts valid registration input", () => {
    expect(
      validateRegistrationFields({
        name: "Test User",
        username: "testuser",
        email: "user@example.com",
        password: "secret1",
      })
    ).toBeNull();
  });
});
