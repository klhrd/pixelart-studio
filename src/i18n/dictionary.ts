export const zhTW: Record<string, string> = {
  // TopBar
  'Computing': '運算中',
  'Toggle compare view': '切換對比檢視',
  'Compare (C)': '對比 (C)',
  'Exit fullscreen': '結束全螢幕',
  'Enter fullscreen': '進入全螢幕',
  'Fullscreen (F)': '全螢幕 (F)',
  'Undo': '復原',
  'Undo (Ctrl+Z)': '復原 (Ctrl+Z)',
  'Redo': '重做',
  'Redo (Ctrl+Y)': '重做 (Ctrl+Y)',
  'Language': '語言',

  // App shell
  'Render error': '渲染錯誤',
  'Reload View': '重新載入',
  'Skip to content': '跳至內容',
  'Parameter selector': '參數選擇器',
  'Grid view': '格狀檢視',
  'List view': '清單檢視',
  'Image preview canvas': '影像預覽畫布',
  'Preview of {engine} styling result': '{engine} 樣式結果預覽',

  // Sheets / nav
  'Algorithms': '演算法',
  'Tune': '調整',
  'Export': '匯出',
  'Custom Palette': '自訂調色盤',
  'Modules': '模組',
  'Close': '關閉',

  // Drop zone
  'Drop an image to begin': '拖入圖片開始',
  'Everything runs locally in your browser. Your image never leaves this device.':
    '一切都在你的瀏覽器本機執行，圖片不會離開你的裝置。',
  'Select Image': '選擇圖片',
  'Load Sample': '載入範例',

  // Export sheet
  'Output': '輸出',
  'Resolution Scale': '解析度倍率',
  'Custom scale': '自訂倍率',
  'File Name': '檔名',
  'Saved': '已儲存',
  'Export PNG': '匯出 PNG',
  'Export SVG': '匯出 SVG',
  'Upload': '上傳',
  'Link Copied': '已複製連結',
  'Shared': '已分享',
  'Share Link': '分享連結',
  'Share Link packs every setting and the palette into the URL. The recipient opens it with any image to reproduce this exact look.':
    '分享連結會把每項設定與調色盤打包進網址。對方用任何圖片開啟即可重現這個效果。',
  'Load an image and wait for processing to finish.':
    '載入圖片並等待處理完成。',

  // Tune sheet
  'General Adjustments': '一般調整',
  'Brightness · Contrast · Saturation · Palette': '亮度 · 對比 · 飽和度 · 調色盤',
  'Engine Settings': '引擎設定',
  'Image Adjustments': '影像調整',

  // General labels
  'Brightness': '亮度',
  'Contrast': '對比',
  'Saturation': '飽和度',

  // Engine panel section titles
  'Grid': '網格',
  'Palette': '調色盤',
  'Moon Phase': '月相',
  'Truchet Tiles': 'Truchet 磚',
  'Voronoi / Delaunay': 'Voronoi / Delaunay',
  'Braille Raster': '盲文點陣',
  'Floyd-Steinberg': 'Floyd–Steinberg',
  'Stippling': '點描',
  'Flow Field': '流場',
  'Scanline CRT': '掃描線 CRT',
  'Hanzi Glyphs': '漢字字符',
  'String Art': '釘線藝術',
  'Turing Patterns': '圖靈圖樣',
  'Pixel Sorting': '像素排序',
  'Hex Dump': '十六進位傾印',
  'Ben-Day Dots': 'Ben-Day 網點',
  'Wave Interference': '波干涉',
  'Topographic Map': '等高線地形圖',
  'Cross-Hatching': '交叉排線',
  'Glyph Halftone': '字符半色調',
  'Moiré Interference': '摩爾紋干涉',

  // Engine panel labels
  'Reset': '重設',
  'Cell Size': '網格大小',
  'Edge Sensitivity': '邊緣靈敏度',
  'Edge Bias': '邊緣偏重',
  'Staggered Grid': '交錯網格',
  'Animate Phase': '動畫相位',
  'Animation Speed': '動畫速度',
  'Phase Offset': '相位偏移',
  'Seed': '隨機種子',
  'New Seed': '新種子',
  'Stroke Width': '筆畫寬度',
  'Blank Above': '高於此值留白',
  'Blank Threshold': '留白閾值',
  'Edge Site Bias': '邊緣站點偏重',
  'Edge Width': '邊緣寬度',
  'Off': '關閉',
  'Threshold': '閾值',
  'Invert': '反相',
  'Serpentine Scan': '蛇行掃描',
  'Dot Size': '點大小',
  'Relax Steps': '鬆弛次數',
  'Particles': '粒子數',
  'Trace Length': '軌跡長度',
  'Noise Blend': '雜訊混合',
  'Glow': '光暈',
  'Aberration': '色差',
  'Glitch': '故障',
  'Nails': '釘數',
  'Threads': '線數',
  'Frames': '幀數',
  'Feed': '進食',
  'Kill': '殺除',
  'Horizontal': '水平',
  'Vertical': '垂直',
  'Dark→Bright': '暗→亮',
  'Bright→Dark': '亮→暗',
  'Dot Scale': '點比例',
  'Amplitude': '振幅',
  'Wavelength': '波長',
  'Levels': '層級',
  'Shape': '形狀',
  'Rings': '同心圓',
  'Lines': '線條',
  'Spiral': '螺旋',
  'Frequency': '頻率',
  'Phase Shift': '相位偏移',
  'Density': '密度',
  'Pixel Size': '像素大小',
  'Scan Pitch': '掃描間距',
  'Glyph Size': '字符大小',
  'Font Size': '字級',
  'Screen Pitch': '網點密度',
  'Line Spacing': '線間距',
  'Smoothing': '平滑',
  'Line Width': '線寬',
  'Grating': '光柵',

  // Glyph shapes
  'Star': '星形',
  'Cross': '十字',
  'Diamond': '菱形',
  'Circle': '圓形',
  'Tri': '三角',
  'Square': '方形',
  'Smiley': '笑臉',

  // Engine descriptions
  'Each cell maps a 2x4 pixel block onto the Unicode Braille range U+2800-U+28FF, rendered as geometric dots.':
    '每個網格把 2×4 像素區塊對應到 Unicode 盲文範圍 U+2800–U+28FF，以幾何點呈現。',
  'Quantization error is diffused to neighboring pixels with weights 7/16, 3/16, 5/16 and 1/16. Raising Cell Size above 14 enlarges the pixel blocks for a chunkier look.':
    '量化誤差以 7/16、3/16、5/16、1/16 的權重擴散到鄰近像素。把網格大小提高到 14 以上會放大像素區塊，呈現更粗糙的效果。',
  'Cell Size sets point density (smaller cells = more dots). Dot Size scales each mark. Weighted Centroidal Voronoi relaxation drifts points toward mass centers: dark regions crowd with dots, bright regions stay empty.':
    '網格大小決定點的密度（網格越小點越多）。點大小調整每個點的尺寸。加權質心 Voronoi 鬆弛會把點推向質量中心：暗部點密集、亮部留白。',
  'Particles ride a vector field built from image gradients blended with Perlin-style noise, leaving silky ink trails.':
    '粒子沿著由影像梯度混合 Perlin 風格雜訊構成的向量場移動，留下絲滑的墨跡。',
  'Scanline pitch follows Cell Size. Rows are darkened and glowing bands by luminance, with RGB channel shift and seeded glitch blocks.':
    '掃描線間距依網格大小。各列依亮度變暗並產生光暈帶，另有 RGB 色版位移與以種子產生的故障區塊。',
  'Each cell maps its darkness onto one of twelve Chinese characters ordered by stroke density, from 一 to 鑫. Cell Size sets the glyph size.':
    '每個網格把其暗度對應到十二個依筆畫密度排序的漢字之一，從「一」到「鑫」。網格大小決定字符大小。',
  'A greedy thread is pulled between perimeter nails to cover the darkest pixels first — a single continuous string weaving a portrait. Cell Size scales the line width.':
    '貪婪地在圓周釘子之間拉線，優先覆蓋最暗的像素——以單一條連續的線編織出圖像。網格大小調整線寬。',
  'Gray-Scott reaction-diffusion: chemicals A and B diffuse and react, growing organic cellular patterns guided by image luminance.':
    'Gray-Scott 反應擴散：化學物質 A 與 B 擴散並反應，受影像亮度引導長出有機的細胞圖樣。',
  'Pixel runs above/below the threshold are sorted by luminance, melting the image into horizontal or vertical streaks.':
    '高於／低於閾值的像素連續段依亮度排序，把影像融化成水平或垂直的條紋。',
  'Every cell prints the average pixel color as a raw hex code (#RRGGBB). Text brightness follows luminance — bright areas glow with light code, shadows stay dark. Cell Size sets the font size.':
    '每個網格以原始十六進位碼（#RRGGBB）印出該區塊的平均顏色。文字亮度隨亮度變化——亮部以淺色碼發光，暗部維持深色。網格大小決定字級。',
  'Naive CMYK separation printed as angled dot screens (C 15°, M 75°, Y 0°, K 45°) overprinted with multiply blending for that retro comic feel. Cell Size sets the screen pitch.':
    '以簡易 CMYK 分色印成帶角度的網點（C 15°、M 75°、Y 0°、K 45°），再以正片疊底混合疊印，營造復古漫畫感。網格大小決定網點密度。',
  'Parallel sine lines whose local amplitude follows column luminance. Push wavelength near the line spacing to trigger moiré interference. Cell Size sets the line spacing.':
    '平行的正弦線，其局部振幅隨該行亮度變化。把波長調到接近線間距時會產生摩爾紋干涉。網格大小決定線間距。',
  'Grayscale is treated as a smoothed heightmap and Marching Squares extracts contour lines at fixed elevation intervals. Cell Size scales the smoothing radius.':
    '把灰階視為平滑後的高度圖，以行進方格法在固定的高度間距上取出等高線。網格大小調整平滑半徑。',
  'Engraving-style linework: bright cells get a single sparse pass, while darker cells stack up to four cross-hatched layers at 0°, 45°, 90° and 135°. Cell Size sets the grid.':
    '版畫風格線條：亮的網格只有一道稀疏排線，較暗的網格則以 0°、45°、90°、135° 疊上最多四層交叉排線。網格大小決定網格。',
  'Each cell stamps the chosen glyph scaled by darkness — bright areas shrink to nothing, shadows swell to fill. Cell Size sets the grid.':
    '每個網格蓋上依暗度縮放的選定字符——亮部縮到消失，暗部脹滿整個網格。網格大小決定網格。',
  'High-frequency optical grating whose phase is shifted by image luminance, warping the pattern around contours. Cell Size scales the grating.':
    '高頻光柵，其相位隨影像亮度偏移，使圖樣沿著輪廓扭曲。網格大小調整光柵密度。',

  // Palette picker
  'Manage': '管理',
  'Unstar palette': '取消標記調色盤',
  'Star palette': '標記調色盤',
  'Move up': '上移',
  'Move down': '下移',
  'Edit {name}': '編輯 {name}',
  'Delete {name}': '刪除 {name}',
  'Palette Manager': '調色盤管理',
  'New Custom Palette': '新增自訂調色盤',
  'Starred palettes appear in the quick picker. Use the arrows to reorder — order is fully manual, nothing is sorted alphabetically.':
    '已加星的調色盤會出現在快速選取區。用箭頭重新排序——順序完全手動，不會依字母排序。',

  // Custom palette sheet
  'Editing existing palette': '正在編輯既有調色盤',
  'Discard': '捨棄',
  'Name': '名稱',
  'Custom palette': '自訂調色盤',
  'Color Stops': '顏色停點',
  'Color {n}': '顏色 {n}',
  'Remove color': '移除顏色',
  'Add Color': '新增顏色',
  'Update Palette': '更新調色盤',
  'Save to History': '儲存至歷史',
  'History': '歷史',

  // Engine names (only those that differ from the section titles above)
  'Moon Phase Halftone': '月相半色調',
  'Truchet Tiling': 'Truchet 拼磚',
  'Voronoi / Low-Poly': 'Voronoi／低多邊形',
  'Error Diffusion': '誤差擴散',

  // Engine taglines
  'Sobel-oriented lunar density field': '以 Sobel 導向的月相密度場',
  'Contrast-woven geometric arcs': '以對比交織的幾何弧線',
  'Delaunay feature triangulation': 'Delaunay 特徵三角化',
  '2x4 dot Unicode density art': '2×4 點 Unicode 密度藝術',
  'Floyd-Steinberg dithering': 'Floyd–Steinberg 抖動',
  'Weighted Voronoi point painting': '加權 Voronoi 點繪',
  'Gradient streamline particles': '梯度流線粒子',
  'Retro glitch halftone': '復古故障半色調',
  'Stroke-density character map': '筆畫密度字符對應',
  'Pixel values as raw hex codes': '像素值轉原始十六進位碼',
  'CMYK comic print screens': 'CMYK 漫畫印刷網點',
  'Luminance-modulated sine field': '亮度調變正弦場',
  'Marching squares contour lines': '行進方格等高線',
  'Greedy nail-and-thread portrait': '貪婪釘線肖像',
  'Gray-Scott reaction-diffusion': 'Gray-Scott 反應擴散',
  'Cyberpunk glitch sort': '賽博龐克故障排序',
  'Layered engraving linework': '分層版畫線條',
  'Custom shapes scaled by luminance': '依亮度縮放的自訂形狀',
  'Op-art optical phase patterns': '歐普藝術光學相位圖樣',
};
