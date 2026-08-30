// 仙途 - 功法/技能数据

const ELEMENTS = {
    METAL: '金',
    WOOD: '木',
    WATER: '水',
    FIRE: '火',
    EARTH: '土',
    CHAOS: '混沌'
};

const RARITIES = {
    COMMON: { name: '凡品', color: 'rarity-common', weight: 50 },
    UNCOMMON: { name: '灵品', color: 'rarity-uncommon', weight: 30 },
    RARE: { name: '玄品', color: 'rarity-rare', weight: 15 },
    EPIC: { name: '地品', color: 'rarity-epic', weight: 4 },
    LEGENDARY: { name: '天品', color: 'rarity-legendary', weight: 0.9 },
    MYTHIC: { name: '仙品', color: 'rarity-mythic', weight: 0.1 }
};

const SKILL_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    BUFF: 'buff',
    CONTROL: 'control'
};

const DAMAGE_TYPES = {
    PHYSICAL: 'physical',
    MAGIC: 'magic',
    MIXED: 'mixed'
};

// 宗门配置
const SECTS = {
    qingyun: {
        id: 'qingyun',
        name: '青云宗',
        element: ELEMENTS.WOOD,
        desc: '木系宗门，擅长恢复与毒系持续伤害',
        coreSkills: ['qingyun_xinfa', 'qingyun_jianqi', 'qingyun_duhuo', 'qingyun_huichun'],
        startingSkills: ['qingyun_jianqi', 'qingyun_huichun', 'basic_dao', 'basic_dun'],
        bonus: { hp: 10, inner: 5 }
    },
    fantian: {
        id: 'fantian',
        name: '焚天谷',
        element: ELEMENTS.FIRE,
        desc: '火系宗门，擅长高爆发与燃烧叠加',
        coreSkills: ['fantian_xinfa', 'fantian_lieyan', 'fantian_fenshen', 'fantian_nietian'],
        startingSkills: ['fantian_lieyan', 'fantian_fenshen', 'basic_dao', 'basic_dun'],
        bonus: { strength: 5, inner: 5 }
    },
    xuanbing: {
        id: 'xuanbing',
        name: '玄冰宫',
        element: ELEMENTS.WATER,
        desc: '水系宗门，擅长控制减速与内力回复',
        coreSkills: ['xuanbing_xinfa', 'xuanbing_hanqi', 'xuanbing_bingfeng', 'xuanbing_xuanming'],
        startingSkills: ['xuanbing_hanqi', 'xuanbing_bingfeng', 'basic_dao', 'basic_dun'],
        bonus: { inner: 10, agility: 5 }
    }
};

