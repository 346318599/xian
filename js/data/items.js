// 仙途 - 道具、法器、商店数据

const ITEM_TYPES = {
    CONSUMABLE: 'consumable',
    EQUIPMENT: 'equipment',
    MATERIAL: 'material',
    TICKET: 'ticket',
    PILL: 'pill'
};

const ITEM_DB = {
    // 回血药
    small_hp_pill: {
        id: 'small_hp_pill',
        name: '小还丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.COMMON,
        price: 30,
        effect: { healPercent: 20 },
        desc: '回复20%最大生命值'
    },
    medium_hp_pill: {
        id: 'medium_hp_pill',
        name: '大还丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.UNCOMMON,
        price: 80,
        effect: { healPercent: 50 },
        desc: '回复50%最大生命值'
    },
    full_hp_pill: {
        id: 'full_hp_pill',
        name: '九转金丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.RARE,
        price: 200,
        effect: { healPercent: 100 },
        desc: '回复100%最大生命值'
    },

    // 内力药
    small_mp_pill: {
        id: 'small_mp_pill',
        name: '回气散',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.COMMON,
        price: 25,
        effect: { mpPercent: 30 },
        desc: '回复30%最大内力'
    },
    medium_mp_pill: {
        id: 'medium_mp_pill',
        name: '聚灵丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.UNCOMMON,
        price: 60,
        effect: { mpPercent: 60 },
        desc: '回复60%最大内力'
    },

    // 增益符
    atk_talisman: {
        id: 'atk_talisman',
        name: '攻击符',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.UNCOMMON,
        price: 70,
        effect: { damageBoost: 0.2, duration: 3 },
        desc: '3回合内伤害+20%'
    },
    def_talisman: {
        id: 'def_talisman',
        name: '防御符',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.UNCOMMON,
        price: 70,
        effect: { defenseBoost: 0.3, duration: 3 },
        desc: '3回合内防御+30%'
    },

    // 复活
    revive_pill: {
        id: 'revive_pill',
        name: '还魂丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.EPIC,
        price: 500,
        effect: { revive: true },
        desc: '死亡时自动复活，回复50%生命'
    },

    // 恢复 PP 值
    pp_pill_small: {
        id: 'pp_pill_small',
        name: '凝神散',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.COMMON,
        price: 50,
        effect: { restorePp: 2 },
        desc: '恢复所有技能 2 点 PP'
    },
    pp_pill_medium: {
        id: 'pp_pill_medium',
        name: '凝神丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.UNCOMMON,
        price: 120,
        effect: { restorePp: 5 },
        desc: '恢复所有技能 5 点 PP'
    },
    pp_pill_full: {
        id: 'pp_pill_full',
        name: '九转凝神丹',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITIES.RARE,
        price: 250,
        effect: { restoreAllPp: true },
        desc: '恢复所有技能全部 PP'
    },

    // 抽奖券
    normal_ticket: {
        id: 'normal_ticket',
        name: '普通抽奖券',
        type: ITEM_TYPES.TICKET,
        rarity: RARITIES.COMMON,
        price: 50,
        desc: '可在普通卡池抽卡1次'
    },
    advanced_ticket: {
        id: 'advanced_ticket',
        name: '高级抽奖券',
        type: ITEM_TYPES.TICKET,
        rarity: RARITIES.RARE,
        price: 150,
        desc: '可在高级卡池抽卡1次'
    },

    // 属性丹
    hp_pill: {
        id: 'hp_pill',
        name: '血灵丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.RARE,
        price: 300,
        effect: { attr: 'hp', value: 2 },
        desc: '永久+2血量'
    },
    str_pill: {
        id: 'str_pill',
        name: '力神丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.RARE,
        price: 300,
        effect: { attr: 'strength', value: 2 },
        desc: '永久+2力量'
    },
    inner_pill: {
        id: 'inner_pill',
        name: '聚灵丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.RARE,
        price: 300,
        effect: { attr: 'inner', value: 2 },
        desc: '永久+2内力'
    },
    body_pill: {
        id: 'body_pill',
        name: '淬体丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.RARE,
        price: 300,
        effect: { attr: 'body', value: 2 },
        desc: '永久+2体质'
    },
    agi_pill: {
        id: 'agi_pill',
        name: '风行丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.RARE,
        price: 300,
        effect: { attr: 'agility', value: 2 },
        desc: '永久+2敏捷'
    },
    luck_pill: {
        id: 'luck_pill',
        name: '气运丹',
        type: ITEM_TYPES.PILL,
        rarity: RARITIES.EPIC,
        price: 500,
        effect: { attr: 'luck', value: 2 },
        desc: '永久+2气运'
    }
};

// 法器数据库
const EQUIPMENT_DB = {
    iron_sword: {
        id: 'iron_sword',
        name: '精铁剑',
        type: ITEM_TYPES.EQUIPMENT,
        rarity: RARITIES.UNCOMMON,
        price: 120,
        effect: { strength: 5 },
        desc: '力量+5'
    },
    spirit_ring: {
        id: 'spirit_ring',
        name: '聚灵戒',
        type: ITEM_TYPES.EQUIPMENT,
        rarity: RARITIES.RARE,
        price: 250,
        effect: { inner: 8, mpRegen: 5 },
        desc: '内力+8，每回合回复5内力'
    },
    jade_pendant: {
        id: 'jade_pendant',
        name: '护身玉佩',
        type: ITEM_TYPES.EQUIPMENT,
        rarity: RARITIES.RARE,
        price: 250,
        effect: { body: 6, hp: 10 },
        desc: '体质+6，血量+10'
    },
    wind_boots: {
        id: 'wind_boots',
        name: '追风靴',
        type: ITEM_TYPES.EQUIPMENT,
        rarity: RARITIES.EPIC,
        price: 400,
        effect: { agility: 10 },
        desc: '敏捷+10'
    },
    luck_bracelet: {
        id: 'luck_bracelet',
        name: '气运手链',
        type: ITEM_TYPES.EQUIPMENT,
        rarity: RARITIES.EPIC,
        price: 450,
        effect: { luck: 8 },
        desc: '气运+8'
    }
};

function getItem(itemId) {
    return ITEM_DB[itemId] || EQUIPMENT_DB[itemId];
}

// 商店商品生成
function generateShopItems(level, luck) {
    const items = [];
    const pool = Object.values(ITEM_DB).concat(Object.values(EQUIPMENT_DB));
    const ppPills = Object.values(ITEM_DB).filter(i => i.id.startsWith('pp_pill_'));
    
    // 固定包含 1 个 PP 恢复道具
    if (ppPills.length > 0) {
        const ppItem = ppPills[Math.floor(Math.random() * ppPills.length)];
        items.push({ ...ppItem, shopPrice: calculateShopPrice(ppItem.price, level) });
    }
    
    // 再随机生成 3 个商品
    for (let i = 0; i < 3; i++) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        items.push({ ...item, shopPrice: calculateShopPrice(item.price, level) });
    }
    
    return items;
}

function calculateShopPrice(basePrice, level) {
    let price = basePrice;
    if (level > 100) price = Math.floor(price * 1.5);
    if (level > 200) price = Math.floor(price * 2);
    return price;
}
