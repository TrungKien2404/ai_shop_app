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

  // Base score cho sản phẩm có hàng
  if (product.stock > 0) score += 1;

  // Chỉ áp dụng brand penalty nếu có chỉ định brand
  if (preferences.brand) {
    if (brandText === normalizeText(preferences.brand)) score += 8;
    else score -= 2; // Giảm penalty từ -4 thành -2
  }

  // Nhu cầu (needs)
  preferences.needs.forEach((need) => {
    if (matchesNeed(fullText, need)) score += 5;
  });

  // Budget - chỉ penalize nếu vượt quá nhiều
  if (Number.isFinite(preferences.budget.max)) {
    if (product.price <= preferences.budget.max) score += 4;
    else if (product.price <= preferences.budget.max * 1.2) score += 1;
    else score -= 1; // Giảm penalty từ -3 thành -1
  }

  if (Number.isFinite(preferences.budget.min)) {
    if (product.price >= preferences.budget.min) score += 2;
    else score -= 1;
  }

  // Token matching - nếu có token, tìm match
  if (preferences.tokens.length > 0) {
    preferences.tokens.forEach((token) => {
      if (fullText.includes(token)) score += 1;
    });
  } else {
    // Nếu không có token cụ thể, cho điểm cơ bản
    score += 2;
  }

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

  // Lấy sản phẩm có điểm > 0, nếu không có thì lấy tất cả sắp xếp theo giá
  let matches = ranked.filter((product) => product._score > 0);
  
  // Nếu không có sản phẩm nào match, lấy những sản phẩm có stock
  if (!matches.length) {
    matches = ranked.filter((product) => product.stock > 0);
  }
  
  // Nếu vẫn không có, lấy tất cả
  if (!matches.length) {
    matches = ranked;
  }
  
  return { preferences, matches: matches.slice(0, MAX_PRODUCT_SUGGESTIONS) };
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
  if (Number.isFinite(preferences.budget.max)) {
    if (Number.isFinite(preferences.budget.min)) {
      summaryParts.push(`ngân sách từ ${formatCurrency(preferences.budget.min)} đến ${formatCurrency(preferences.budget.max)}`);
    } else {
      summaryParts.push(`ngân sách dưới ${formatCurrency(preferences.budget.max)}`);
    }
  } else if (Number.isFinite(preferences.budget.min)) {
    summaryParts.push(`ngân sách từ ${formatCurrency(preferences.budget.min)}`);
  }
  if (preferences.needs.length) {
    summaryParts.push(`nhu cầu ${preferences.needs.join(", ")}`);
  }

  const intro = summaryParts.length
    ? `Dựa vào nhu cầu của bạn (${summaryParts.join(", ")}), mình gợi ý những mẫu này:`
    : `Mình có gợi ý một số mẫu giày hot cho bạn:`;

  const lines = products.map((product) => {
    const desc = product.description ? ` - ${product.description}` : "";
    return `- ${product.name} (${product.brand}) - ${formatCurrency(product.price)}${desc}`;
  });

  return `${intro}\n${lines.join("\n")}\n\nBạn có thích mẫu nào không? Mình có thể tư vấn thêm hoặc giúp bạn đặt hàng!`;
}

function isNewShoeQuery(userMessage) {
  const normalized = normalizeText(userMessage);
  const newShoeKeywords = [
    "giay moi",
    "san pham moi",
    "co gi moi",
    "moi ra",
    "moi nhat",
    "latest",
    "new",
    "tuyen chon",
    "go y",
    "tu van",
    "chon ho",
    "nen mua",
    "hay nhat",
    "tot nhat",
    "pho bien",
    "tren tren",
    "hien tại",
    "bây giờ",
    "dang hot",
  ];

  return newShoeKeywords.some((keyword) => normalized.includes(keyword));
}

function classifyUserQuery(userMessage) {
  const normalized = normalizeText(userMessage);
  
  // Từ khóa liên quan đến giày/sản phẩm
  const shoeKeywords = [
    "giay",
    "shoe",
    "nike",
    "adidas",
    "puma",
    "bitis",
    "mizuno",
    "chay bo",
    "running",
    "jogging",
    "da bong",
    "football",
    "soccer",
    "cau long",
    "badminton",
    "gym",
    "workout",
    "basketball",
    "bong ro",
    "casual",
    "sport",
    "sneaker",
    "boot",
    "sandal",
    "size",
    "kich thuoc",
    "gia",
    "price",
    "co",
    "stock",
    "mua",
    "buy",
    "order",
    "dat hang",
    "delivery",
    "ship",
    "giao hang",
    "san pham",
    "product",
    "moi",
    "nhat",
    "hay nhat",
    "tot nhat",
    "go y",
    "de xuat",
    "tuyen chon",
    "chon",
    "hoai nhiem",
  ];

  // Kiểm tra xem có từ khóa giày không
  const isShoeRelated = shoeKeywords.some((keyword) => normalized.includes(keyword));
  
  // Nếu liên quan đến giày → shoe_inquiry
  if (isShoeRelated) {
    return "shoe_inquiry";
  }
  
  // Nếu không → general_conversation
  return "general_conversation";
}

