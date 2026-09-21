/**
 * DiceBear pixel-art 關主圖片工具
 * 使用 DiceBear v9 API 產生像素風格頭像
 * 預先定義 100 個固定 seed，確保每關關主固定
 */

const BASE_URL = 'https://api.dicebear.com/9.x/pixel-art/svg'

// 100 個固定 seed，對應 100 位不同關主
const BOSS_SEEDS = Array.from({ length: 100 }, (_, i) => `pixelboss-${i}`)

/**
 * 取得指定 index 的關主圖片 URL
 * @param {number} index - 關卡索引（0-based），自動 mod 100
 * @returns {string} DiceBear SVG URL
 */
export function getBossUrl(index) {
  const seed = BOSS_SEEDS[index % 100]
  return `${BASE_URL}?seed=${encodeURIComponent(seed)}&backgroundColor=transparent&size=128`
}

/**
 * 預先載入所有 100 張關主圖片到瀏覽器快取
 * 在 App 初始化時呼叫，確保遊戲中不會有載入延遲
 * @returns {string[]} 所有圖片 URL 陣列
 */
export function preloadBossImages() {
  return BOSS_SEEDS.map((seed, i) => {
    const url = getBossUrl(i)
    // 建立 Image 物件觸發瀏覽器預載
    const img = new Image()
    img.src = url
    return url
  })
}

/**
 * 取得關主顯示名稱
 * @param {number} index
 * @returns {string}
 */
export function getBossName(index) {
  const names = [
    'PIXEL SLIME',  'DATA WITCH',   'LOGIC DRAGON', 'MEMORY BEAST',
    'ALGO KNIGHT',  'BUG DEMON',    'CODE TROLL',   'STACK GIANT',
    'LOOP SPIRIT',  'NULL SHADE',   'SORT WIZARD',  'HASH PHANTOM',
    'NEON SHARK',   'VOID KRAKEN',  'CYBER SPHINX', 'IRON GOLEM',
    'FIRE DRAKE',   'ICE QUEEN',    'SHADOW ROGUE', 'THUNDER BIRD',
    'STONE GIANT',  'VOID MAGE',    'CYBER KNIGHT', 'NEON GHOST',
    'ACID TROLL',   'MOON SPIRIT',  'SUN WARRIOR',  'STAR DEMON',
    'WIND ARCHER',  'DARK WIZARD',
  ]
  return names[index % names.length]
}