// 功法数据库
const SKILL_DB = {
    // 通用基础技能
    basic_dao: {
        id: 'basic_dao',
        name: '基础刀法',
        element: ELEMENTS.METAL,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.PHYSICAL,
        rarity: RARITIES.COMMON,
        baseDamage: 45,
        cd: 1,
        mpCost: 0,
        desc: '最基础的金属性刀法'
    },
    basic_dun: {
        id: 'basic_dun',
        name: '基础护盾',
        element: ELEMENTS.EARTH,
        type: SKILL_TYPES.BUFF,
        rarity: RARITIES.COMMON,
        effect: { defense: 15 },
        duration: 3,
        cd: 3,
        mpCost: 15,
        desc: '提升防御，持续3回合'
    },
    basic_huoqiu: {
        id: 'basic_huoqiu',
        name: '火球术',
        element: ELEMENTS.FIRE,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MAGIC,
        rarity: RARITIES.COMMON,
        baseDamage: 55,
        cd: 1,
        mpCost: 10,
        desc: '最基础的火系法术'
    },
    basic_huichun: {
        id: 'basic_huichun',
        name: '回春术',
        element: ELEMENTS.WOOD,
        type: SKILL_TYPES.BUFF,
        rarity: RARITIES.COMMON,
        effect: { healPercent: 15 },
        duration: 1,
        cd: 3,
        mpCost: 20,
        desc: '回复15%最大生命值'
    },

    // 青云宗
    qingyun_xinfa: {
        id: 'qingyun_xinfa',
        name: '青云心法',
        element: ELEMENTS.WOOD,
        type: SKILL_TYPES.PASSIVE,
        rarity: RARITIES.EPIC,
        effect: { healEfficiency: 0.3, dotDamage: 0.2 },
        desc: '被动：治疗效果+30%，毒伤+20%'
    },
    qingyun_jianqi: {
        id: 'qingyun_jianqi',
        name: '青云剑气',
        element: ELEMENTS.WOOD,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.PHYSICAL,
        rarity: RARITIES.UNCOMMON,
        baseDamage: 80,
        cd: 2,
        mpCost: 15,
        desc: '木属性剑气斩击'
    },
    qingyun_duhuo: {
        id: 'qingyun_duhuo',
        name: '碧磷毒火',
        element: ELEMENTS.WOOD,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MAGIC,
        rarity: RARITIES.RARE,
        baseDamage: 40,
        dotDamage: 25,
        dotDuration: 3,
        cd: 2,
        mpCost: 25,
        desc: '造成毒素伤害，并附加3回合毒伤'
    },
    qingyun_huichun: {
        id: 'qingyun_huichun',
        name: '青云回春',
        element: ELEMENTS.WOOD,
        type: SKILL_TYPES.BUFF,
        rarity: RARITIES.RARE,
        effect: { healPercent: 25, hotPercent: 8 },
        duration: 3,
        cd: 4,
        mpCost: 30,
        desc: '立即回复25%生命，并持续3回合每回合回复8%'
    },

    // 焚天谷
    fantian_xinfa: {
        id: 'fantian_xinfa',
        name: '焚天心法',
        element: ELEMENTS.FIRE,
        type: SKILL_TYPES.PASSIVE,
        rarity: RARITIES.EPIC,
        effect: { fireDamage: 0.35, selfDamageRatio: 0.1 },
        desc: '被动：火系伤害+35%，但每次攻击损失10%伤害的生命'
    },
    fantian_lieyan: {
        id: 'fantian_lieyan',
        name: '烈焰斩',
        element: ELEMENTS.FIRE,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.PHYSICAL,
        rarity: RARITIES.UNCOMMON,
        baseDamage: 100,
        cd: 2,
        mpCost: 15,
        desc: '强力的火焰斩击'
    },
    fantian_fenshen: {
        id: 'fantian_fenshen',
        name: '焚身诀',
        element: ELEMENTS.FIRE,
        type: SKILL_TYPES.BUFF,
        rarity: RARITIES.RARE,
        effect: { damageBoost: 0.4, selfDamagePerTurn: 8 },
        duration: 3,
        cd: 4,
        mpCost: 25,
        desc: '提升40%伤害，但每回合损失8%生命'
    },
    fantian_nietian: {
        id: 'fantian_nietian',
        name: '涅天烈焰',
        element: ELEMENTS.FIRE,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MAGIC,
        rarity: RARITIES.EPIC,
        baseDamage: 180,
        cd: 4,
        mpCost: 50,
        desc: '极致的火系爆发'
    },

    // 玄冰宫
    xuanbing_xinfa: {
        id: 'xuanbing_xinfa',
        name: '玄冰心法',
        element: ELEMENTS.WATER,
        type: SKILL_TYPES.PASSIVE,
        rarity: RARITIES.EPIC,
        effect: { mpRegen: 10, controlDuration: 1 },
        desc: '被动：每回合回复10内力，控制技能持续+1回合'
    },
    xuanbing_hanqi: {
        id: 'xuanbing_hanqi',
        name: '寒冰刺',
        element: ELEMENTS.WATER,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MAGIC,
        rarity: RARITIES.UNCOMMON,
        baseDamage: 70,
        cd: 1,
        mpCost: 12,
        desc: '冰系法术攻击'
    },
    xuanbing_bingfeng: {
        id: 'xuanbing_bingfeng',
        name: '冰封术',
        element: ELEMENTS.WATER,
        type: SKILL_TYPES.CONTROL,
        rarity: RARITIES.RARE,
        effect: { stun: 1, speedDown: 0.3 },
        duration: 2,
        cd: 4,
        mpCost: 30,
        desc: '冻结敌人1回合，并减速2回合'
    },
    xuanbing_xuanming: {
        id: 'xuanbing_xuanming',
        name: '玄冥掌',
        element: ELEMENTS.WATER,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MIXED,
        rarity: RARITIES.EPIC,
        baseDamage: 140,
        cd: 3,
        mpCost: 40,
        desc: '强力的混伤掌法'
    },

    // 混沌/传说
    chaos_wuji: {
        id: 'chaos_wuji',
        name: '无极混沌',
        element: ELEMENTS.CHAOS,
        type: SKILL_TYPES.ACTIVE,
        damageType: DAMAGE_TYPES.MIXED,
        rarity: RARITIES.LEGENDARY,
        baseDamage: 250,
        cd: 4,
        mpCost: 60,
        desc: '混沌属性的强大攻击，不受五行克制影响'
    },
    chaos_xuhuan: {
        id: 'chaos_xuhuan',
        name: '虚实相生',
        element: ELEMENTS.CHAOS,
        type: SKILL_TYPES.PASSIVE,
        rarity: RARITIES.LEGENDARY,
        effect: { dodgeBoost: 0.15, critBoost: 0.15 },
        desc: '被动：闪避+15%，暴击+15%'
    }
};

// 获取技能信息
function getSkill(skillId) {
    return SKILL_DB[skillId] || SKILL_DB.basic_dao;
}

// 根据宗门和稀有度获取技能池
function getSkillPool(sectId, rarity) {
    const pool = [];
    for (const key in SKILL_DB) {
        const skill = SKILL_DB[key];
        // 宗门专属技能优先
        if (sectId && skill.id.startsWith(sectId + '_')) {
            pool.push(skill);
        } else if (!sectId && !skill.id.startsWith('qingyun_') && 
                   !skill.id.startsWith('fantian_') && 
                   !skill.id.startsWith('xuanbing_')) {
            pool.push(skill);
        }
    }
    return pool;
}

// 获取克制关系
function getElementMultiplier(attacker, defender) {
    if (attacker === ELEMENTS.CHAOS || defender === ELEMENTS.CHAOS) {
        return 1.0;
    }
    const counterChain = {
        [ELEMENTS.METAL]: ELEMENTS.WOOD,
        [ELEMENTS.WOOD]: ELEMENTS.EARTH,
        [ELEMENTS.EARTH]: ELEMENTS.WATER,
        [ELEMENTS.WATER]: ELEMENTS.FIRE,
        [ELEMENTS.FIRE]: ELEMENTS.METAL
    };
    if (counterChain[attacker] === defender) return 1.5;
    if (counterChain[defender] === attacker) return 0.7;
    return 1.0;
}
