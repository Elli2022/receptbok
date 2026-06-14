import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("Receptbok smoke", () => {
  test("warmup: static routes load first", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Om projektet")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Receptbok");
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/e-post/i)).toBeVisible();
  });

  test("home loads browse filters and branding", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.getByRole("link", { name: "Receptbok" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: /din receptsamling/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder(/sök recept/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Frukost" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Vegetariskt" })).toBeVisible();
  });

  test("recipe library page responds", async ({ page }) => {
    await page.goto("/recept", { waitUntil: "load" });
    await expect(page.getByPlaceholder(/sök recept/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("filter combo glutenfritt + dessert shows results or empty state", async ({
    page,
  }) => {
    await page.goto("/recept", { waitUntil: "load" });
    await page.getByRole("button", { name: "Dessert" }).click();
    await page.getByRole("button", { name: "Glutenfritt" }).click();

    const emptyState = page.getByRole("heading", { name: /inga recept matchar filtren/i });
    const recipeCards = page.locator("article");
    await expect(emptyState.or(recipeCards.first())).toBeVisible({ timeout: 15_000 });
  });

  test("sparade logged-out shows login prompt", async ({ page }) => {
    await page.goto("/sparade", { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: /logga in för sparade recept/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page
        .locator("section")
        .filter({ hasText: "Logga in för sparade recept" })
        .getByRole("link", { name: "Logga in" })
    ).toBeVisible();
  });

  test("recipe detail loads from library", async ({ page }) => {
    await page.goto("/recept", { waitUntil: "load" });
    const firstRecipe = page.locator("article a").first();
    await expect(firstRecipe).toBeVisible({ timeout: 15_000 });
    await firstRecipe.click();
    await expect(page).toHaveURL(/\/recept\/[^/]+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test("unknown route shows 404 page", async ({ page }) => {
    await page.goto("/den-har-rutten-finns-inte");
    await expect(
      page.getByRole("heading", { name: /sidan hittades inte/i })
    ).toBeVisible();
  });

  test("navbar highlights the current page", async ({ page }) => {
    const nav = page.getByRole("navigation");

    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await expect(nav.getByRole("link", { name: "Om", exact: true })).toHaveClass(/bg-rose-50/);
    await expect(nav.getByRole("link", { name: "Recept", exact: true })).not.toHaveClass(
      /bg-rose-50/
    );

    await page.goto("/sparade", { waitUntil: "domcontentloaded" });
    await expect(nav.getByRole("link", { name: "Sparade", exact: true })).toHaveClass(
      /bg-rose-50/
    );

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(nav.getByRole("link", { name: "Hem", exact: true })).toHaveClass(/bg-rose-50/);
    await expect(nav.getByRole("link", { name: "Recept", exact: true })).not.toHaveClass(
      /bg-rose-50/
    );
  });

  test("navbar navigates in one click from login and recipe detail", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("navigation").getByRole("link", { name: "Recept", exact: true }).click();
    await expect(page).toHaveURL(/\/recept\/?$/);
    await expect(page.getByPlaceholder(/sök recept/i)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/about", { waitUntil: "domcontentloaded" });
    await page.getByRole("navigation").getByRole("link", { name: "Sparade", exact: true }).click();
    await expect(page).toHaveURL(/\/sparade\/?$/);
  });
});
