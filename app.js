(function () {
  "use strict";

  const sourceCatalog = window.OFFLINE_CATALOG || { groups: [] };
  const STORAGE_KEY = "print-calculator-github-client-v1";
  const SETTINGS_KEY = "print-calculator-github-pricing-v1";
  const GITHUB_PRICING_API = "https://api.github.com/repos/zhb5621949/bjb/contents/data/pricing.json";
  const hadSavedState = Boolean(localStorage.getItem(STORAGE_KEY));
  let deferredInstallPrompt = null;
  let adminToken = "";
  let adminDraft = null;
  let adminStatus = "";
  let adminBusy = false;

  const productCategories = [
    { id: "cookbook", name: "菜谱", description: "装订菜谱、画册与内页" },
    { id: "menu", name: "菜单", description: "门店菜单、灯片与卡片" },
    { id: "other", name: "其他", description: "广告物料与印刷品" },
  ];

  const legacyProducts = [
    { id: "ring-bound-cookbook", category: "cookbook", name: "铁环装菜谱本", rate: 58, minimum: 50, tone: "ink" },
    { id: "staple-bound-cookbook", category: "cookbook", name: "钉装菜谱本", rate: 48, minimum: 50, tone: "steel" },
    { id: "butterfly-cookbook", category: "cookbook", name: "蝴蝶装菜谱本", rate: 68, minimum: 50, tone: "violet" },
    { id: "spiral-cookbook", category: "cookbook", name: "线圈菜谱本", rate: 55, minimum: 50, tone: "blue" },
    { id: "laminated-cookbook", category: "cookbook", name: "过塑菜谱本", rate: 50, minimum: 40, tone: "cyan" },
    { id: "coated-paper-inner-menu", category: "cookbook", name: "铜版纸内页菜单", rate: 38, minimum: 40, tone: "sand" },
    { id: "cookbook-cover", category: "cookbook", name: "菜谱外壳", rate: 65, minimum: 50, tone: "gold" },
    { id: "saddle-stitched-album", category: "cookbook", name: "骑马钉画册", rate: 42, minimum: 50, tone: "coral" },
    { id: "perfect-bound-album", category: "cookbook", name: "胶装画册", rate: 48, minimum: 50, tone: "canvas" },

    { id: "laminated-menu", category: "menu", name: "塑封菜单", rate: 45, minimum: 40, tone: "mint" },
    { id: "pvc-menu", category: "menu", name: "PVC菜单", rate: 68, minimum: 50, tone: "ice" },
    { id: "photo-menu", category: "menu", name: "写真菜单", rate: 38, minimum: 40, tone: "rose" },
    { id: "tri-fold-menu", category: "menu", name: "三折页菜单", rate: 36, minimum: 40, tone: "sun" },
    { id: "checklist-menu", category: "menu", name: "勾选菜单", rate: 35, minimum: 40, tone: "lime" },
    { id: "banner-menu", category: "menu", name: "喷绘布菜单", rate: 35, minimum: 40, tone: "red" },
    { id: "indoor-light-film-menu", category: "menu", name: "室内灯片菜单", rate: 45, minimum: 50, tone: "amber" },
    { id: "takeaway-card", category: "menu", name: "外卖卡", rate: 32, minimum: 40, tone: "coral" },
    { id: "voucher", category: "menu", name: "代金券", rate: 32, minimum: 40, tone: "violet" },
    { id: "kt-board-menu", category: "menu", name: "KT板菜单", rate: 55, minimum: 50, tone: "pearl" },
    { id: "photo-paper-menu", category: "menu", name: "相纸菜单", rate: 38, minimum: 40, tone: "blue" },
    { id: "table-sign-menu", category: "menu", name: "台签菜单", rate: 55, minimum: 50, tone: "gold" },

    { id: "business-card", category: "other", name: "名片", rate: 35, minimum: 40, tone: "ink" },
    { id: "flyer", category: "other", name: "宣传单", rate: 32, minimum: 40, tone: "sand" },
    { id: "kt-board-poster", category: "other", name: "KT板海报", rate: 55, minimum: 50, tone: "pearl" },
    { id: "backlit-fabric", category: "other", name: "卡布灯箱布", rate: 58, minimum: 50, tone: "canvas2" },
    { id: "stretch-lightbox-fabric", category: "other", name: "拉布灯箱布", rate: 58, minimum: 50, tone: "canvas" },
    { id: "canvas", category: "other", name: "油画布", rate: 55, minimum: 50, tone: "oil" },
    { id: "sticker", category: "other", name: "不干胶", rate: 42, minimum: 40, tone: "cyan" },
    { id: "photo-poster", category: "other", name: "写真海报", rate: 36, minimum: 40, tone: "rose" },
    { id: "banner", category: "other", name: "喷绘布", rate: 35, minimum: 40, tone: "red" },
    { id: "indoor-light-film", category: "other", name: "室内灯片", rate: 45, minimum: 50, tone: "sun" },
    { id: "glass-sticker", category: "other", name: "玻璃贴", rate: 35, minimum: 40, tone: "mint" },
    { id: "one-way-vision", category: "other", name: "单透贴", rate: 48, minimum: 50, tone: "smoke" },
    { id: "transparent-sticker", category: "other", name: "透明贴", rate: 45, minimum: 40, tone: "mint" },
    { id: "car-sticker", category: "other", name: "车贴", rate: 46, minimum: 50, tone: "blue" },
    { id: "glass-lettering", category: "other", name: "玻璃刻字", rate: 50, minimum: 50, tone: "silver" },
    { id: "copy-paper-print", category: "other", name: "打印纸打印", rate: 25, minimum: 40, tone: "ice" },
  ];

  const defaultProducts = Array.isArray(window.PRODUCT_CATALOG) && window.PRODUCT_CATALOG.length
    ? window.PRODUCT_CATALOG
    : legacyProducts;

  const processGroups = [
    {
      id: "print",
      name: "印色",
      type: "single",
      items: [
        { id: "four-color", name: "四色喷印", unit: "sqm", fee: 0, checked: true },
        { id: "eight-color", name: "八色喷印", unit: "sqm", fee: 8 },
        { id: "epson", name: "爱普生喷印", unit: "sqm", fee: 12 },
        { id: "uv-print", name: "UV喷印", unit: "sqm", fee: 20 },
      ],
    },
    {
      id: "lamination",
      name: "覆膜工艺",
      type: "multiple",
      items: [
        { id: "glossy", name: "覆亮膜", unit: "sqm", fee: 6 },
        { id: "matte", name: "覆哑膜", unit: "sqm", fee: 7 },
        { id: "floor-matte", name: "覆磨砂地板膜", unit: "sqm", fee: 12 },
        { id: "floor-diagonal", name: "覆斜纹地板膜", unit: "sqm", fee: 13 },
        { id: "cross", name: "十字膜", unit: "sqm", fee: 10 },
        { id: "sparkle", name: "闪点膜", unit: "sqm", fee: 12 },
        { id: "crystal", name: "亮面水晶膜", unit: "sqm", fee: 15 },
        { id: "skin", name: "肤感水晶膜", unit: "sqm", fee: 18 },
        { id: "erasable", name: "可擦写膜", unit: "sqm", fee: 18 },
      ],
    },
    {
      id: "cut",
      name: "裁切工艺",
      type: "single",
      items: [
        { id: "cut-normal", name: "裁切", unit: "piece", fee: 0, checked: true },
        { id: "cut-shape", name: "异形裁切", unit: "piece", fee: 3 },
        { id: "no-cut", name: "不裁切", unit: "piece", fee: 0 },
        { id: "half-cut", name: "切半透", unit: "piece", fee: 1.5 },
      ],
    },
    {
      id: "other",
      name: "其它工艺",
      type: "multiple",
      items: [
        { id: "eyelets", name: "四角打扣", unit: "piece", fee: 2 },
        { id: "rounded", name: "圆角", unit: "piece", fee: 1 },
        { id: "pack", name: "单张包装", unit: "piece", fee: 1 },
      ],
    },
    {
      id: "sample",
      name: "参样工艺",
      type: "multiple",
      items: [
        { id: "follow-sample", name: "翻单跟样", unit: "style", fee: 5 },
        { id: "keep-sample", name: "需车间留样", unit: "style", fee: 3 },
      ],
    },
  ];

  const app = document.getElementById("app");
  let settings = loadSettings();
  let state = loadState();
  let syncInfo = {
    status: "connecting",
    version: settings.version || 0,
    updatedAt: settings.updatedAt || "",
  };
  let latestResult = null;
  let toastTimer = null;

  function optionStateFor(selectedProduct) {
    return Object.fromEntries(
      (selectedProduct.optionGroups || []).map((group) => [
        group.id,
        group.type === "single" && group.items[0]
          ? [group.items[0].id]
          : group.items.filter((item) => item.checked).map((item) => item.id),
      ]),
    );
  }

  function normalizeOptionState(selectedProduct, savedOptions) {
    const defaults = optionStateFor(selectedProduct);
    if (!savedOptions) return defaults;
    return Object.fromEntries(
      (selectedProduct.optionGroups || []).map((group) => {
        const validIds = new Set(group.items.map((item) => item.id));
        const savedIds = Array.isArray(savedOptions[group.id]) ? savedOptions[group.id].filter((id) => validIds.has(id)) : [];
        return [group.id, group.type === "single" ? (savedIds.length ? [savedIds[0]] : defaults[group.id]) : (savedIds.length ? savedIds : defaults[group.id])];
      }),
    );
  }

  function freshState() {
    const firstSpec = defaultProducts[0].specs?.[0];
    return {
      tab: "calculator",
      categoryId: productCategories[0].id,
      productId: defaultProducts[0].id,
      specId: firstSpec?.id || "",
      length: firstSpec?.length ? String(firstSpec.length) : "",
      width: firstSpec?.width ? String(firstSpec.width) : "",
      innerPages: "",
      quantity: "1",
      styles: "1",
      styleFee: "10",
      minimumMode: "material",
      customMinimum: "40",
      productOptions: optionStateFor(defaultProducts[0]),
      referenceQuery: "",
      resultVisible: false,
      settingsOpen: false,
      toast: "",
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const savedProductId = saved.productId || saved.materialId;
      const selectedProduct = defaultProducts.find((item) => item.id === savedProductId) || defaultProducts[0];
      const savedSpec = selectedProduct.specs?.find((item) => item.id === saved.specId);
      const selectedSpec = savedSpec || selectedProduct.specs?.[0];
      return {
        ...freshState(),
        ...saved,
        productId: selectedProduct.id,
        categoryId: selectedProduct.category,
        specId: selectedSpec?.id || "",
        length: savedSpec ? (saved.length || (selectedSpec?.length ? String(selectedSpec.length) : "")) : (selectedSpec?.length ? String(selectedSpec.length) : ""),
        width: savedSpec ? (saved.width || (selectedSpec?.width ? String(selectedSpec.width) : "")) : (selectedSpec?.width ? String(selectedSpec.width) : ""),
        productOptions: normalizeOptionState(selectedProduct, saved.productOptions),
      };
    } catch {
      return freshState();
    }
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      const savedMap = Object.fromEntries((saved.products || saved.materials || []).map((item) => [item.id, item]));
      const defaultProcessFees = Object.fromEntries(
        processGroups.flatMap((group) => group.items.map((item) => [item.id, item.fee])),
      );
      return {
        products: defaultProducts.map((item) => {
          const savedItem = savedMap[item.id] || {};
          return {
            ...item,
            ...savedItem,
            pricingMode: item.pricingMode,
            priceFactor: Math.max(0, num(savedItem.priceFactor, item.priceFactor ?? 100)),
          };
        }),
        processFees: { ...defaultProcessFees, ...(saved.processFees || {}) },
        optionFees: { ...(saved.optionFees || {}) },
        version: saved.version || 0,
        updatedAt: saved.updatedAt || "",
        styleFeeDefault: saved.styleFeeDefault ?? 10,
      };
    } catch {
      return {
        products: defaultProducts.map((item) => ({ ...item })),
        processFees: Object.fromEntries(
          processGroups.flatMap((group) => group.items.map((item) => [item.id, item.fee])),
        ),
        optionFees: {},
        version: 0,
        updatedAt: "",
        styleFeeDefault: 10,
      };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, settingsOpen: false, toast: "" }));
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function createAdminDraft() {
    return {
      products: settings.products.map((item) => ({
        id: item.id,
        rate: num(item.rate),
        minimum: num(item.minimum, 40),
        priceFactor: Math.max(0, num(item.priceFactor, 100)),
        bookPricing: item.bookPricing ? JSON.parse(JSON.stringify(item.bookPricing)) : undefined,
      })),
      styleFeeDefault: num(settings.styleFeeDefault, 10),
    };
  }

  function utf8ToBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function base64ToUtf8(value) {
    const binary = atob(String(value || "").replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  async function publishAdminPricing() {
    const token = adminToken.trim();
    if (!token) {
      adminStatus = "请先填写老板的 GitHub 授权令牌";
      render();
      return;
    }
    if (!adminDraft) return;

    adminBusy = true;
    adminStatus = "正在读取线上价格…";
    render();
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
    try {
      const currentResponse = await fetch(`${GITHUB_PRICING_API}?ref=main&t=${Date.now()}`, { headers, cache: "no-store" });
      if (!currentResponse.ok) throw new Error(currentResponse.status === 401 || currentResponse.status === 403 ? "授权失败，请检查令牌是否有本仓库 Contents 读写权限" : "无法读取 GitHub 价格文件");
      const currentFile = await currentResponse.json();
      const remote = JSON.parse(base64ToUtf8(currentFile.content));
      const draftMap = Object.fromEntries(adminDraft.products.map((item) => [item.id, item]));
      const nextVersion = Math.max(num(remote.version), num(settings.version)) + 1;
      const nextPricing = {
        ...remote,
        version: nextVersion,
        updatedAt: new Date().toISOString(),
        note: "老板通过内置管理端更新价格",
        styleFeeDefault: Math.max(0, num(adminDraft.styleFeeDefault)),
        products: (remote.products || []).map((item) => ({
          ...item,
          rate: Math.max(0, num(draftMap[item.id]?.rate, item.rate)),
          minimum: Math.max(0, num(draftMap[item.id]?.minimum, item.minimum)),
          priceFactor: Math.max(0, num(draftMap[item.id]?.priceFactor, item.priceFactor ?? 100)),
          ...(draftMap[item.id]?.bookPricing ? { bookPricing: draftMap[item.id].bookPricing } : {}),
        })),
      };
      adminStatus = "正在发布到客服端…";
      render();
      const updateResponse = await fetch(GITHUB_PRICING_API, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `老板管理端更新价格 V${nextVersion}`,
          content: utf8ToBase64(`${JSON.stringify(nextPricing, null, 2)}\n`),
          sha: currentFile.sha,
          branch: "main",
        }),
      });
      if (!updateResponse.ok) throw new Error(updateResponse.status === 401 || updateResponse.status === 403 ? "发布失败，请检查令牌的仓库写入权限" : "GitHub 发布失败，请稍后重试");

      const nextMap = Object.fromEntries(nextPricing.products.map((item) => [item.id, item]));
      settings = {
        ...settings,
        products: settings.products.map((item) => ({
          ...item,
          ...(nextMap[item.id] || {}),
          pricingMode: defaultProducts.find((entry) => entry.id === item.id)?.pricingMode || item.pricingMode,
        })),
        version: nextPricing.version,
        updatedAt: nextPricing.updatedAt,
        styleFeeDefault: nextPricing.styleFeeDefault,
      };
      syncInfo = { status: "online", version: nextPricing.version, updatedAt: nextPricing.updatedAt };
      saveSettings();
      adminToken = "";
      adminDraft = createAdminDraft();
      adminStatus = `发布成功：价格 V${nextVersion}，客服端通常在 1 分钟内自动更新`;
    } catch (error) {
      adminStatus = error?.message || "发布失败，请稍后重试";
    } finally {
      adminBusy = false;
      render();
    }
  }

  function pricingFingerprint(value) {
    return JSON.stringify({
      products: value.products || [],
      optionFees: value.optionFees || {},
      styleFeeDefault: value.styleFeeDefault ?? 10,
    });
  }

  async function syncPricing(silent = false) {
    const previousVersion = settings.version || 0;
    const previousFingerprint = pricingFingerprint(settings);
    syncInfo.status = "connecting";
    if (!silent) render();
    try {
      const response = await fetch(`data/pricing.json?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("sync failed");
      const remote = await response.json();
      const remoteMap = Object.fromEntries((remote.products || remote.materials || []).map((item) => [item.id, item]));
      settings = {
        products: defaultProducts.map((item) => {
          const remoteItem = remoteMap[item.id] || {};
          return {
            ...item,
            ...remoteItem,
            pricingMode: item.pricingMode,
            priceFactor: Math.max(0, num(remoteItem.priceFactor, item.priceFactor ?? 100)),
          };
        }),
        processFees: {
          ...Object.fromEntries(
            processGroups.flatMap((group) => group.items.map((item) => [item.id, item.fee])),
          ),
          ...(remote.processFees || {}),
        },
        optionFees: { ...(remote.optionFees || {}) },
        version: remote.version || 1,
        updatedAt: remote.updatedAt || "",
        styleFeeDefault: remote.styleFeeDefault ?? 10,
      };
      if (!hadSavedState && !state.resultVisible) {
        state.styleFee = String(settings.styleFeeDefault);
      }
      saveSettings();
      syncInfo = {
        status: "online",
        version: settings.version,
        updatedAt: settings.updatedAt,
      };
      render();
      if (previousVersion && pricingFingerprint(settings) !== previousFingerprint) {
        notify(`价格已自动更新到 V${settings.version}`);
      }
    } catch {
      syncInfo = {
        status: "offline",
        version: settings.version || 0,
        updatedAt: settings.updatedAt || "",
      };
      render();
      if (!silent) notify("暂时无法连接 GitHub，正在使用上次价格");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function attr(value) {
    return escapeHtml(value).replaceAll("\n", "&#10;");
  }

  function num(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function money(value) {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function product() {
    return settings.products.find((item) => item.id === state.productId) || settings.products[0];
  }

  function currentSpec() {
    return product().specs?.find((item) => item.id === state.specId) || null;
  }

  function selectProduct(productId) {
    const selectedProduct = settings.products.find((item) => item.id === productId) || settings.products[0];
    const firstSpec = selectedProduct.specs?.[0];
    state.productId = selectedProduct.id;
    state.categoryId = selectedProduct.category;
    state.specId = firstSpec?.id || "";
    state.length = firstSpec?.length ? String(firstSpec.length) : "";
    state.width = firstSpec?.width ? String(firstSpec.width) : "";
    state.innerPages = "";
    state.productOptions = optionStateFor(selectedProduct);
    state.resultVisible = false;
  }

  function selectedProductOptions() {
    return (product().optionGroups || []).flatMap((group) =>
      group.items
        .filter((item) => (state.productOptions[group.id] || []).includes(item.id))
        .map((item) => ({ ...item, groupId: group.id, groupName: group.name, fee: settings.optionFees[item.id] ?? item.fee ?? 0 })),
    );
  }

  function bookTierUnitPrice(currentProduct, specId, quantity) {
    const tiers = currentProduct.bookPricing?.specs?.[specId];
    if (!tiers) return null;
    if (quantity === 1) return num(tiers.one);
    if (quantity === 2) return num(tiers.two);
    if (quantity <= 4) return num(tiers.threeToFour);
    return num(tiers.fivePlus);
  }

  function calculate() {
    const length = Math.max(0, num(state.length));
    const width = Math.max(0, num(state.width));
    const quantity = Math.max(1, Math.floor(num(state.quantity, 1)));
    const styles = Math.max(1, Math.floor(num(state.styles, 1)));
    const innerPages = product().category === "cookbook" ? Math.max(0, Math.floor(num(state.innerPages))) : 0;
    if (!length || !width || (product().category === "cookbook" && !innerPages)) return null;

    const currentProduct = product();
    const areaEach = length * width;
    const pageMultiplier = currentProduct.multiplyByInnerPages ? innerPages : 1;
    const totalArea = areaEach * quantity * pageMultiplier;
    const selectedOptions = selectedProductOptions();
    const sourcePricing = window.ORIGINAL_PRICE_ENGINE?.supports(currentProduct.id)
      ? window.ORIGINAL_PRICE_ENGINE.calculate({
          productId: currentProduct.id,
          specId: state.specId,
          length,
          width,
          quantity,
          styles,
          innerPages,
          optionNames: selectedOptions.map((item) => item.name),
        })
      : null;
    const priceFactor = Math.max(0, num(currentProduct.priceFactor, 100));
    const sourceAmount = sourcePricing ? sourcePricing.amount * priceFactor / 100 : null;
    const tierUnitPrice = currentProduct.pricingMode === "perBookTier" ? bookTierUnitPrice(currentProduct, state.specId, quantity) : null;
    if (currentProduct.pricingMode === "perBookTier" && tierUnitPrice === null) return null;
    const includedInnerPages = Math.max(0, Math.floor(num(currentProduct.bookPricing?.includedInnerPages)));
    const extraInnerPages = tierUnitPrice === null ? 0 : Math.max(0, innerPages - includedInnerPages);
    const extraInnerPageCost = tierUnitPrice === null ? 0 : extraInnerPages * quantity * Math.max(0, num(currentProduct.bookPricing?.extraInnerPagePrice));
    const materialCost = sourceAmount !== null ? sourceAmount : tierUnitPrice === null ? totalArea * num(currentProduct.rate) : tierUnitPrice * quantity;
    const styleCost = sourceAmount !== null || tierUnitPrice !== null ? 0 : styles * Math.max(0, num(state.styleFee));
    const optionCost = sourceAmount !== null ? 0 : selectedOptions.reduce((sum, item) => sum + totalArea * num(item.fee), 0);
    const raw = materialCost + extraInnerPageCost + styleCost + optionCost;
    const floor =
      state.minimumMode === "material"
        ? num(currentProduct.minimum, 40)
        : state.minimumMode === "40"
          ? 40
          : state.minimumMode === "50"
            ? 50
            : Math.max(0, num(state.customMinimum, 40));
    const final = Math.ceil(Math.max(raw, floor));
    return {
      length,
      width,
      quantity,
      styles,
      innerPages,
      pageMultiplier,
      areaEach,
      totalArea,
      materialCost,
      sourcePricing,
      sourceAmount,
      priceFactor,
      tierUnitPrice,
      includedInnerPages,
      extraInnerPages,
      extraInnerPageCost,
      styleCost,
      optionCost,
      raw,
      floor,
      final,
      unit: final / quantity,
      floorApplied: raw < floor,
      product: currentProduct,
      spec: currentSpec(),
      options: selectedOptions,
    };
  }

  function notify(message) {
    state.toast = message;
    render();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      state.toast = "";
      render();
    }, 1800);
  }

  function copyText(text) {
    const done = () => notify("报价内容已复制");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    done();
  }

  function resultText(result) {
    const optionText = result.options.map((item) => `${item.groupName}：${item.name}`).join("；") || "未选择";
    const quantityUnit = result.product.quantityUnit || "张";
    const isCookbook = result.product.category === "cookbook";
    return [
      `品类：${result.product.name}`,
      result.spec ? `规格：${result.spec.label}` : "",
      `尺寸：${result.length}m × ${result.width}m`,
      result.product.category === "cookbook" ? `内页：${result.innerPages}张（${result.innerPages * 2}页）` : "",
      `数量：${result.quantity}${quantityUnit}｜款数：${result.styles}款`,
      result.sourcePricing && !isCookbook ? `原表最高价：${result.sourcePricing.formula}` : "",
      result.sourcePricing && result.priceFactor !== 100 ? `品类调价系数：${result.priceFactor}%` : "",
      result.tierUnitPrice !== null ? `每本阶梯单价：${money(result.tierUnitPrice)}（含${result.includedInnerPages}张内页）` : "",
      result.extraInnerPages ? `超出内页：${result.extraInnerPages}张 × ${result.quantity}本 × ${money(result.product.bookPricing.extraInnerPagePrice)}＝${money(result.extraInnerPageCost)}` : "",
      `材料/工艺：${optionText}`,
      `报价：${money(result.final)}（每${quantityUnit}约 ${money(result.unit)}）`,
      result.sourcePricing ? `价格来源：${result.sourcePricing.sourceReference}${result.sourcePricing.note ? `；${result.sourcePricing.note}` : ""}` : "",
      result.floorApplied ? `已执行最低价：${money(result.floor)}` : "",
      "最终价格以确认文件、实际品类和生产要求为准。",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function categoryTabs() {
    return productCategories
      .map(
        (category) => `
          <button class="category-tab ${category.id === state.categoryId ? "selected" : ""}" data-action="category" data-id="${attr(category.id)}">
            <strong>${escapeHtml(category.name)}</strong>
            <small>${escapeHtml(category.description)}</small>
          </button>`,
      )
      .join("");
  }

  function productCards() {
    return settings.products
      .filter((item) => item.category === state.categoryId)
      .map(
        (item) => `
          <button class="material-card ${item.id === state.productId ? "selected" : ""}" data-action="product" data-id="${attr(item.id)}">
            <span class="material-swatch ${attr(item.tone)}"><b>${escapeHtml(item.name.slice(0, 1))}</b></span>
            <span class="material-copy"><strong>${escapeHtml(item.name)}</strong><small>${item.pricingMode === "originalHighest" ? `原表最高价 · 系数${num(item.priceFactor, 100)}%` : item.pricingMode === "perBookTier" ? "按本数与规格阶梯计价" : `${money(item.rate)}/㎡ · 起步${money(item.minimum)}`}</small></span>
            <i>✓</i>
          </button>`,
      )
      .join("");
  }

  function productSpecificationPanel() {
    const currentProduct = product();
    return `
      <div class="parameter-row specification-row">
        <div class="row-label">产品规格</div>
        <div class="specification-panel">
          <div class="specification-heading"><b>选择常用尺寸</b><small>点击规格会自动填写长宽；定制尺寸请手动输入</small></div>
          <div class="spec-preset-list">
            ${(currentProduct.specs || []).map((spec) => `<button class="spec-preset ${spec.id === state.specId ? "selected" : ""}" data-action="spec" data-id="${attr(spec.id)}"><b>${escapeHtml(spec.label)}</b>${spec.custom ? "<small>手动输入</small>" : `<small>${spec.length}m × ${spec.width}m</small>`}</button>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function productOptionRows() {
    return (product().optionGroups || [])
      .map(
        (group) => `
          <div class="parameter-row product-option-row">
            <div class="row-label">${escapeHtml(group.name)}</div>
            <div class="checks">
              ${group.items
                .map((item) => {
                  const checked = (state.productOptions[group.id] || []).includes(item.id);
                  const fee = settings.optionFees[item.id] ?? item.fee ?? 0;
                  const suffix = fee ? ` +${fee}/㎡` : "";
                  return `<label class="check-item ${checked ? "checked" : ""}"><input type="${group.type === "single" ? "radio" : "checkbox"}" name="${attr(`${product().id}-${group.id}`)}" data-option-group="${attr(group.id)}" data-option="${attr(item.id)}" ${checked ? "checked" : ""}><span class="fake-check"></span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(suffix)}</small></label>`;
                })
                .join("")}
            </div>
          </div>`,
      )
      .join("");
  }

  function resultPanel(result) {
    if (!result) {
      return `
        <aside class="result-panel">
          <div class="result-empty"><span>¥</span><h2>等待算价</h2><p>选择品类，输入长宽、数量和款数后，即可计算。</p></div>
          <div class="floor-rule"><b>最低价保护</b><p>即使实际计算低于起步价，也会按您选择的 40 元、50 元或自定义最低价报价。</p></div>
        </aside>`;
    }
    const quantityUnit = result.product.quantityUnit || "张";
    const isCookbook = result.product.category === "cookbook";
    return `
      <aside class="result-panel ready">
        <div class="result-heading"><span>算价结果</span><small>${result.product.name}</small></div>
        <div class="final-price"><small>建议对客报价</small><strong>${money(result.final)}</strong><span>约 ${money(result.unit)} / ${quantityUnit}</span></div>
        ${result.floorApplied ? `<div class="floor-hit"><b>已触发最低价</b><span>计算价 ${money(result.raw)}，按最低 ${money(result.floor)} 报价</span></div>` : isCookbook ? "" : `<div class="floor-pass"><b>未触发最低价</b><span>计算价已高于 ${money(result.floor)}</span></div>`}
        <dl class="breakdown">
          ${result.spec ? `<div><dt>产品规格</dt><dd>${escapeHtml(result.spec.label)}</dd></div>` : ""}
          ${isCookbook ? `<div><dt>内页数量</dt><dd>${result.innerPages} 张（${result.innerPages * 2} 页）</dd></div>` : ""}
          ${!isCookbook ? `<div><dt>${result.product.multiplyByInnerPages ? "单页面积" : "单张面积"}</dt><dd>${result.areaEach.toFixed(3)} ㎡</dd></div>` : ""}
          ${result.product.multiplyByInnerPages ? `<div><dt>计价页数</dt><dd>${result.innerPages} 页 × ${result.quantity} 本</dd></div>` : ""}
          ${result.sourcePricing ? `${!isCookbook ? `<div><dt>原表最高价规则</dt><dd>${escapeHtml(result.sourcePricing.formula)}</dd></div>` : ""}<div><dt>价格来源</dt><dd>${escapeHtml(result.sourcePricing.sourceReference)}</dd></div>${result.priceFactor !== 100 ? `<div><dt>品类调价系数</dt><dd>${result.priceFactor}%</dd></div>` : ""}` : ""}
          ${!isCookbook ? `<div><dt>总面积</dt><dd>${result.totalArea.toFixed(3)} ㎡</dd></div>` : ""}
          ${result.tierUnitPrice !== null ? `<div><dt>每本阶梯单价</dt><dd>${money(result.tierUnitPrice)} × ${result.quantity} 本</dd></div>` : ""}
          ${!isCookbook ? `<div><dt>${result.tierUnitPrice !== null ? "菜谱本基础费" : "品类基础费"}</dt><dd>${money(result.materialCost)}</dd></div>` : ""}
          ${result.tierUnitPrice !== null ? `<div><dt>包含内页</dt><dd>${result.includedInnerPages} 张及以下</dd></div>` : ""}
          ${result.extraInnerPages ? `<div><dt>另加内页</dt><dd>${result.extraInnerPages} 张 × ${result.quantity} 本 × ${money(result.product.bookPricing.extraInnerPagePrice)} = ${money(result.extraInnerPageCost)}</dd></div>` : ""}
          <div><dt>材料/工艺加价</dt><dd>${money(result.optionCost)}</dd></div>
          <div><dt>款式/设计</dt><dd>${money(result.styleCost)}</dd></div>
          <div class="raw-total"><dt>计算原价</dt><dd>${money(result.raw)}</dd></div>
        </dl>
        <div class="selected-processes"><b>已选材料与工艺</b><p>${result.options.map((item) => `${escapeHtml(item.groupName)}：${escapeHtml(item.name)}`).join("；") || "未选择"}</p></div>
        <div class="result-actions"><button class="primary" data-action="copy-result">复制报价</button><button class="secondary" data-action="print">打印</button></div>
        <p class="calculation-note">${isCookbook ? "报价按所选规格、内页张数和本数计算，最终价格以确认文件和生产要求为准。" : result.sourcePricing ? `计算公式：原表对应档位的最高价 × 品类调价系数，再与最低价比较并向上取整。${result.sourcePricing.note ? `说明：${escapeHtml(result.sourcePricing.note)}。` : ""}` : result.tierUnitPrice !== null ? `计算公式：每本阶梯单价 × 本数 + 超出 ${result.includedInnerPages} 张的内页数量 × 本数 × ${money(result.product.bookPricing.extraInnerPagePrice)} + 材料/工艺加价 + 款式费。` : result.product.multiplyByInnerPages ? "计算公式：单页面积 × 内页数量 × 菜谱本数量 × 品类单价 + 材料/工艺加价 + 款式费，再与最低价比较并向上取整。" : "计算公式：面积 × 品类单价 + 材料/工艺加价 + 款式费，再与最低价比较并向上取整。"}</p>
      </aside>`;
  }

  function referenceView() {
    const query = state.referenceQuery.trim().toLowerCase();
    const rows = sourceCatalog.groups
      .flatMap((group) => group.items)
      .filter((item) =>
        [item.product, item.spec, item.quantity, item.detail, item.notes].join(" ").toLowerCase().includes(query),
      )
      .slice(0, 80);
    return `
      <section class="reference-page">
        <div class="reference-head"><div><span class="eyebrow">原 Excel 数据</span><h1>原表参考价查询</h1><p>智能算价用于快速估算；拿不准时，可在这里核对原报价表。</p></div><label class="reference-search"><span>⌕</span><input data-field="reference-query" value="${attr(state.referenceQuery)}" placeholder="搜索产品、规格或数量"></label></div>
        <div class="reference-grid">
          ${rows
            .map(
              (item) => `<article><div><span>${escapeHtml(item.sheet)} · 第 ${item.row} 行</span><h3>${escapeHtml(item.product)}</h3><p>${escapeHtml([item.spec, item.quantity, item.detail].filter(Boolean).join(" · "))}</p></div><div class="reference-prices">${item.prices.slice(0, 8).map((price) => `<span><small>${escapeHtml(price.label)}</small><b>${escapeHtml(price.value)}</b></span>`).join("")}</div>${item.notes ? `<aside>${escapeHtml(item.notes)}</aside>` : ""}</article>`,
            )
            .join("") || `<div class="no-reference">没有匹配结果，请缩短关键词。</div>`}
        </div>
      </section>`;
  }

  function settingsModal() {
    if (!state.settingsOpen) return "";
    const draftMap = Object.fromEntries((adminDraft?.products || []).map((item) => [item.id, item]));
    return `
      <div class="modal-backdrop" data-action="close-settings">
        <section class="settings-modal" data-modal>
          <header><div><span class="eyebrow">老板专用</span><h2>报价管理端</h2><p>修改后直接发布到 GitHub，所有客服端自动同步。不同品类按各自计价规则计算。</p></div><button class="modal-close" data-action="close-settings" aria-label="关闭管理端">×</button></header>
          <div class="admin-auth">
            <div class="admin-steps"><b>使用方法</b><span>1. 填写授权令牌</span><span>2. 修改价格</span><span>3. 点击发布全部价格</span></div>
            <label><span>GitHub 授权令牌</span><input type="password" data-admin-token value="${attr(adminToken)}" autocomplete="off" spellcheck="false" placeholder="只在本次页面中使用，刷新后自动清除"></label>
            <p>令牌必须属于老板账号，并仅授予 <b>zhb5621949/bjb</b> 仓库的 Contents 读写权限。<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">创建授权令牌</a></p>
          </div>
          <div class="admin-defaults"><label><span>默认设计/开机费</span><input type="number" min="0" step="1" data-admin-setting="styleFeeDefault" value="${attr(adminDraft?.styleFeeDefault ?? settings.styleFeeDefault)}"><i>元/款</i></label><small>当前线上版本：V${settings.version || "-"}</small></div>
          <div class="settings-table">
            <div class="settings-row settings-title"><span>具体品类</span><span>原表价系数</span><span>默认最低价</span></div>
            ${settings.products
              .map(
                (item) => `<div class="settings-row"><strong>${escapeHtml(productCategories.find((category) => category.id === item.category)?.name || "其他")} · ${escapeHtml(item.name)}</strong><label class="factor-input"><input type="number" min="0" step="1" data-admin-setting="priceFactor" data-product-id="${attr(item.id)}" value="${attr(draftMap[item.id]?.priceFactor ?? item.priceFactor ?? 100)}"><i>%</i></label><input type="number" min="0" step="1" data-admin-setting="minimum" data-product-id="${attr(item.id)}" value="${attr(draftMap[item.id]?.minimum ?? item.minimum)}"></div>`,
              )
              .join("")}
          </div>
          <p class="admin-factor-help">100%＝完全按原表最高价；110%＝整套档位上调10%；90%＝整套档位下调10%。这样不用逐个数量档位修改。</p>
          <div class="admin-status ${adminStatus.includes("成功") ? "success" : ""}" aria-live="polite">${escapeHtml(adminStatus || "价格发布后，客服无需重新安装软件。")}</div>
          <footer><button class="text-button" data-action="reset-settings" ${adminBusy ? "disabled" : ""}>恢复初始价格</button><button class="primary" data-action="publish-settings" ${adminBusy ? "disabled" : ""}>${adminBusy ? "正在发布…" : "发布全部价格"}</button></footer>
        </section>
      </div>`;
  }

  function calculatorView() {
    const currentProduct = product();
    const isAdditionalInnerPages = Boolean(currentProduct.multiplyByInnerPages);
    const isBookTierPricing = currentProduct.pricingMode === "perBookTier";
    const usesOriginalPricing = currentProduct.pricingMode === "originalHighest";
    latestResult = state.resultVisible ? calculate() : null;
    return `
      <section class="calculator-layout">
        <div class="form-card">
          <div class="section-title"><i></i><div><h2>产品信息</h2><p>先选大类，再选择具体品类并填写生产参数</p></div></div>
          <div class="parameter-row category-row"><div class="row-label category-main-label">第一步<br>选择大类</div><div class="category-selector"><div class="category-tabs">${categoryTabs()}</div><div class="category-detail-label"><b>${escapeHtml(productCategories.find((item) => item.id === state.categoryId)?.name || "")}</b><span>再选择下面的具体产品</span></div><div class="materials">${productCards()}</div></div></div>
          ${productSpecificationPanel()}
          <div class="parameter-row"><div class="row-label">尺寸（米）</div><div class="size-inputs"><label><span>长边</span><input type="number" min="0" step="0.01" data-field="length" value="${attr(state.length)}" placeholder="例如 1.2"></label><b>×</b><label><span>短边</span><input type="number" min="0" step="0.01" data-field="width" value="${attr(state.width)}" placeholder="例如 0.8"></label><small>单张面积：${num(state.length) && num(state.width) ? (num(state.length) * num(state.width)).toFixed(3) : "0.000"} ㎡</small></div></div>
          ${currentProduct.category === "cookbook" ? `<div class="parameter-row"><div class="row-label">内页张数</div><div class="inner-page-input"><label><span>多少张内页</span><input type="number" min="1" step="1" data-field="inner-pages" value="${attr(state.innerPages)}" placeholder="例如 8"><i>张</i></label><strong class="page-conversion">${Math.max(0, Math.floor(num(state.innerPages))) ? `＝ ${Math.floor(num(state.innerPages)) * 2} 页` : "1 张＝2 页"}</strong><small>${usesOriginalPricing ? "系统会按原表对应的内页张数档位取最高价" : isBookTierPricing ? `已包含 ${currentProduct.bookPricing.includedInnerPages} 张（${currentProduct.bookPricing.includedInnerPages * 2} 页）内页；超过部分每张每本另加 ${money(currentProduct.bookPricing.extraInnerPagePrice)}` : isAdditionalInnerPages ? "另加内页按单张面积 × 内页张数 × 菜谱本数量计价；页面数仅作显示" : "请输入实际纸张张数，系统自动换算页面数"}</small></div></div>` : ""}
          ${productOptionRows()}
          <div class="parameter-row"><div class="row-label">数量与款数</div><div class="quantity-grid"><label><span>${currentProduct.category === "cookbook" ? "菜谱本数量（本）" : currentProduct.id === "table-sign-menu" ? "总数量（个）" : currentProduct.id === "multipart-form" ? "总数量（本）" : "总数量（张）"}</span><input type="number" min="1" step="1" data-field="quantity" value="${attr(state.quantity)}"></label><label><span>款数</span><input type="number" min="1" step="1" data-field="styles" value="${attr(state.styles)}"></label><label><span>每款设计/开机费</span><input type="number" min="0" step="1" data-field="style-fee" value="${attr(state.styleFee)}"><i>元/款</i></label></div></div>
          <div class="parameter-row"><div class="row-label">最低价</div><div class="minimum-options">
            <label class="${state.minimumMode === "material" ? "selected" : ""}"><input type="radio" name="minimum" data-minimum="material" ${state.minimumMode === "material" ? "checked" : ""}><b>跟随品类</b><small>${money(currentProduct.minimum)}</small></label>
            <label class="${state.minimumMode === "40" ? "selected" : ""}"><input type="radio" name="minimum" data-minimum="40" ${state.minimumMode === "40" ? "checked" : ""}><b>最低 40 元</b></label>
            <label class="${state.minimumMode === "50" ? "selected" : ""}"><input type="radio" name="minimum" data-minimum="50" ${state.minimumMode === "50" ? "checked" : ""}><b>最低 50 元</b></label>
            <label class="${state.minimumMode === "custom" ? "selected" : ""} custom-minimum"><input type="radio" name="minimum" data-minimum="custom" ${state.minimumMode === "custom" ? "checked" : ""}><b>自定义</b><input type="number" min="0" data-field="custom-minimum" value="${attr(state.customMinimum)}"><small>元</small></label>
          </div></div>
          <div class="calculate-bar"><div><span>当前品类</span><b>${escapeHtml(currentProduct.name)}</b><small>${currentProduct.pricingMode === "originalHighest" ? `按原表最高价 · 系数${num(currentProduct.priceFactor, 100)}%` : isBookTierPricing ? "按每本阶梯单价" : `${money(currentProduct.rate)}/㎡`}</small></div><button class="calculate-button" data-action="calculate">立即算价 <span>→</span></button></div>
        </div>
        ${resultPanel(latestResult)}
      </section>`;
  }

  function render() {
    const syncLabel =
      syncInfo.status === "online"
        ? `● 已同步 V${syncInfo.version}`
        : syncInfo.status === "offline"
          ? `● 连接失败 V${syncInfo.version || "-"}`
          : "● 正在同步";
    app.innerHTML = `
      <main class="app-shell">
        ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
        <header class="topbar">
          <div class="brand"><span class="brand-mark">¥</span><div><strong>写真广告 · 智能算价器</strong><small>GitHub 在线版｜老板改价后客服自动同步</small></div></div>
          <div class="top-actions"><span class="sync-badge ${syncInfo.status}">${syncLabel}</span><button class="admin-button" data-action="open-settings">老板管理</button><button data-action="refresh-pricing">刷新价格</button><button class="${deferredInstallPrompt ? "" : "install-unavailable"}" data-action="install-app">安装到桌面</button><button data-action="reset-form">清空参数</button></div>
        </header>
        <nav class="tabs"><button class="${state.tab === "calculator" ? "active" : ""}" data-action="tab" data-tab="calculator">智能算价</button><button class="${state.tab === "reference" ? "active" : ""}" data-action="tab" data-tab="reference">原表参考</button><span>产品规格已融合｜价格 V${syncInfo.version || 3}</span></nav>
        ${state.tab === "calculator" ? calculatorView() : referenceView()}
        ${settingsModal()}
      </main>`;
  }

  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "close-settings" && target.classList.contains("modal-backdrop") && event.target.closest("[data-modal]")) return;
    if (action === "open-settings") {
      adminDraft = createAdminDraft();
      adminStatus = "";
      state.settingsOpen = true;
    } else if (action === "close-settings") {
      state.settingsOpen = false;
      adminToken = "";
      adminDraft = null;
      adminStatus = "";
    } else if (action === "reset-settings") {
      adminDraft = {
        products: defaultProducts.map((item) => ({ id: item.id, rate: num(item.rate), minimum: num(item.minimum, 40), priceFactor: Math.max(0, num(item.priceFactor, 100)), bookPricing: item.bookPricing ? JSON.parse(JSON.stringify(item.bookPricing)) : undefined })),
        styleFeeDefault: 10,
      };
      adminStatus = "已恢复初始价格，点击“发布全部价格”后才会生效";
    } else if (action === "publish-settings") {
      publishAdminPricing();
      return;
    } else if (action === "category") {
      state.categoryId = target.dataset.id;
      selectProduct(settings.products.find((item) => item.category === state.categoryId)?.id || settings.products[0].id);
    } else if (action === "product") {
      selectProduct(target.dataset.id);
    } else if (action === "spec") {
      const selectedSpec = product().specs?.find((item) => item.id === target.dataset.id);
      if (selectedSpec) {
        state.specId = selectedSpec.id;
        if (selectedSpec.custom) {
          state.length = "";
          state.width = "";
        } else {
          state.length = String(selectedSpec.length || "");
          state.width = String(selectedSpec.width || "");
        }
        state.resultVisible = false;
      }
    } else if (action === "calculate") {
      if (product().category === "cookbook" && Math.floor(num(state.innerPages)) < 1) {
        notify("请先输入内页张数");
        return;
      }
      latestResult = calculate();
      if (!latestResult) {
        notify("请先输入正确的长边和短边");
        return;
      }
      state.resultVisible = true;
    } else if (action === "copy-result") {
      const result = calculate();
      if (result) copyText(resultText(result));
      return;
    } else if (action === "print") {
      window.print();
      return;
    } else if (action === "refresh-pricing") {
      syncPricing();
      return;
    } else if (action === "install-app") {
      if (!deferredInstallPrompt) {
        notify("请使用 Chrome 或 Edge，在浏览器菜单中选择“安装此应用”");
        return;
      }
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(() => {
        deferredInstallPrompt = null;
        render();
      });
      return;
    } else if (action === "tab") {
      state.tab = target.dataset.tab;
    } else if (action === "reset-form") {
      const keepTab = state.tab;
      state = freshState();
      state.tab = keepTab;
      latestResult = null;
    }
    saveState();
    render();
  });

  app.addEventListener("input", (event) => {
    if (event.target.dataset.adminToken !== undefined) {
      adminToken = event.target.value;
      return;
    }
    const adminSetting = event.target.dataset.adminSetting;
    if (adminSetting && adminDraft) {
      if (adminSetting === "styleFeeDefault") {
        adminDraft.styleFeeDefault = num(event.target.value);
      } else {
        const item = adminDraft.products.find((entry) => entry.id === event.target.dataset.productId);
        if (item) item[adminSetting] = num(event.target.value);
      }
      return;
    }
    const bookSetting = event.target.dataset.adminBookSetting;
    const bookTier = event.target.dataset.adminBookTier;
    if ((bookSetting || bookTier) && adminDraft) {
      const hardRing = adminDraft.products.find((entry) => entry.id === "hard-ring-cookbook");
      if (!hardRing?.bookPricing) return;
      if (bookSetting) {
        hardRing.bookPricing[bookSetting] = Math.max(0, num(event.target.value));
      } else {
        const spec = event.target.dataset.adminBookSpec;
        hardRing.bookPricing.specs[spec][bookTier] = Math.max(0, num(event.target.value));
        if (spec === "large") hardRing.bookPricing.specs.a3[bookTier] = Math.max(0, num(event.target.value));
      }
      return;
    }
    const field = event.target.dataset.field;
    if (field) {
      const map = {
        length: "length",
        width: "width",
        "inner-pages": "innerPages",
        quantity: "quantity",
        styles: "styles",
        "style-fee": "styleFee",
        "custom-minimum": "customMinimum",
        "reference-query": "referenceQuery",
      };
      state[map[field]] = event.target.value;
      saveState();
      if (field === "reference-query") {
        render();
        requestAnimationFrame(() => {
          const input = app.querySelector('[data-field="reference-query"]');
          input?.focus();
          input?.setSelectionRange(input.value.length, input.value.length);
        });
      } else if (state.resultVisible) {
        render();
        requestAnimationFrame(() => {
          const input = app.querySelector(`[data-field="${field}"]`);
          input?.focus();
        });
      } else if (field === "inner-pages") {
        const conversion = app.querySelector(".page-conversion");
        if (conversion) {
          const sheets = Math.max(0, Math.floor(num(state.innerPages)));
          conversion.textContent = sheets ? `＝ ${sheets * 2} 页` : "1 张＝2 页";
        }
      } else if (field === "length" || field === "width") {
        state.specId = "";
        saveState();
        const areaNode = app.querySelector(".size-inputs > small");
        if (areaNode) {
          const area = num(state.length) * num(state.width);
          areaNode.textContent = `单张面积：${area.toFixed(3)} ㎡`;
        }
      }
      return;
    }
    const setting = event.target.dataset.setting;
    if (setting) {
      const item = settings.products.find((entry) => entry.id === event.target.dataset.productId);
      if (item) item[setting] = num(event.target.value);
    }
  });

  app.addEventListener("change", (event) => {
    if (event.target.dataset.option) {
      const groupId = event.target.dataset.optionGroup;
      const group = product().optionGroups?.find((item) => item.id === groupId);
      const optionId = event.target.dataset.option;
      if (!group) return;
      if (group.type === "single") {
        state.productOptions[groupId] = [optionId];
      } else if (event.target.checked) {
        state.productOptions[groupId] = [...(state.productOptions[groupId] || []), optionId];
      } else {
        state.productOptions[groupId] = (state.productOptions[groupId] || []).filter((id) => id !== optionId);
      }
      state.resultVisible = false;
      saveState();
      render();
    } else if (event.target.dataset.minimum) {
      state.minimumMode = event.target.dataset.minimum;
      saveState();
      render();
    } else if (event.target.dataset.setting === "minimum") {
      const item = settings.products.find((entry) => entry.id === event.target.dataset.productId);
      if (item) item.minimum = num(event.target.value, 40);
    }
  });

  render();
  syncPricing(true);
  window.setInterval(() => syncPricing(true), 15000);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    render();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    notify("已经安装到电脑桌面");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
