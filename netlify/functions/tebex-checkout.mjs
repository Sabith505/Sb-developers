const json = (statusCode, body) => new Response(JSON.stringify(body), {
  status: statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
});

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 1000) }; }
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  const reqUrl = new URL(request.url);
  const token = process.env.TEBEX_PUBLIC_TOKEN || "14k2h-a978682a5488b33e5ef8e072c853d19c4b2d840a";
  const origin = process.env.URL || "https://sbdevelopers.netlify.app";

  // =========================================================================
  // STEP 2 (GET): Return from FiveM Auth -> Add package & redirect to pay.tebex.io
  // =========================================================================
  if (reqUrl.searchParams.get("step") === "complete_auth") {
    const ident = reqUrl.searchParams.get("basket");
    const pkgId = reqUrl.searchParams.get("pkg") || "7723283";

    if (ident) {
      try {
        // Basket is now authenticated with customer's FiveM account! Add package:
        await fetch(`https://headless.tebex.io/api/baskets/${encodeURIComponent(ident)}/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package_id: pkgId, quantity: 1 })
        });
      } catch (err) {
        console.error("Add package after auth failed:", err);
      }

      // Redirect straight to the official Tebex Payment Page!
      const curr = reqUrl.searchParams.get("currency") || "USD";
      return Response.redirect(`https://pay.tebex.io/${encodeURIComponent(ident)}?currency=${encodeURIComponent(curr)}`, 302);
    }
  }

  // =========================================================================
  // STEP 1 (POST): Initial Checkout -> Create Basket & return direct payment/auth URL
  // =========================================================================
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  const primaryPkgId = items[0]?.packageId || "7723283";

  try {
    // 1. Create Headless Basket
    const selectedCurrency = payload?.currency || "USD";
    const createRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${origin}/?checkout=complete`,
        cancel_url: `${origin}/?checkout=cancel`,
        complete_auto_redirect: true,
        currency: selectedCurrency
      })
    });

    const basketData = await readJson(createRes);
    const ident = basketData?.data?.ident;

    if (!ident) {
      throw new Error("Could not create Tebex basket");
    }

    // Callback URL after 1-click FiveM authentication
    const returnUrl = `${origin}/.netlify/functions/tebex-checkout?step=complete_auth&basket=${encodeURIComponent(ident)}&pkg=${encodeURIComponent(primaryPkgId)}&currency=${encodeURIComponent(selectedCurrency)}`;

    // 2. Fetch official Tebex authentication link
    const authRes = await fetch(`https://headless.tebex.io/api/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
    const authData = await readJson(authRes);

    if (Array.isArray(authData) && authData[0]?.url) {
      // Returns official Tebex link that routes directly to pay.tebex.io/{ident} after 1-click auth
      return json(200, { checkoutUrl: authData[0].url, basketIdent: ident });
    }

    // Direct pay.tebex.io fallback
    return json(200, { checkoutUrl: `https://pay.tebex.io/${encodeURIComponent(ident)}?currency=${encodeURIComponent(selectedCurrency)}`, basketIdent: ident });
  } catch (error) {
    console.error("Checkout function error:", error);
    return json(500, { error: error.message || "Failed to create checkout" });
  }
};
