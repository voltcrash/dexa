import { describe, expect, it } from "vite-plus/test";
import { retryOriginalImage } from "./images.js";

const url = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png";

describe("retryOriginalImage", () => {
  it("retries the original when the optimizer fails and clears responsive candidates", () => {
    const image = {
      src: "https://dexa.voltcrash.com/_vercel/image?url=artwork",
      srcset: "optimized 384w",
    };
    expect(retryOriginalImage(image, url)).toBe(true);
    expect(image).toEqual({ src: url, srcset: "" });
  });

  it("stops retrying when the original also fails", () => {
    const image = { src: "/_vercel/image?url=artwork", srcset: "" };
    retryOriginalImage(image, url);
    expect(retryOriginalImage(image, url)).toBe(false);
  });

  it("does not retry an image already served directly", () => {
    const image = { src: url, srcset: "" };
    expect(retryOriginalImage(image, url)).toBe(false);
  });
});
