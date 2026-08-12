(function () {
  "use strict";

  const catalog = window.OFFLINE_CATALOG || { groups: [] };
  const items = catalog.groups.flatMap((group) => group.items || []);
  const itemMap = Object.fromEntries(items.map((item) => [item.id, item]));

  const cookbookSources = {
    "hard-ring-cookbook": "铁环装 皮面雕刻/皮面印刷",
    "deluxe-inner-nail-cookbook": "精装书本 内钉皮质",
    "deluxe-outer-nail-cookbook": "精装书本 内钉皮质",
    "butterfly-cookbook": "蝴蝶装 皮面雕刻/皮面印刷",
    "spiral-cookbook": "线圈 菜谱本",
    "laminated-spiral-cookbook": "塑封 菜谱本",
    "saddle-album-cookbook": "精装书本 内钉皮质",
    "perfect-album-cookbook": "精装书本 内钉皮质",
  };

  const proxyNotes = {
    "deluxe-outer-nail-cookbook": "原表没有外钉独立价格，按精装内钉的最高价计算",
    "saddle-album-cookbook": "原表没有骑马钉画册独立价格，按精装内钉的最高价计算",
    "perfect-album-cookbook": "原表没有胶装画册独立价格，按精装内钉的最高价计算",
    "photo-menu": "写真菜单按原表写真墙贴海报的最高价计算",
    "flyer": "原表没有普通宣传单独立价格，按同规格157克勾选菜单最高价计算",
    "business-card": "普通名片按原表9×5.4厘米卡片的最高价计算",
    "sticker-poster": "不干胶海报按原表写真墙贴海报的最高价计算",
    "static-cling": "原表没有静电贴独立价格，按写真墙贴海报最高价计算",
    "one-way-vision": "原表没有单透贴独立价格，按写真墙贴海报最高价计算",
    "car-sticker": "原表没有车贴独立价格，按写真墙贴海报最高价计算",
    "glass-lettering": "原表没有玻璃刻字独立价格，按写真墙贴海报最高价计算",
  };

  const supportedIds = new Set([
    ...Object.keys(cookbookSources),
    "additional-inner-pages",
    "laminated-menu",
    "pvc-menu",
    "photo-menu",
    "photo-paper-menu",
    "checklist-menu",
    "multipart-form",
    "indoor-light-film-menu",
    "takeaway-card",
    "voucher",
    "table-sign-menu",
    "banner-menu",
    "kt-board-menu",
    "backlit-fabric",
    "stretch-lightbox-fabric",
    "canvas",
    "business-card",
    "flyer",
    "kt-board-poster",
    "sticker-poster",
    "photo-poster",
    "banner",
    "indoor-light-film",
    "static-cling",
    "one-way-vision",
    "car-sticker",
    "glass-lettering",
    "copy-paper-print",
  ]);

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function sourceItem(id) {
    return itemMap[id] || null;
  }

  function maxAt(itemOrId, column) {
    const item = typeof itemOrId === "string" ? sourceItem(itemOrId) : itemOrId;
    const price = item?.prices?.find((entry) => Number(entry.column) === Number(column));
    return Number.isFinite(Number(price?.max)) ? Number(price.max) : null;
  }

  function highestAt(itemOrId, columns) {
    const values = columns.map((column) => maxAt(itemOrId, column)).filter((value) => value !== null);
    return values.length ? Math.max(...values) : null;
  }

  function sourceReference(itemOrId) {
    const item = typeof itemOrId === "string" ? sourceItem(itemOrId) : itemOrId;
    return item ? `${item.sheet}第${item.row}行` : "原报价表";
  }

  function result(amount, itemOrId, formula, note = "") {
    if (!Number.isFinite(amount) || amount < 0) return null;
    const item = typeof itemOrId === "string" ? sourceItem(itemOrId) : itemOrId;
    return {
      amount,
      formula,
      sourceReference: sourceReference(item),
      sourceProduct: item?.product || "原报价表",
      note,
    };
  }

  function parseQuantityRange(text) {
    const normalized = String(text || "").replaceAll("千", "000").replaceAll("万", "0000");
    const values = (normalized.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    if (!values.length) return null;
    if (/以上/.test(normalized)) return { min: values[0], max: Infinity };
    if (values.length >= 2) return { min: values[0], max: values[1] };
    return { min: values[0], max: values[0] };
  }

  function cookbookSpecMatches(item, specId) {
    const text = String(item.spec || "");
    if (specId === "a4") return /A4/.test(text);
    if (specId === "large") return /25-36/.test(text);
    if (specId === "a3") return /A3/.test(text);
    if (specId === "a5") return /A4/.test(text);
    return /A4/.test(text);
  }

  function cookbookPagePrice(item, sheets) {
    const regular = item.prices.find((price) => price.label === "常规内页/每本价格")?.max;
    if (sheets <= 8 && Number.isFinite(Number(regular))) {
      return { value: Number(regular), band: "8张及以下", bandMax: 8 };
    }
    const bands = [
      { min: 9, max: 10, label: "9-10张" },
      { min: 11, max: 12, label: "11-12张" },
      { min: 13, max: 15, label: "13-15张" },
      { min: 16, max: 18, label: "16-18张" },
      { min: 19, max: 21, label: "19-21张" },
      { min: 22, max: 25, label: "22-25张" },
      { min: 26, max: 30, label: "26-30张" },
      { min: 31, max: 35, label: "31-35张" },
      { min: 36, max: 40, label: "36-40张" },
      { min: 41, max: 45, label: "41-45张" },
      { min: 46, max: 50, label: "46-50张" },
    ];
    const exact = bands.find((band) => sheets >= band.min && sheets <= band.max);
    const price = exact ? item.prices.find((entry) => entry.label === exact.label) : null;
    if (price && Number.isFinite(Number(price.max))) return { value: Number(price.max), band: exact.label, bandMax: exact.max };

    const available = bands
      .map((band) => ({ ...band, value: Number(item.prices.find((entry) => entry.label === band.label)?.max) }))
      .filter((band) => Number.isFinite(band.value));
    const last = available.at(-1);
    if (!last) return null;
    return {
      value: last.value + Math.max(0, sheets - last.max) * 10,
      band: `${last.label}后每张加10元`,
      bandMax: sheets,
      extended: true,
    };
  }

  function cookbookPrice(input, productName) {
    const rows = items.filter((item) => item.product === productName && cookbookSpecMatches(item, input.specId));
    if (!rows.length) return null;
    const quantityRows = rows
      .map((item) => ({ item, range: parseQuantityRange(item.quantity) }))
      .filter((entry) => entry.range);
    let selected = quantityRows.find((entry) => input.quantity >= entry.range.min && input.quantity <= entry.range.max);
    if (!selected) {
      selected = input.quantity < (quantityRows[0]?.range.min || 1) ? quantityRows[0] : quantityRows.at(-1);
    }
    if (!selected) return null;
    const pagePrice = cookbookPagePrice(selected.item, input.innerPages);
    if (!pagePrice) return null;
    const noteParts = [proxyNotes[input.productId], pagePrice.extended ? "内页超过原表最高档，超出部分按每张每本10元顺延" : ""];
    return result(
      pagePrice.value * input.quantity,
      selected.item,
      `${selected.item.spec}｜${selected.item.quantity}｜${pagePrice.band}：每本${pagePrice.value}元 × ${input.quantity}本`,
      noteParts.filter(Boolean).join("；"),
    );
  }

  function additionalInnerPagesPrice(input) {
    const optionText = input.optionNames.join(" ");
    const productName = /PVC|加厚/.test(optionText) ? "铁环菜本 补的内页" : "通用本子用的内页";
    const specText = input.specId === "a4" ? "A4" : "A3";
    const item = items.find((entry) => entry.product === productName && entry.spec === specText);
    if (!item) return null;
    const totalSheets = input.innerPages * input.quantity;
    const bands = [
      { max: 5, column: 10, label: "5张以下" },
      { max: 8, column: 11, label: "6-8张" },
      { max: 10, column: 12, label: "9-10张" },
      { max: 12, column: 13, label: "11-12张" },
      { max: 15, column: 14, label: "13-15张" },
      { max: 18, column: 15, label: "16-18张" },
      { max: 21, column: 16, label: "19-21张" },
      { max: 25, column: 17, label: "22-25张" },
      { max: 30, column: 18, label: "26-30张" },
      { max: 35, column: 19, label: "31-35张" },
      { max: 40, column: 20, label: "36-40张" },
      { max: 45, column: 21, label: "41-45张" },
      { max: 50, column: 22, label: "46-50张" },
    ];
    const chosen = bands.find((band) => totalSheets <= band.max) || bands.at(-1);
    let amount = maxAt(item, chosen.column);
    if (amount === null) return null;
    const extended = totalSheets > 50;
    if (extended) amount += (totalSheets - 50) * 7;
    return result(
      amount,
      item,
      `${specText}｜共${totalSheets}张内页｜${extended ? "50张后每张加7元" : chosen.label}：${amount}元`,
      extended ? "数量超过原表50张最高档，超出部分按每张7元顺延" : "",
    );
  }

  function thresholdTable(itemId, quantity, bands, note = "") {
    const item = sourceItem(itemId);
    if (!item) return null;
    const chosen = bands.find((band) => quantity <= band.max) || bands.at(-1);
    const high = highestAt(item, chosen.columns || [chosen.column]);
    if (high === null) return null;
    let amount = chosen.perUnit ? high * quantity : high;
    let formula = `${chosen.label}：${high}元${chosen.perUnit ? `/张 × ${quantity}` : ""}`;
    if (quantity > chosen.max && Number.isFinite(chosen.max)) {
      const rate = chosen.perUnit ? high : high / chosen.max;
      amount = rate * quantity;
      formula = `超过原表最高数量档，按最高档单价${rate.toFixed(2)}元 × ${quantity}`;
      note = [note, "数量超过原表最高档，按最高档单价顺延"].filter(Boolean).join("；");
    }
    return result(amount, item, formula, note);
  }

  function laminatedMenuPrice(input) {
    const itemId = input.specId === "a3" ? "price-46" : "price-43";
    const bands = [
      { max: 2, column: 6, label: "1-2张" },
      ...Array.from({ length: 8 }, (_, index) => ({ max: index + 3, column: index + 7, label: `${index + 3}张` })),
      { max: 19, column: 15, perUnit: true, label: "11-19张" },
      { max: 29, column: 16, perUnit: true, label: "20-29张" },
      { max: 39, column: 17, perUnit: true, label: "30-39张" },
      { max: 60, column: 18, perUnit: true, label: "40-60张" },
      { max: 99, column: 19, perUnit: true, label: "61-99张" },
      { max: Infinity, column: 20, perUnit: true, label: "100张以上" },
    ];
    return thresholdTable(itemId, input.quantity, bands);
  }

  function pvcMenuPrice(input) {
    const a3 = input.specId === "a3";
    const itemId = a3 ? "price-62" : "price-58";
    const totalUntil = a3 ? 6 : 7;
    const bands = [];
    for (let quantity = 1; quantity <= 10; quantity += 1) {
      bands.push({ max: quantity, column: quantity + 4, perUnit: quantity > totalUntil, label: `${quantity}张` });
    }
    bands.push(
      { max: 19, column: 15, perUnit: true, label: "11-19张" },
      { max: 29, column: 16, perUnit: true, label: "20-29张" },
      { max: 39, column: 17, perUnit: true, label: "30-39张" },
      { max: 60, column: 18, perUnit: true, label: "40-60张" },
      { max: 99, column: 19, perUnit: true, label: "61-99张" },
      { max: Infinity, column: 20, perUnit: true, label: "100张以上" },
    );
    const note = input.specId === "a5" ? "原表没有A5 PVC独立价格，按A4最高价计算" : "";
    return thresholdTable(itemId, input.quantity, bands, note);
  }

  function cardPrice(input, itemId, note = "") {
    const bands = [
      { max: 200, column: 5, label: "200张" },
      { max: 500, column: 6, label: "500张" },
      { max: 1000, column: 7, label: "1000张" },
      { max: 2000, column: 8, label: "2000张" },
      { max: 3000, column: 9, label: "3000张" },
      { max: 4000, column: 10, label: "4000张" },
      { max: 5000, column: 11, label: "5000张" },
      { max: 10000, column: 12, label: "10000张" },
      { max: 20000, column: 13, label: "20000张" },
    ];
    const priced = thresholdTable(itemId, input.quantity, bands, note || proxyNotes[input.productId] || "");
    return priced;
  }

  function takeawayPrice(input) {
    const itemId = input.specId === "card" ? "price-76" : input.specId === "9x11" ? "price-77" : "price-78";
    return cardPrice(input, itemId);
  }

  function voucherPrice(input) {
    const itemId = input.specId === "card" ? "price-76" : "price-77";
    return cardPrice(input, itemId, input.specId === "5-4x18" ? "原表没有5.4×18厘米独立价格，按面积接近的9×11厘米最高价计算" : "");
  }

  function checklistPrice(input) {
    const ids = input.specId === "a3"
      ? ["print-17", "print-18", "print-19", "print-20", "print-21", "print-22"]
      : ["print-10", "print-11", "print-12", "print-13", "print-14", "print-15"];
    const quantities = [500, 1000, 2000, 3000, 5000, 10000];
    const index = quantities.findIndex((quantity) => input.quantity <= quantity);
    const itemId = ids[index < 0 ? ids.length - 1 : index];
    const item = sourceItem(itemId);
    const high = maxAt(item, 6);
    if (high === null) return null;
    let amount = high;
    let note = proxyNotes[input.productId] || "";
    if (input.quantity > 10000) {
      amount = (high / 10000) * input.quantity;
      note = [note, "数量超过原表1万张最高档，按最高档单价顺延"].filter(Boolean).join("；");
    }
    return result(amount, item, `157克｜${item.quantity}：${amount.toFixed(2)}元`, note);
  }

  function multipartPrice(input) {
    const itemId = input.specId === "21x28-5" ? "print-32" : input.specId === "14x21" ? "print-33" : "print-30";
    const item = sourceItem(itemId);
    let unitPrice = highestAt(item, [5, 6]);
    if (unitPrice === null) return null;
    if (input.quantity <= 50) unitPrice += 1.5;
    return result(unitPrice * input.quantity, item, `${input.quantity <= 50 ? "50本及以下" : "100本常规档"}：每本${unitPrice}元 × ${input.quantity}本`);
  }

  function tableSignPrice(input) {
    if (input.specId === "a3") {
      const rows = [sourceItem("price-116"), sourceItem("price-117")];
      const column = Math.min(input.quantity, 3) + 4;
      const high = Math.max(...rows.map((item) => maxAt(item, column) || 0));
      const batches = Math.ceil(input.quantity / 3);
      const amount = input.quantity <= 3 ? high : Math.max(...rows.map((item) => maxAt(item, 7) || 0)) * batches;
      return result(amount, rows[1], input.quantity <= 3 ? `A3横竖版取高｜${input.quantity}个：${amount}元` : `A3超过3个按3个最高价分批：${batches}批 × 160元`, input.quantity > 3 ? "数量超过原表A3最高档，按3个一批顺延" : "");
    }
    const rows = [sourceItem("price-114"), sourceItem("price-115")];
    const bands = [
      { min: 1, max: 1, column: 5, total: true, label: "1个" },
      { min: 2, max: 2, column: 6, total: true, label: "2个" },
      { min: 3, max: 3, column: 7, total: true, label: "3个" },
      { min: 4, max: 5, column: 8, label: "4-5个" },
      { min: 5, max: 6, column: 9, label: "5-6个" },
      { min: 6, max: 9, column: 10, label: "6-9个" },
      { min: 10, max: 14, column: 11, label: "10-14个" },
      { min: 15, max: 19, column: 12, label: "15-19个" },
      { min: 20, max: 29, column: 13, label: "20-29个" },
      { min: 30, max: 39, column: 14, label: "30-39个" },
      { min: 40, max: Infinity, column: 15, label: "40个以上" },
    ];
    const candidates = bands.filter((band) => input.quantity >= band.min && input.quantity <= band.max);
    const priced = candidates.map((band) => ({ band, high: Math.max(...rows.map((item) => maxAt(item, band.column) || 0)) }));
    const chosen = priced.sort((a, b) => (b.band.total ? b.high : b.high * input.quantity) - (a.band.total ? a.high : a.high * input.quantity))[0];
    if (!chosen) return null;
    const amount = chosen.band.total ? chosen.high : chosen.high * input.quantity;
    return result(amount, rows[1], `A4横竖版取高｜${chosen.band.label}：${chosen.high}元${chosen.band.total ? "" : `/个 × ${input.quantity}`}`);
  }

  function rowQuantityTotal(itemId, quantity, maxQuantity) {
    const item = sourceItem(itemId);
    const column = Math.min(quantity, maxQuantity) + 4;
    const high = maxAt(item, column);
    if (high === null) return null;
    const batches = Math.ceil(quantity / maxQuantity);
    return result(high * batches, item, quantity <= maxQuantity ? `${quantity}张：${high}元` : `${maxQuantity}张最高档 × ${batches}批`, quantity > maxQuantity ? "数量超过该尺寸原表最高档，按最高档分批顺延" : "");
  }

  function photoPrice(input) {
    const area = input.length * input.width;
    const different = input.styles >= input.quantity;
    if (area > 4.9) {
      const rate = different ? 22 : 18;
      const proxy = different ? "price-22" : "price-13";
      return result(area * input.quantity * rate, proxy, `${different ? "每张不同" : "同款内容"}｜大尺寸按${rate}元/㎡ × ${area.toFixed(3)}㎡ × ${input.quantity}张`, [proxyNotes[input.productId], "超过4.9㎡按原表大尺寸最高平方米价计算"].filter(Boolean).join("；"));
    }
    const sameBands = [
      { max: 0.24, id: "price-3", qty: 10 },
      { max: 0.48, id: "price-4", qty: 10 },
      { max: 0.7, id: "price-5", qty: 10 },
      { max: 1.2, id: "price-6", qty: 5 },
      { max: 1.6, id: "price-7", qty: 5 },
      { max: 2, id: "price-8", qty: 5 },
      { max: 2.9, id: "price-9", qty: 5 },
      { max: 3.5, id: "price-10", qty: 2 },
      { max: 4, id: "price-11", qty: 2 },
      { max: 4.9, id: "price-12", qty: 2 },
    ];
    const differentBands = [
      { max: 1.2, id: "price-15", qty: 5 },
      { max: 1.6, id: "price-16", qty: 5 },
      { max: 2, id: "price-17", qty: 5 },
      { max: 2.9, id: "price-18", qty: 5 },
      { max: 3.5, id: "price-19", qty: 2 },
      { max: 4, id: "price-20", qty: 2 },
      { max: 4.9, id: "price-21", qty: 2 },
    ];
    const band = (different ? differentBands : sameBands).find((entry) => area <= entry.max);
    if (!band) return null;
    const priced = rowQuantityTotal(band.id, input.quantity, band.qty);
    if (priced) priced.note = [proxyNotes[input.productId], priced.note].filter(Boolean).join("；");
    return priced;
  }

  function indoorLightPrice(input) {
    const area = input.length * input.width;
    if (area > 3) return result(area * input.quantity * 35, "price-105", `超过3㎡按35元/㎡ × ${area.toFixed(3)}㎡ × ${input.quantity}张`, "超过原表3㎡最高面积档，按原表最高平方米价顺延");
    const different = input.styles >= input.quantity;
    const bands = [
      { max: 0.24, id: different ? "price-99" : "price-100", qty: different ? 4 : 10 },
      { max: 0.48, id: "price-101", qty: 10 },
      { max: 0.9, id: "price-102", qty: 3 },
      { max: 1.5, id: "price-103", qty: 2 },
      { max: 2, id: "price-104", qty: 2 },
      { max: 3, id: "price-105", qty: 2 },
    ];
    const band = bands.find((entry) => area <= entry.max);
    return band ? rowQuantityTotal(band.id, input.quantity, band.qty) : null;
  }

  function fabricPrice(input) {
    const area = input.length * input.width * input.quantity;
    const itemId = "price-37";
    const bands = [
      { max: 1, column: 5, label: "1㎡以下" },
      { max: 1.5, column: 6, label: "1-1.5㎡" },
      { max: 1.9, column: 7, label: "1.6-1.9㎡" },
      { max: 2.5, column: 8, label: "2.1-2.5㎡" },
      { max: 3, column: 9, label: "2.6-3㎡" },
      { max: 3.5, column: 10, label: "3.1-3.5㎡" },
      { max: 4, column: 11, label: "3.6-4㎡" },
    ];
    const band = bands.find((entry) => area <= entry.max);
    if (band) return result(maxAt(itemId, band.column), itemId, `总面积${area.toFixed(3)}㎡｜${band.label}最高价`);
    const rate = Math.max(input.length, input.width) > 1.5 ? 42 : 38;
    return result(area * rate, itemId, `4㎡以上按${rate}元/㎡ × ${area.toFixed(3)}㎡`);
  }

  function bannerPrice(input) {
    const area = input.length * input.width * input.quantity;
    const bands = [
      { max: 1, column: 5, total: true, label: "1㎡以下" },
      { max: 2, column: 6, total: true, label: "1-2㎡" },
      { max: 4, column: 7, total: true, label: "3-4㎡" },
      { max: 6, column: 8, total: true, label: "5-6㎡" },
      { max: 8, column: 9, total: true, label: "7-8㎡" },
      { max: 10, column: 10, label: "9-10㎡" },
      { max: 14, column: 11, label: "10-14㎡" },
      { max: 19, column: 12, label: "15-19㎡" },
      { max: 29, column: 13, label: "20-29㎡" },
      { max: 49, column: 14, label: "30-49㎡" },
      { max: Infinity, column: 15, label: "50㎡以上" },
    ];
    const band = bands.find((entry) => area <= entry.max);
    const high = maxAt("price-71", band.column);
    return result(band.total ? high : high * area, "price-71", `550加厚布｜${band.label}：${high}元${band.total ? "" : `/㎡ × ${area.toFixed(3)}㎡`}`);
  }

  function ktBoardPrice(input) {
    const areaEach = input.length * input.width;
    if (areaEach > 2.88) return result(areaEach * input.quantity * 40, "price-33", `超过3㎡按40元/㎡ × ${areaEach.toFixed(3)}㎡ × ${input.quantity}张`);
    const bands = [
      { max: 0.35, id: "price-24", qty: 10 },
      { max: 0.54, id: "price-25", qty: 10 },
      { max: 0.96, id: "price-28", qty: 3 },
      { max: 1.2, id: "price-29", qty: 2 },
      { max: 1.8, id: "price-30", qty: 1 },
      { max: 2.4, id: "price-31", qty: 1 },
      { max: 2.88, id: "price-32", qty: 1 },
    ];
    const band = bands.find((entry) => areaEach <= entry.max);
    return band ? rowQuantityTotal(band.id, input.quantity, band.qty) : null;
  }

  function copyPaperPrice(input) {
    const bands = [
      { max: 100, column: 5, label: "100张" },
      { max: 200, column: 6, label: "200张" },
      { max: 500, column: 7, label: "500张" },
      { max: 1000, column: 8, label: "1000张" },
      { max: 2000, column: 9, label: "2000张" },
    ];
    return thresholdTable("price-120", input.quantity, bands);
  }

  function calculate(input) {
    const normalized = {
      ...input,
      length: Math.max(0, number(input.length)),
      width: Math.max(0, number(input.width)),
      quantity: Math.max(1, Math.floor(number(input.quantity, 1))),
      styles: Math.max(1, Math.floor(number(input.styles, 1))),
      innerPages: Math.max(0, Math.floor(number(input.innerPages))),
      optionNames: Array.isArray(input.optionNames) ? input.optionNames : [],
    };
    if (cookbookSources[normalized.productId]) return cookbookPrice(normalized, cookbookSources[normalized.productId]);
    switch (normalized.productId) {
      case "additional-inner-pages": return additionalInnerPagesPrice(normalized);
      case "laminated-menu": return laminatedMenuPrice(normalized);
      case "pvc-menu": return pvcMenuPrice(normalized);
      case "photo-menu":
      case "sticker-poster":
      case "photo-poster":
      case "static-cling":
      case "one-way-vision":
      case "car-sticker":
      case "glass-lettering": return photoPrice(normalized);
      case "photo-paper-menu":
      case "indoor-light-film-menu":
      case "indoor-light-film": return indoorLightPrice(normalized);
      case "checklist-menu":
      case "flyer": return checklistPrice(normalized);
      case "multipart-form": return multipartPrice(normalized);
      case "takeaway-card": return takeawayPrice(normalized);
      case "voucher": return voucherPrice(normalized);
      case "business-card": return cardPrice(normalized, "price-76");
      case "table-sign-menu": return tableSignPrice(normalized);
      case "banner-menu":
      case "banner": return bannerPrice(normalized);
      case "kt-board-menu":
      case "kt-board-poster": return ktBoardPrice(normalized);
      case "backlit-fabric":
      case "stretch-lightbox-fabric":
      case "canvas": return fabricPrice(normalized);
      case "copy-paper-print": return copyPaperPrice(normalized);
      default: return null;
    }
  }

  window.ORIGINAL_PRICE_ENGINE = {
    calculate,
    supports(productId) {
      return supportedIds.has(productId);
    },
    noteFor(productId) {
      return proxyNotes[productId] || "";
    },
  };
})();
