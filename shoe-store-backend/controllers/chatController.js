const http = require("http");
const Product = require("../models/Product");

const MAX_CHAT_HISTORY = 10;
const MAX_PRODUCT_SUGGESTIONS = 4;
const OLLAMA_HOST = process.env.OLLAMA_HOST || "127.0.0.1";
const OLLAMA_PORT = Number(process.env.OLLAMA_PORT) || 11434;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function toAmount(rawNumber, rawUnit = "") {
  const numeric = Number(String(rawNumber).replace(",", "."));
  if (!Number.isFinite(numeric)) return null;

  const unit = normalizeText(rawUnit);
  if (unit.includes("trieu") || unit === "cu") return Math.round(numeric * 1000000);
  if (unit === "k" || unit.includes("nghin") || unit.includes("ngan")) return Math.round(numeric * 1000);
  return Math.round(numeric);
}

function extractBudget(text) {
  const normalized = normalizeText(text);
  const rangeMatch = normalized.match(
    /tu\s+(\d+(?:[.,]\d+)?)\s*(trieu|cu|k|nghin|ngan)?\s*(?:den|toi|-)\s*(\d+(?:[.,]\d+)?)\s*(trieu|cu|k|nghin|ngan)?/
  );
  if (rangeMatch) {
    const min = toAmount(rangeMatch[1], rangeMatch[2]);
    const max = toAmount(rangeMatch[3], rangeMatch[4] || rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
  }

  const maxMatch = normalized.match(
    /(?:duoi|nho hon|toi da|max|khong qua|<=?)\s*(\d+(?:[.,]\d+)?)\s*(trieu|cu|k|nghin|ngan)?/
  );
  if (maxMatch) {
    const max = toAmount(maxMatch[1], maxMatch[2]);
    if (Number.isFinite(max)) return { min: null, max };
  }

  const minMatch = normalized.match(
    /(?:tren|hon|>=?|tu)\s*(\d+(?:[.,]\d+)?)\s*(trieu|cu|k|nghin|ngan)?/
  );
  if (minMatch) {
    const min = toAmount(minMatch[1], minMatch[2]);
    if (Number.isFinite(min)) return { min, max: null };
  }

  const approxMatch = normalized.match(
    /(?:tam|tam khoang|khoang|gan|quanh)\s*(\d+(?:[.,]\d+)?)\s*(trieu|cu|k|nghin|ngan)?/
  );
  if (approxMatch) {
    const center = toAmount(approxMatch[1], approxMatch[2]);
    if (Number.isFinite(center)) {
      return {
        min: Math.max(0, Math.round(center * 0.8)),
        max: Math.round(center * 1.2),
      };
    }
  }

  return { min: null, max: null };
}

function inferBrand(text) {
  const normalized = normalizeText(text);
  const aliases = {
    Nike: ["nike"],
    Adidas: ["adidas"],
    Puma: ["puma"],
    Bitis: ["bitis", "biti's", "bitis hunter", "hunter"],
    Mizuno: ["mizuno"],
  };

  for (const [brand, keywords] of Object.entries(aliases)) {
    if (keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      return brand;
    }
  }

  return null;
}

function inferNeeds(text) {
  const normalized = normalizeText(text);
  const needs = [];

  const mapping = [
    {
      key: "running",
      keywords: ["chay bo", "running", "jogging", "marathon", "tap chay"],
    },
    {
      key: "football",
      keywords: ["da bong", "san co", "tf", "football", "soccer", "futsal"],
    },
    {
      key: "badminton",
      keywords: ["cau long", "badminton"],
    },
    {
      key: "gym",
      keywords: ["gym", "tap gym", "tap ta", "workout", "training", "metcon"],
    },
    {
      key: "basketball",
      keywords: ["bong ro", "basketball"],
    },
    {
      key: "casual",
      keywords: ["di hoc", "di choi", "mac hang ngay", "hang ngay", "casual", "streetwear"],
    },
  ];

  mapping.forEach((item) => {
    if (item.keywords.some((keyword) => normalized.includes(keyword))) {
      needs.push(item.key);
    }
  });

  return needs;
}

function tokenizeQuery(text) {
  return normalizeText(text)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3);
}

