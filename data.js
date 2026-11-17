/* ===== DATA CONFIGURATION — edit this file only =====
 * id        unique id (used in linksTo)
 * name/url/description  shown on result cards
 * category  searchable category
 * keywords  searchable words
 * linksTo   ids of sites THIS site links out to (directed edges)
 */
const websites = [
  { id: "site-1", name: "Pune Food Guide", url: "pune-food-guide.com", description: "Where to eat in Pune - vada pav and biryani and pizza", category: "food", keywords: ["pune", "vada pav", "biryani", "pizza"], linksTo: ["site-2"] },
  { id: "site-2", name: "Best Pizza Pune", url: "best-pizza-pune.com", description: "Fresh wood-fired pizza made daily - try our cheese pizza", category: "food", keywords: ["pizza", "cheese", "wood-fired"], linksTo: ["site-1", "site-3"] },
  { id: "site-3", name: "College Canteen Blog", url: "college-canteen-blog.com", description: "Student reviews of canteen food and chai and Friday pizza", category: "food", keywords: ["canteen", "chai", "student", "pizza"], linksTo: ["site-2", "site-4"] },
  { id: "site-4", name: "Pizza Recipes Home", url: "pizza-recipes-home.com", description: "Make pizza at home - pizza dough and pizza sauce", category: "recipes", keywords: ["pizza", "dough", "sauce", "recipe"], linksTo: ["site-2", "site-5"] },
  { id: "site-5", name: "Cheap Eats Pune", url: "cheap-eats-pune.com", description: "Good food under 100 rupees - misal and dosa and pizza slices", category: "food", keywords: ["cheap", "misal", "dosa", "pizza"], linksTo: ["site-2"] },
  { id: "site-6", name: "Pizza Pizza Pizza", url: "pizza-pizza-pizza.com", description: "pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza", category: "pizza", keywords: ["pizza"], linksTo: ["site-1"] }
];

// Site you EXPECT to rank #1 under the New Google algorithm (validated, never forced).
const expectedNewAlgorithmWinner = "site-2";

// Algorithm settings
// "keyword" = Old Google counts how often search words appear (spam-prone). "pagerank" = Old Google uses PageRank.
const config = { oldAlgorithm: "keyword", damping: 0.85, maxIterations: 100, tolerance: 1e-8 };