function buildSystemPrompt(products, preferences, userMessage) {
  const queryType = classifyUserQuery(userMessage);
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

  if (queryType === "shoe_inquiry") {
    // Chế độ TƯ VẤN GIÀY - hướng đến giới thiệu sản phẩm
    return [
      "Bạn là nhân viên tư vấn giày chuyên nghiệp của MyShoes. Khách hàng đang tìm kiếm sản phẩm.",
      "⚠️ LƯU Ý QUAN TRỌNG: PHẢI giới thiệu sản phẩm CÓ TRONG DANH SÁCH DỰA đây. TUYỆT ĐỐI KHÔNG được bịa tên sản phẩm, giá, hoặc hãng không có trong danh sách.",
      "CÁCH TRẢ LỜI:",
      "1. Chào hỏi tự nhiên và thân thiện",
      "2. Giới thiệu 2-4 sản phẩm THỰC từ danh sách phù hợp nhất với nhu cầu khách hàng",
      "3. Nêu rõ: Tên sản phẩm, Hãng, Giá (theo đúng dữ liệu)",
      "4. Mô tả ngắn gọn tại sao phù hợp",
      "5. Mời khách hàng hỏi thêm hoặc xem sản phẩm",
      "Luôn trả lời bằng tiếng Việt tự nhiên, không quá dài dòng.",
      preferenceSummary ? `Nhu cầu khách hàng:\n${preferenceSummary}` : "",
      `DANH SÁCH SẢN PHẨM THỰC (phải sử dụng từ danh sách này):\n${productContext}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  } else {
    // Chế độ BÌNH THƯỜNG - trò chuyện thường, không tư vấn sản phẩm
    return [
      "Bạn là nhân viên bán hàng thân thiện của cửa hàng giày MyShoes.",
      "Khách hàng đang hỏi một câu hỏi về những thứ không liên quan đến giày hoặc không cần tư vấn sản phẩm.",
      "CÁCH TRẢ LỜI:",
      "1. Trả lời tự nhiên, thân thiện và hữu ích",
      "2. Không cần giới thiệu sản phẩm (trừ khi khách hàng nhắc tới)",
      "3. Nếu câu hỏi liên quan đến giày ngành hàng, bạn có thể nhắc rằng điều đó liên quan đến sản phẩm của MyShoes",
      "4. Luôn trả lời bằng tiếng Việt tự nhiên",
      "Hãy tạo cảm giác thân cận và sẵn sàng giúp đỡ.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }
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

async function getAssistantReply(messages, preferences, products, fallbackReply, userMessage) {
  const ollamaPayload = {
    model: OLLAMA_MODEL,
    stream: false,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(products, preferences, userMessage),
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

    // Kiểm tra loại câu hỏi: giày hay trò chuyện thường
    const queryType = classifyUserQuery(latestUserMessage);
    console.log(`[CHAT] User message: "${latestUserMessage}"`);
    console.log(`[CHAT] Query type: ${queryType}`);

    const products = await Product.findAll();
    console.log(`[CHAT] Total products in DB: ${products.length}`);
    
    const { preferences, matches } = rankProducts(products, latestUserMessage);
    console.log(`[CHAT] Matched products: ${matches.length}`);
    
    // Chỉ đưa sản phẩm nếu là hỏi giày
    const suggestedProducts = queryType === "shoe_inquiry" ? matches.map(toClientProduct) : [];
    console.log(`[CHAT] Suggested products count: ${suggestedProducts.length}`);
    
    const fallbackReply = buildFallbackReply(latestUserMessage, preferences, matches.map(toClientProduct));
    const assistantReply = await getAssistantReply(messages, preferences, suggestedProducts, fallbackReply, latestUserMessage);

    res.json({
      message: {
        role: "assistant",
        content: assistantReply.content,
      },
      products: suggestedProducts,
      source: assistantReply.source,
      filters: queryType === "shoe_inquiry" ? {
        brand: preferences.brand,
        needs: preferences.needs,
        budget: preferences.budget,
      } : null,
      queryType: queryType,
    });
  } catch (error) {
    console.error("[CHAT] Error:", error);
    res.status(500).json({ message: error.message });
  }
};