function matchesNeed(productText, need) {
  switch (need) {
    case "running":
      return /(chay bo|run|running|nitro|boost|galaxy|duramo|response|velocity|deviate|vomero|quest|downshifter|revolution|invincible|wave mujin)/i.test(
        productText
      );
    case "football":
      return /(da bong|san co|tf|club|academy|predator|f50|phantom|mercurial|morelia|future|ultra)/i.test(
        productText
      );
    case "badminton":
      return /(cau long|badminton|wave claw|wave fang|wave drive|wave medal|gate sky|sky blaster)/i.test(
        productText
      );
    case "gym":
      return /(gym|training|metcon|trainer|pwr hybrid|workout)/i.test(productText);
    case "basketball":
      return /(bong ro|basketball|giannis|jordan|dunk|court vision)/i.test(productText);
    case "casual":
      return /(casual|samba|court|smash|slip-on|classic|street|royale|force 1|blazer|basket)/i.test(productText);
    default:
      return false;
  }
}

function scoreProduct(product, preferences) {
  const brandText = normalizeText(product.brand || product.category || "");
  const nameText = normalizeText(product.name || "");
  const descText = normalizeText(product.description || "");
  const fullText = `${nameText} ${descText} ${brandText}`;
  let score = 0;

  if (preferences.brand) {
    if (brandText === normalizeText(preferences.brand)) score += 8;
    else score -= 4;
  }

  preferences.needs.forEach((need) => {
    if (matchesNeed(fullText, need)) score += 5;
  });

  if (Number.isFinite(preferences.budget.max)) {
    if (product.price <= preferences.budget.max) score += 4;
    else if (product.price <= preferences.budget.max * 1.15) score += 1;
    else score -= 3;
  }

  if (Number.isFinite(preferences.budget.min)) {
    if (product.price >= preferences.budget.min) score += 2;
    else score -= 1;
  }

  preferences.tokens.forEach((token) => {
    if (fullText.includes(token)) score += 1;
  });

  if (product.stock > 0) score += 1;
  return score;
}

function rankProducts(products, userMessage) {
  const preferences = {
    brand: inferBrand(userMessage),
    needs: inferNeeds(userMessage),
    budget: extractBudget(userMessage),
    tokens: tokenizeQuery(userMessage),
  };

  const ranked = products
    .map((product) => {
      const plain = product.toJSON ? product.toJSON() : product;
      return {
        ...plain,
        _score: scoreProduct(plain, preferences),
      };
    })
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return (a.price || 0) - (b.price || 0);
    });

  const matches = ranked.filter((product) => product._score > 0).slice(0, MAX_PRODUCT_SUGGESTIONS);
  return { preferences, matches: matches.length ? matches : ranked.slice(0, MAX_PRODUCT_SUGGESTIONS) };
}

function toClientProduct(product) {
  return {
    id: product.id,
    _id: product.id,
    name: product.name,
    brand: product.brand || product.category || "",
    category: product.category || product.brand || "",
    price: Number(product.price) || 0,
    description: product.description || "",
    image: product.image || "",
    stock: Number(product.stock) || 0,
  };
}

function buildFallbackReply(userMessage, preferences, products) {
  if (!products.length) {
    return "Mình chưa tìm thấy mẫu phù hợp ngay lúc này. Bạn thử nói rõ hơn về hãng, tầm giá hoặc nhu cầu như chạy bộ, đi học, đá bóng để mình lọc chính xác hơn nhé.";
  }

  const summaryParts = [];
  if (preferences.brand) summaryParts.push(`hãng ${preferences.brand}`);
  if (Number.isFinite(preferences.budget.max)) summaryParts.push(`ngân sách dưới ${formatCurrency(preferences.budget.max)}`);
  if (Number.isFinite(preferences.budget.min) && !Number.isFinite(preferences.budget.max)) {
    summaryParts.push(`ngân sách từ ${formatCurrency(preferences.budget.min)}`);
  }
  if (preferences.needs.length) {
    summaryParts.push(`nhu cầu ${preferences.needs.join(", ")}`);
  }

  const intro = summaryParts.length
    ? `Mình đã lọc theo ${summaryParts.join(", ")} và có vài mẫu khá hợp cho bạn:`
    : `Mình xem qua nhu cầu "${userMessage}" và có vài mẫu đáng cân nhắc:`;

  const lines = products.map((product) => {
    const desc = product.description ? ` - ${product.description}` : "";
    return `- ${product.name} (${product.brand}) - ${formatCurrency(product.price)}${desc}`;
  });

  return `${intro}\n${lines.join("\n")}\n\nNếu bạn muốn, mình có thể lọc tiếp theo hãng, tầm giá hoặc nhu cầu như chạy bộ, đi học, đá bóng.`;
}

