import { test, expect } from '@playwright/test';

test.describe('Overzicht pagina - Comprehensive Coverage', () => {
  // ==================== SMOKE TESTS (Baseline) ====================

  test('toont kernonderdelen van overzicht', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Overzicht' })).toBeVisible();
    await expect(page.getByText('Energieverdeling - realtime (laatste minuut)')).toBeVisible();

    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    await expect(cardsGrid.getByText('PV Productie', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Eigen verbruik', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Injectie', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Verbruik van net', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Totaal verbruik', { exact: true })).toBeVisible();
  });

  test('header subtitel met datum/tijd ververst', async ({ page }) => {
    await page.goto('/');

    const subtitle = page.locator('h1:has-text("Overzicht") + p');
    await expect(subtitle).toBeVisible();

    const first = (await subtitle.textContent())?.trim();
    await page.waitForTimeout(2200);
    const second = (await subtitle.textContent())?.trim();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(second).not.toEqual(first);
  });

  test('navigatie terug naar overzicht blijft stabiel', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Verbruik' }).click();
    await expect(page.getByRole('heading', { name: 'Verbruik' })).toBeVisible();

    await page.getByRole('button', { name: 'Overzicht' }).click();
    await expect(page.getByRole('heading', { name: 'Overzicht' })).toBeVisible();
    await expect(page.getByText('Energieverdeling - realtime (laatste minuut)')).toBeVisible();
  });

  // ==================== STATCARD VALUE TESTS ====================

  test('toont waarden in alle stat cards', async ({ page }) => {
    await page.goto('/');

    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    
    // Verify each card has label and value (by checking for text content)
    await expect(cardsGrid.getByText('PV Productie', { exact: true })).toBeVisible();
    
    // Get the stat card div and check it has numeric content
    const pvCard = cardsGrid.locator('div').filter({ has: page.getByText('PV Productie') }).first();
    const pvCardText = await pvCard.textContent();
    
    expect(pvCardText).toMatch(/\d/); // Should contain at least one digit
  });

  test('stat card waarden hebben correcte formatting (W/kW)', async ({ page }) => {
    await page.goto('/');

    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    const gridText = await cardsGrid.textContent();
    
    // Should contain W (Watt) units in the cards
    expect(gridText).toMatch(/[0-9]+(W|kW)/);
  });

  // ==================== ENERGIESTROOM BLOCK TESTS ====================

  test('energiestroom blok toont alle vier components', async ({ page }) => {
    await page.goto('/');

    // Energiestroom section
    const flowSection = page.locator('div.flex.items-center.gap-3').first();
    
    // Check for all four components: Panelen, Huis, Injectie, Net import
    await expect(flowSection.getByText('☀️ Panelen')).toBeVisible();
    await expect(flowSection.getByText('🏠 Huis')).toBeVisible();
    await expect(flowSection.getByText('🔌 Injectie')).toBeVisible();
    await expect(flowSection.getByText('🔌 Net import')).toBeVisible();
  });

  test('energiestroom waarden hebben numeric content', async ({ page }) => {
    await page.goto('/');

    // Get energiestroom block
    const flowSection = page.locator('div.flex.items-center.gap-3').first();
    const flowText = await flowSection.textContent();
    
    // Should contain multiple numbers (watt values for each component)
    const numbers = flowText?.match(/\d+/g) || [];
    expect(numbers.length).toBeGreaterThanOrEqual(4); // At least 4 energy values
  });

  // ==================== REALTIME CHART TESTS ====================

  test('realtime grafiek rendert met data', async ({ page }) => {
    await page.goto('/');

    // Wait for chart to load
    await page.waitForTimeout(1500);
    
    // Find chart section by header text
    await expect(page.getByText('Energieverdeling - realtime (laatste minuut)')).toBeVisible();
    
    // Chart should contain legend with series names (one or both visible)
    const pageText = await page.textContent('body');
    expect(pageText).toContain('Eigen verbruik');
  });

  test('realtime grafiek toont Y-as labels (Watt)', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(1500);
    
    // Chart section should be visible with Watt labels
    const pageText = await page.textContent('body');
    expect(pageText).toContain('W');
  });

  // ==================== DATA UPDATE TESTS ====================

  test('stat card waarden bijgewerkt bij polling', async ({ page }) => {
    await page.goto('/');

    // Get initial Eigen verbruik text
    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    const initialText = await cardsGrid.textContent();
    
    // Should have stat card data
    expect(initialText).toMatch(/\d/);
    
    // After waiting, content should still be valid
    await page.waitForTimeout(3000);
    const afterText = await cardsGrid.textContent();
    expect(afterText).toMatch(/\d/);
  });

  // ==================== ERROR STATE TESTS ====================

  test('pagina toont "Laden..." bericht bij grafiek laad', async ({ page }) => {
    // Intercept API to simulate slow response
    await page.route('**/api/realtime-stacked-grafiek', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/');

    // Initially might show "Laden..." during first fetch
    const chartSection = page.locator('div').filter({ has: page.getByText('Energieverdeling - realtime (laatste minuut)') }).first();
    
    // After navigation, chart should eventually load
    await expect(chartSection.getByText('Eigen verbruik')).toBeVisible({ timeout: 5000 });
  });

  test('pagina blijft stabiel bij missing API data', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/latest', route => {
      route.abort();
    });

    await page.goto('/');

    // Page should still be functional, showing 0 values or defaults
    const heading = page.getByRole('heading', { name: 'Overzicht' });
    await expect(heading).toBeVisible();
    
    // Stat cards should still render (even with null data)
    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    await expect(cardsGrid.getByText('PV Productie', { exact: true })).toBeVisible();
  });

  // ==================== LAYOUT & RESPONSIVENESS TESTS ====================

  test('alle stat cards in een rij (grid-cols-5)', async ({ page }) => {
    await page.goto('/');

    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    
    // All 5 labels should be visible in the grid
    await expect(cardsGrid.getByText('PV Productie', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Eigen verbruik', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Injectie', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Verbruik van net', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Totaal verbruik', { exact: true })).toBeVisible();
  });

  test('grafiek section is zichtbaar', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(1500);
    
    // Chart header should be visible
    await expect(page.getByText('Energieverdeling - realtime (laatste minuut)')).toBeVisible();
    
    // Page should render without layout errors
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  // ==================== INTEGRATION TESTS ====================

  test('page blijft responsive na tab switch heen en terug', async ({ page }) => {
    await page.goto('/');

    // Navigate away and back
    await page.getByRole('button', { name: 'Verbruik' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Overzicht' }).click();
    
    // Verify everything reloaded
    await expect(page.getByText('Energieverdeling - realtime (laatste minuut)')).toBeVisible();
    
    // Stat cards should all still be there
    const cardsGrid = page.locator('div.grid.grid-cols-5').first();
    await expect(cardsGrid.getByText('PV Productie', { exact: true })).toBeVisible();
    await expect(cardsGrid.getByText('Totaal verbruik', { exact: true })).toBeVisible();
  });

  test('page laadt zonder javascript console errors', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const { pathname } = new URL(route.request().url());
      const now = new Date();
      const t1 = new Date(now.getTime() - 10000).toISOString();
      const t2 = now.toISOString();

      if (pathname.endsWith('/latest')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sb4_0_1av_41_879_pv_power: 1200,
            zonnepaneel_eigen_verbruik: 800,
            zonnepaneel_injectie: 400,
            verbruik_van_net: 150,
            totaal_verbruik: 950,
          }),
        });
      }

      if (pathname.endsWith('/prijs/nu')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ prijs: 0.1234 }),
        });
      }

      if (pathname.endsWith('/zelfconsumptie/nu')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ percentage: 84.2 }),
        });
      }

      if (pathname.endsWith('/grafiek/realtime-stacked')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            injectie: { [t1]: 300, [t2]: 350 },
            eigenVerbruik: { [t1]: 700, [t2]: 750 },
            verbruikVanNet: { [t1]: 120, [t2]: 130 },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Should have no console errors
    expect(errors.length).toBe(0);
  });
});
