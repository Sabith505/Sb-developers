/**
 * SB Developers - Official Storefront Product Database
 * Configured for USD currency. Easily add more products to PRODUCTS array below.
 */

const STORE_CONFIG = {
  storeName: "SB Developers",
  tagline: "Premium FiveM resources built to take your server to the next level.",
  currencySymbol: "$",
  currencyCode: "USD",
  discordUrl: "https://discord.gg/JPfmWeqMMC",
  discordClientId: "1552667254502592622",
  tebexStoreUrl: "https://sb-developer.tebex.store",
  tebexCheckoutUrl: "https://pay.tebex.io",
  tebexCheckoutFunction: "/.netlify/functions/tebex-checkout",
  supportEmail: "support@sbdevelopers.net",
  promoCodes: {
    "SBDEV10": { code: "SBDEV10", discountPercent: 10, description: "10% Off Community Launch Promo" },
    "LAUNCH": { code: "LAUNCH", discountPercent: 15, description: "15% Off Early Access Discount" }
  }
};

const PRODUCTS = [
  {
    id: "sb-tdm-system",
    name: "SB TDM - Team Deathmatch",
    category: "scripts",
    categoryName: "FiveM Script",
    price: 13.99,
    originalPrice: 15.00,
    badge: "FEATURED RELEASE",
    thumbnail: "assets/images/sb_tdm.jpg",
    // You can paste any YouTube URL (e.g., "https://www.youtube.com/watch?v=dQw4w9WgXcQ" or "https://youtu.be/..." or embed URL)
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Change this to your YouTube video link!
    shortDesc: "The ultimate competitive Team Deathmatch system for FiveM. Features 6+ preconfigured arenas, interactive weapon loadouts, team selection, live K/D leaderboards, and target integration.",
    detailedDesc: `
      <p style="margin-bottom: 1rem; color: #cbd5e1; line-height: 1.7;">
        <strong>SB TDM</strong> is an all-in-one competitive Team Deathmatch framework engineered for FiveM communities that want fast-paced, high-intensity PvP action without compromising server stability or roleplay integrity.
      </p>
      <p style="margin-bottom: 1.25rem; color: #94a3b8; line-height: 1.7;">
        Designed with high tickrate synchronization, players can seamlessly register via target interaction, pick their team, choose custom weapon loadouts, and battle across isolated arenas with instant respawn logic and post-match victory celebrations.
      </p>
    `,
    arenaList: [
      "Aviham Industrial Arena",
      "Cayo Perico Island Battleground",
      "Los Santos Docks Container Yard",
      "West Vinewood Urban Warzone",
      "Galileo Observatory Heights",
      "Underground Boxing Arena"
    ],
    features: [
      "6+ Pre-Configured Battle Arenas (Aviham, Cayo, Docks, Vinewood, Observatory, Boxing)",
      "Dynamic Team Selection (Auto-balancing, custom team names & colors)",
      "Interactive NUI Weapon Loadout Selector (Primary, Secondary, Melee & Armor)",
      "Live In-Game Leaderboard System (Kills, Deaths, K/D Ratio & Match MVP)",
      "Target Integration (Full support for ox_target & qb-target)",
      "Configurable Match Rules (Round timers, kill limits & sudden death)",
      "Seamless Framework Integration (QBCore, ESX Legacy, Qbox & Standalone)",
      "Isolated Match Routing Buckets (Zero interference with main server RP)"
    ],
    compatibility: ["QBCore", "ESX Legacy", "Qbox", "Standalone"],
    version: "v1.0.0",
    lastUpdated: "Latest Release",
    tebexPackageUrl: "https://sb-developer.tebex.store/package/7723283",
    tebexPackageId: "7723283"
  }
];

// Customer Reviews Storage (Persistent via localStorage)
const INITIAL_REVIEWS = [];