function buildSystemPrompt(products, preferences) {
  const productContext = products.length
    ? products
        .map((product, index) => {
          const desc = product.description ? `; mô tả: ${product.description}` : "";
          return `${index + 1}. ${product.name}; hãng: ${product.brand}; giá: ${formatCurrency(product.price)}${desc}`;
        })
        .join("\n")
    : "Không có sản phẩm phù hợp trong dữ liệu hiện tại.";

  const preferenceSummary = [
    preferences.brand ? `Hãng ưu tiên: ${preferences.brand}` : null,
    Number.isFinite(preferences.budget.min) ? `Giá tối thiểu: ${formatCurrency(preferences.budget.min)}` : null,
    Number.isFinite(preferences.budget.max) ? `Giá tối đa: ${formatCurrency(preferences.budget.max)}` : null,
    preferences.needs.length ? `Nhu cầu: ${preferences.needs.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "Bạn là trợ lý bán giày của MyShoes, luôn trả lời bằng tiếng Việt tự nhiên, ngắn gọn và hữu ích.",
    "Chỉ ưu tiên giới thiệu sản phẩm có trong danh sách ngữ cảnh bên dưới, không bịa tên hoặc giá sản phẩm mới.",
    "Nếu chưa có mẫu khớp hoàn toàn, hãy nói rõ là gần phù hợp nhất và mời người dùng bổ sung hãng, tầm giá hoặc nhu cầu.",
    "Nếu có gợi ý, nên nhắc 2-4 sản phẩm kèm lý do ngắn gọn.",
    preferenceSummary ? `Thông tin đã suy ra từ câu hỏi:\n${preferenceSummary}` : "",
    `Danh sách sản phẩm có thể dùng để tư vấn:\n${productContext}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function postToOllama(payload) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: "/api/chat",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 8000,
      },
      (response) => {
        let raw = "";

        response.on("data", (chunk) => {
          raw += chunk;
        });

        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(new Error(`Ollama status ${response.statusCode}`));
          }

          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Ollama timeout"));
    });

    request.on("error", reject);
    request.write(JSON.stringify(payload));
    request.end();
  });
}

async function getAssistantReply(messages, preferences, products, fallbackReply) {
  const ollamaPayload = {
    model: OLLAMA_MODEL,
    stream: false,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(products, preferences),
      },
      ...messages,
    ],
    options: {
      temperature: 0.5,
    },
  };

  try {
    const response = await postToOllama(ollamaPayload);
    const content = response?.message?.content?.trim();
    if (content) {
      return { content, source: "ollama" };
    }
  } catch (error) {
    console.warn("Chat assistant fallback activated:", error.message);
  }

  return { content: fallbackReply, source: "fallback" };
}

exports.chatWithAssistant = async (req, res) => {
  try {
    const incomingMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = incomingMessages
      .filter((message) => ["user", "assistant"].includes(message?.role) && message?.content)
      .slice(-MAX_CHAT_HISTORY)
      .map((message) => ({
        role: message.role,
        content: String(message.content).slice(0, 1000),
      }));

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content?.trim();
    if (!latestUserMessage) {
      return res.status(400).json({ message: "Missing user message" });
    }

    const products = await Product.findAll();
    const { preferences, matches } = rankProducts(products, latestUserMessage);
    const suggestedProducts = matches.map(toClientProduct);
    const fallbackReply = buildFallbackReply(latestUserMessage, preferences, suggestedProducts);
    const assistantReply = await getAssistantReply(messages, preferences, suggestedProducts, fallbackReply);

    res.json({
      message: {
        role: "assistant",
        content: assistantReply.content,
      },
      products: suggestedProducts,
      source: assistantReply.source,
      filters: {
        brand: preferences.brand,
        needs: preferences.needs,
        budget: preferences.budget,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
