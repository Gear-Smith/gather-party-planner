import { describe, expect, it } from "vitest";

import { loader, meta } from "./home";

describe("home route", () => {
  it("returns the expected metadata", () => {
    expect(meta({} as never)).toEqual([
      { title: "New React Router App" },
      { name: "description", content: "Welcome to React Router!" },
    ]);
  });

  it("returns cloudflare env message from loader context", () => {
    const result = loader({
      context: {
        cloudflare: {
          env: { VALUE_FROM_CLOUDFLARE: "x" },
        },
      },
    } as never);

    expect(result).toEqual({ message: "x" });
  });
});
