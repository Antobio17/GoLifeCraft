export const SEED = {
  user: {
    id: "e2e00000-0000-4000-8000-000000000001",
    email: "e2e@golifecraft.test",
    password: "GoLifeCraft123!",
    tenantId: "GLCE2E000001",
    role: "ROLE_GOD",
  },
  supermarkets: {
    mercadona: { id: "e2e10000-0000-4000-8000-000000000001", name: "E2E Mercadona" },
    lidl: { id: "e2e10000-0000-4000-8000-000000000002", name: "E2E Lidl" },
  },
  categories: {
    lacteos: { id: "e2e20000-0000-4000-8000-000000000001", name: "E2E Lácteos" },
    carnes: { id: "e2e20000-0000-4000-8000-000000000002", name: "E2E Carnes" },
    verduras: { id: "e2e20000-0000-4000-8000-000000000003", name: "E2E Verduras" },
  },
  articles: {
    yogur: { id: "e2e30000-0000-4000-8000-000000000001", name: "E2E Yogur natural" },
    pollo: { id: "e2e30000-0000-4000-8000-000000000002", name: "E2E Pechuga de pollo" },
    arroz: { id: "e2e30000-0000-4000-8000-000000000003", name: "E2E Arroz redondo" },
    brocoli: { id: "e2e30000-0000-4000-8000-000000000004", name: "E2E Brócoli" },
    aceite: { id: "e2e30000-0000-4000-8000-000000000005", name: "E2E Aceite de oliva" },
  },
  recipes: {
    polloConArroz: {
      id: "e2e40000-0000-4000-8000-000000000001",
      name: "E2E Pollo con arroz",
      servings: 4,
    },
  },
  shoppingList: {
    yogur: { id: "e2e90000-0000-4000-8000-000000000001", quantity: 2 },
    pollo: { id: "e2e90000-0000-4000-8000-000000000002", quantity: 1 },
    brocoli: { id: "e2e90000-0000-4000-8000-000000000003", quantity: 1, checked: true },
    custom: { id: "e2e90000-0000-4000-8000-000000000004", name: "E2E Papel de cocina" },
    itemCount: 4,
  },
  tickets: {
    showcase: {
      id: "e2eb0000-0000-4000-8000-000000000001",
      printedName: "E2E MERCADONA S.A.",
      total: 2.4,
      lineCount: 3,
      remembered: { id: "e2ec0000-0000-4000-8000-000000000011", rawName: "E2E YOGUR NAT. PACK" },
      catalogLinked: { id: "e2ec0000-0000-4000-8000-000000000012", rawName: "E2E ARROZ RED. 1KG" },
      pending: { id: "e2ec0000-0000-4000-8000-000000000013", rawName: "E2E BOLSA PLASTICO" },
    },
    scratch: {
      "functional-desktop": "e2eb0000-0000-4000-8000-000000000002",
      "functional-mobile": "e2eb0000-0000-4000-8000-000000000003",
    } as Record<string, string>,
    removable: {
      "functional-desktop": "e2eb0000-0000-4000-8000-000000000004",
      "functional-mobile": "e2eb0000-0000-4000-8000-000000000005",
    } as Record<string, string>,
  },
  today: "2026-01-15",
  diary: {
    yogur: { id: "e2ea0000-0000-4000-8000-000000000001", meal: "breakfast", calories: 76.25 },
    pollo: { id: "e2ea0000-0000-4000-8000-000000000002", meal: "lunch", calories: 180 },
    cafe: { id: "e2ea0000-0000-4000-8000-000000000003", meal: "snack", calories: 90 },
    entryCount: 3,
  },
  goal: { calories: 2200, protein: 165, fat: 70, carbs: 220 },
} as const;
