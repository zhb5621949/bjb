(function () {
  "use strict";

  const aSeriesBook = [
    { id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 },
    { id: "large", label: "大号｜25 × 36 cm", length: 0.36, width: 0.25 },
    { id: "a3", label: "A3｜29.7 × 42 cm", length: 0.42, width: 0.297 },
  ];
  const albumSpecs = [
    { id: "a4", label: "A4｜20 × 28.5 cm左右", length: 0.285, width: 0.2 },
    { id: "a5", label: "A5｜14 × 20 cm左右", length: 0.2, width: 0.14 },
    { id: "custom", label: "定制尺寸", custom: true },
  ];
  const customSpec = [{ id: "custom", label: "定制尺寸", custom: true }];
  const posterSpecs = [
    { id: "30x50", label: "30 × 50 cm", length: 0.5, width: 0.3 },
    { id: "40x60", label: "40 × 60 cm", length: 0.6, width: 0.4 },
    { id: "50x70", label: "50 × 70 cm", length: 0.7, width: 0.5 },
    { id: "60x90", label: "60 × 90 cm", length: 0.9, width: 0.6 },
    { id: "custom", label: "定制尺寸", custom: true },
  ];

  window.PRODUCT_CATALOG = [
    {
      id: "hard-ring-cookbook", category: "cookbook", name: "硬壳铁环款式", rate: 58, minimum: 50, tone: "ink",
      shellMaterial: "① 硬质外壳，表面皮革；② 硬质外壳，表面覆哑膜",
      innerMaterial: "加厚内页，中间 1 毫米 PVC，两面铜版纸双面亮膜",
      shellProcess: "雕刻 / 彩印 / UV 打印",
      materialProcess: "铜版纸包裹 PVC，内页厚实档次高；数码机器喷印画面",
      specs: aSeriesBook,
    },
    {
      id: "deluxe-inner-nail-cookbook", category: "cookbook", name: "精装内钉菜谱", rate: 48, minimum: 50, tone: "steel",
      shellMaterial: "① 硬质外壳皮革；② 硬质外壳覆哑膜；③ 软质皮革",
      innerMaterial: "250 克铜版纸双面亮膜",
      shellProcess: "雕刻 / 彩印 / UV 打印",
      materialProcess: "数码机器喷印画面",
      specs: aSeriesBook,
    },
    {
      id: "deluxe-outer-nail-cookbook", category: "cookbook", name: "精装外钉菜谱", rate: 48, minimum: 50, tone: "gold",
      shellMaterial: "① 硬质外壳皮革；② 硬质外壳覆哑膜；③ 软质皮革",
      innerMaterial: "250 克铜版纸双面亮膜",
      shellProcess: "雕刻 / 彩印 / UV 打印",
      materialProcess: "数码机器喷印画面",
      specs: aSeriesBook,
    },
    {
      id: "butterfly-cookbook", category: "cookbook", name: "蝴蝶装菜谱", rate: 68, minimum: 50, tone: "violet",
      shellMaterial: "① 硬质外壳皮革；② 硬质外壳覆哑膜；③ 软质皮革",
      innerMaterial: "① 加厚内页：中间 1 毫米 PVC，两面铜版纸双面亮膜；② 250 克铜版纸双面亮膜",
      shellProcess: "雕刻 / 彩印 / UV 打印",
      materialProcess: "加厚内页 / 铜版纸内页",
      specs: aSeriesBook,
    },
    {
      id: "spiral-cookbook", category: "cookbook", name: "线圈装菜谱本", rate: 55, minimum: 50, tone: "blue",
      shellMaterial: "无外壳；封面和封底加一层磨砂封皮",
      innerMaterial: "250 克铜版纸双面亮膜",
      shellProcess: "彩印",
      materialProcess: "数码机器印刷",
      specs: aSeriesBook,
    },
    {
      id: "laminated-spiral-cookbook", category: "cookbook", name: "塑封线圈菜谱", rate: 50, minimum: 40, tone: "cyan",
      shellMaterial: "无外壳；封面、封底和内页使用同样材料",
      innerMaterial: "250 克铜版纸双面亮膜",
      shellProcess: "彩印",
      materialProcess: "数码机器印刷",
      specs: aSeriesBook,
    },
    {
      id: "saddle-album-cookbook", category: "cookbook", name: "骑马钉画册菜谱", rate: 42, minimum: 50, tone: "coral",
      shellMaterial: "无外壳；封面 300 克，内页 200 克铜版纸覆膜",
      innerMaterial: "200 克铜版纸亮膜或哑膜",
      shellProcess: "无外壳",
      materialProcess: "数码机器印刷",
      specs: albumSpecs,
    },
    {
      id: "perfect-album-cookbook", category: "cookbook", name: "胶装画册菜谱", rate: 48, minimum: 50, tone: "canvas",
      shellMaterial: "无外壳；封面 300 克，内页 200 克铜版纸覆膜",
      innerMaterial: "200 克铜版纸亮膜或哑膜",
      shellProcess: "无外壳",
      materialProcess: "数码机器印刷",
      specs: albumSpecs,
    },
    {
      id: "folded-cookbook", category: "cookbook", name: "三折/四折页菜谱", rate: 36, minimum: 40, tone: "sun",
      shellMaterial: "无外壳；封面和内页为 300 克铜版纸覆亮膜",
      innerMaterial: "300 克铜版纸覆亮膜",
      shellProcess: "无外壳",
      materialProcess: "数码印刷",
      specs: [
        { id: "a4", label: "A4｜20 × 28.5 cm左右", length: 0.285, width: 0.2 },
        { id: "a3", label: "A3｜28 × 42 cm左右", length: 0.42, width: 0.28 },
        { id: "custom", label: "定制｜铺开不超过 30 × 86 cm", custom: true },
      ],
    },

    { id: "laminated-menu", category: "menu", name: "塑封菜单", rate: 45, minimum: 40, tone: "mint", innerMaterial: "250 克铜版纸", materialProcess: "数码机器印刷", specs: [
      { id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 }, { id: "a3", label: "A3｜29.7 × 42 cm", length: 0.42, width: 0.297 },
    ] },
    { id: "pvc-menu", category: "menu", name: "PVC菜单", rate: 68, minimum: 50, tone: "ice", innerMaterial: "1 毫米厚度 PVC", materialProcess: "数码机器印刷", specs: [
      { id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 }, { id: "a5", label: "A5｜14 × 20 cm左右", length: 0.2, width: 0.14 }, { id: "a3", label: "A3｜29.7 × 42 cm", length: 0.42, width: 0.297 },
    ] },
    { id: "photo-menu", category: "menu", name: "写真菜单", rate: 38, minimum: 40, tone: "rose", innerMaterial: "防水防晒 PP 海报纸材料", materialProcess: "写真机印刷", specs: customSpec },
    { id: "photo-paper-menu", category: "menu", name: "相纸菜单", rate: 38, minimum: 40, tone: "blue", innerMaterial: "防水防晒相纸材料", materialProcess: "写真机印刷", specs: customSpec },
    { id: "checklist-menu", category: "menu", name: "勾选菜单", rate: 35, minimum: 40, tone: "lime", innerMaterial: "行标 128 克 / 157 克铜版纸", materialProcess: "印刷机印刷", specs: [
      { id: "a4", label: "A4｜20 × 28.5 cm左右", length: 0.285, width: 0.2 }, { id: "a3", label: "A3｜30 × 42 cm左右", length: 0.42, width: 0.3 },
    ] },
    { id: "multipart-form", category: "menu", name: "联单", rate: 32, minimum: 40, tone: "steel", innerMaterial: "80 克双胶纸", materialProcess: "印刷机印刷", specs: [
      { id: "10x14", label: "10 × 14 cm", length: 0.14, width: 0.1 }, { id: "14x21", label: "14 × 21 cm", length: 0.21, width: 0.14 }, { id: "21x28-5", label: "21 × 28.5 cm", length: 0.285, width: 0.21 },
    ] },
    { id: "indoor-light-film-menu", category: "menu", name: "室内灯片菜单", rate: 45, minimum: 50, tone: "amber", innerMaterial: "室内灯片材料", materialProcess: "写真机印刷", specs: [
      { id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 }, { id: "a3", label: "A3｜29.7 × 42 cm", length: 0.42, width: 0.297 }, { id: "custom", label: "定制尺寸", custom: true },
    ] },
    { id: "takeaway-card", category: "menu", name: "外卖卡", rate: 32, minimum: 40, tone: "coral", innerMaterial: "300 克铜版纸", materialProcess: "印刷机印刷", specs: [
      { id: "card", label: "9 × 5.4 cm", length: 0.09, width: 0.054 }, { id: "9x11", label: "9 × 11 cm", length: 0.11, width: 0.09 }, { id: "10x15", label: "10 × 15 cm", length: 0.15, width: 0.1 },
    ] },
    { id: "voucher", category: "menu", name: "代金券", rate: 32, minimum: 40, tone: "violet", innerMaterial: "300 克铜版纸", materialProcess: "印刷机印刷", specs: [
      { id: "card", label: "9 × 5.4 cm", length: 0.09, width: 0.054 }, { id: "9x11", label: "9 × 11 cm", length: 0.11, width: 0.09 }, { id: "5-4x18", label: "5.4 × 18 cm", length: 0.18, width: 0.054 },
    ] },
    { id: "table-sign-menu", category: "menu", name: "台签菜单", rate: 55, minimum: 50, tone: "gold", innerMaterial: "250 克铜版纸双面亮膜", materialProcess: "数码机器印刷", specs: [
      { id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 }, { id: "a3", label: "A3｜29.7 × 42 cm", length: 0.42, width: 0.297 },
    ] },
    { id: "banner-menu", category: "menu", name: "喷绘布菜单", rate: 35, minimum: 40, tone: "red", innerMaterial: "喷绘布", materialProcess: "喷绘机印刷", specs: customSpec },
    { id: "kt-board-menu", category: "menu", name: "KT板菜单", rate: 55, minimum: 50, tone: "pearl", innerMaterial: "5 毫米厚度 KT 板", materialProcess: "写真机印刷", specs: customSpec },

    { id: "backlit-fabric", category: "other", name: "卡布灯箱布", rate: 58, minimum: 50, tone: "canvas2", innerMaterial: "灯箱软膜", materialProcess: "写真机印刷", specs: customSpec },
    { id: "stretch-lightbox-fabric", category: "other", name: "拉布灯箱布", rate: 58, minimum: 50, tone: "canvas", innerMaterial: "灯箱软膜", materialProcess: "写真机印刷", specs: customSpec },
    { id: "canvas", category: "other", name: "油画布", rate: 55, minimum: 50, tone: "oil", innerMaterial: "油画布", materialProcess: "写真机印刷", specs: customSpec },
    { id: "business-card", category: "other", name: "名片", rate: 35, minimum: 40, tone: "ink", innerMaterial: "300 克名片纸", materialProcess: "印刷机印刷", specs: [{ id: "card", label: "名片｜9 × 5.4 cm", length: 0.09, width: 0.054 }] },
    { id: "flyer", category: "other", name: "宣传单", rate: 32, minimum: 40, tone: "sand", innerMaterial: "行标 128 克 / 157 克铜版纸", materialProcess: "印刷机印刷", specs: [
      { id: "a4", label: "A4｜20 × 28.5 cm左右", length: 0.285, width: 0.2 }, { id: "a3", label: "A3｜28.5 × 40 cm左右", length: 0.4, width: 0.285 },
    ] },
    { id: "kt-board-poster", category: "other", name: "KT板海报", rate: 55, minimum: 50, tone: "pearl", innerMaterial: "5 毫米厚度 KT 板", materialProcess: "写真机印刷", specs: posterSpecs },
    { id: "sticker-poster", category: "other", name: "不干胶海报", rate: 42, minimum: 40, tone: "cyan", innerMaterial: "不干胶", materialProcess: "印刷机印刷", specs: posterSpecs },
    { id: "photo-poster", category: "other", name: "写真海报", rate: 36, minimum: 40, tone: "rose", innerMaterial: "防水防晒 PP 海报纸材料", materialProcess: "写真机印刷", specs: [
      ...posterSpecs.slice(0, 4),
      { id: "80x100", label: "80 × 100 cm", length: 1, width: 0.8 },
      { id: "80x120", label: "80 × 120 cm", length: 1.2, width: 0.8 },
      { id: "100x150", label: "100 × 150 cm", length: 1.5, width: 1 },
      { id: "custom", label: "定制尺寸", custom: true },
    ] },
    { id: "banner", category: "other", name: "喷绘布", rate: 35, minimum: 40, tone: "red", innerMaterial: "520 厚度 / 550 加厚喷绘布", materialProcess: "喷绘机印刷", specs: customSpec },
    { id: "indoor-light-film", category: "other", name: "室内灯片", rate: 45, minimum: 50, tone: "sun", innerMaterial: "室内灯片材料", materialProcess: "写真机印刷", specs: customSpec },
    { id: "static-cling", category: "other", name: "静电贴", rate: 40, minimum: 40, tone: "mint", innerMaterial: "玻璃贴 / 透明贴", materialProcess: "写真机印刷", specs: customSpec },
    { id: "one-way-vision", category: "other", name: "单透贴", rate: 48, minimum: 50, tone: "smoke", innerMaterial: "单透贴", materialProcess: "写真机印刷", specs: customSpec },
    { id: "car-sticker", category: "other", name: "车贴", rate: 46, minimum: 50, tone: "blue", innerMaterial: "透明车贴 / 普通车贴", materialProcess: "写真机印刷", specs: customSpec },
    { id: "glass-lettering", category: "other", name: "玻璃刻字", rate: 50, minimum: 50, tone: "silver", innerMaterial: "普通贴 / 反光贴", materialProcess: "刻字机", specs: [{ id: "custom", label: "小尺寸 / 定制", custom: true }] },
    { id: "copy-paper-print", category: "other", name: "打印纸打印", rate: 25, minimum: 40, tone: "ice", innerMaterial: "70 克打印纸", materialProcess: "打印机", specs: [{ id: "a4", label: "A4｜21 × 29.7 cm", length: 0.297, width: 0.21 }] },
  ];
})();
