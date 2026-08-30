// 仙途 - 敌人数据与生成

const ENEMY_TEMPLATES = {
    // 金属性敌人
    metal_wolf: {
        id: 'metal_wolf',
        name: '金甲狼',
        element: ELEMENTS.METAL,
        baseHp: 80,
        baseAtk: 18,
        baseDef: 8,
        skills: ['basic_dao'],
        rewardTier: 1
    },
    metal_blade: {
        id: 'metal_blade',
        name: '铁刃妖',
        element: ELEMENTS.METAL,
        baseHp: 100,
        baseAtk: 22,
        baseDef: 10,
        skills: ['basic_dao', 'basic_dun'],
        rewardTier: 1
    },

    // 木属性敌人
    wood_vine: {
        id: 'wood_vine',
        name: '藤蔓精',
        element: ELEMENTS.WOOD,
        baseHp: 120,
        baseAtk: 15,
        baseDef: 6,
        skills: ['basic_huichun'],
        rewardTier: 1
    },
    wood_poison: {
        id: 'wood_poison',
        name: '毒藤妖',
        element: ELEMENTS.WOOD,
        baseHp: 110,
        baseAtk: 17,
        baseDef: 7,
        skills: ['qingyun_duhuo'],
        rewardTier: 2
    },

    // 水属性敌人
    water_ice: {
        id: 'water_ice',
        name: '寒冰妖',
        element: ELEMENTS.WATER,
        baseHp: 90,
        baseAtk: 20,
        baseDef: 9,
        skills: ['xuanbing_hanqi'],
        rewardTier: 1
    },
    water_specter: {
        id: 'water_specter',
        name: '玄水灵',
        element: ELEMENTS.WATER,
        baseHp: 100,
        baseAtk: 19,
        baseDef: 8,
        skills: ['xuanbing_bingfeng'],
        rewardTier: 2
    },

    // 火属性敌人
    fire_beast: {
        id: 'fire_beast',
        name: '烈焰兽',
        element: ELEMENTS.FIRE,
        baseHp: 95,
        baseAtk: 24,
        baseDef: 5,
        skills: ['basic_huoqiu'],
        rewardTier: 1
    },
    fire_demon: {
        id: 'fire_demon',
        name: '炎魔',
        element: ELEMENTS.FIRE,
        baseHp: 110,
        baseAtk: 26,
        baseDef: 6,
        skills: ['fantian_lieyan', 'basic_huoqiu'],
        rewardTier: 2
    },

    // 土属性敌人
    earth_golem: {
        id: 'earth_golem',
        name: '岩石傀儡',
        element: ELEMENTS.EARTH,
        baseHp: 140,
        baseAtk: 16,
        baseDef: 12,
        skills: ['basic_dun'],
        rewardTier: 1
    },
    earth_turtle: {
        id: 'earth_turtle',
        name: '玄土龟',
        element: ELEMENTS.EARTH,
        baseHp: 160,
        baseAtk: 14,
        baseDef: 15,
        skills: ['basic_dun', 'basic_dao'],
        rewardTier: 2
    }
};

const BOSS_TEMPLATES = {
    // 小Boss
    mini_metal: {
        id: 'mini_metal',
        name: '金鳞守卫',
        element: ELEMENTS.METAL,
        baseHp: 250,
        baseAtk: 35,
        baseDef: 18,
        skills: ['basic_dao', 'basic_dun'],
        isBoss: true
    },
    mini_wood: {
        id: 'mini_wood',
        name: '千年树妖',
        element: ELEMENTS.WOOD,
        baseHp: 320,
        baseAtk: 28,
        baseDef: 14,
        skills: ['basic_huichun', 'qingyun_duhuo'],
        isBoss: true
    },
    mini_water: {
        id: 'mini_water',
        name: '寒潭蛟龙',
        element: ELEMENTS.WATER,
        baseHp: 280,
        baseAtk: 32,
        baseDef: 16,
        skills: ['xuanbing_hanqi', 'xuanbing_bingfeng'],
        isBoss: true
    },
    mini_fire: {
        id: 'mini_fire',
        name: '赤焰统领',
        element: ELEMENTS.FIRE,
        baseHp: 260,
        baseAtk: 40,
        baseDef: 12,
        skills: ['basic_huoqiu', 'fantian_lieyan'],
        isBoss: true
    },
    mini_earth: {
        id: 'mini_earth',
        name: '山岩巨灵',
        element: ELEMENTS.EARTH,
        baseHp: 350,
        baseAtk: 25,
        baseDef: 22,
        skills: ['basic_dun', 'basic_dao'],
        isBoss: true
    },

    // 大Boss
    big_100: {
        id: 'big_100',
        name: '五行魔将',
        element: ELEMENTS.CHAOS,
        baseHp: 1000,
        baseAtk: 80,
        baseDef: 40,
        skills: ['basic_dao', 'basic_huoqiu', 'xuanbing_bingfeng', 'basic_huichun'],
        isBoss: true,
        isBigBoss: true
    },
    big_200: {
        id: 'big_200',
        name: '天外邪魔',
        element: ELEMENTS.CHAOS,
        baseHp: 1500,
        baseAtk: 120,
        baseDef: 55,
        skills: ['chaos_wuji', 'fantian_nietian', 'xuanbing_xuanming'],
        isBoss: true,
        isBigBoss: true
    },
    big_300: {
        id: 'big_300',
        name: '混沌天魔',
        element: ELEMENTS.CHAOS,
        baseHp: 2200,
        baseAtk: 160,
        baseDef: 70,
        skills: ['chaos_wuji', 'fantian_nietian', 'qingyun_duhuo', 'basic_dun'],
        isBoss: true,
        isBigBoss: true,
        isFinalBoss: true
    }
};

// 根据关卡生成敌人
function generateEnemy(level) {
    let template;
    
    if (level % 100 === 0) {
        // 大Boss
        const bossKey = 'big_' + Math.min(level, 300);
        template = BOSS_TEMPLATES[bossKey] || BOSS_TEMPLATES.big_100;
    } else if (level % 10 === 0) {
        // 小Boss
        const elements = ['metal', 'wood', 'water', 'fire', 'earth'];
        const elem = elements[(level / 10 - 1) % 5];
        template = BOSS_TEMPLATES['mini_' + elem];
    } else {
        // 普通敌人
        const keys = Object.keys(ENEMY_TEMPLATES);
        // 根据关卡解锁更强敌人
        const availableKeys = keys.filter(k => {
            const tier = ENEMY_TEMPLATES[k].rewardTier || 1;
            if (level < 30) return tier === 1;
            if (level < 100) return tier <= 2;
            return true;
        });
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        template = ENEMY_TEMPLATES[randomKey];
    }

    // 计算强度系数
    const growth = Math.pow(1 + level * 0.035, 1.5);
    const atkGrowth = Math.pow(1 + level * 0.028, 1.35);
    const defGrowth = Math.pow(1 + level * 0.020, 1.2);
    
    let hpMultiplier = 1;
    let atkMultiplier = 1;
    let defMultiplier = 1;
    
    if (template.isBigBoss) {
        hpMultiplier = 5;
        atkMultiplier = 2.5;
        defMultiplier = 2;
    } else if (template.isBoss) {
        hpMultiplier = 2;
        atkMultiplier = 1.8;
        defMultiplier = 1.5;
    }

    const enemy = {
        id: template.id,
        name: template.name,
        element: template.element,
        level: level,
        maxHp: Math.floor(template.baseHp * growth * hpMultiplier),
        hp: Math.floor(template.baseHp * growth * hpMultiplier),
        atk: Math.floor(template.baseAtk * atkGrowth * atkMultiplier),
        def: Math.floor(template.baseDef * defGrowth * defMultiplier),
        skills: template.skills.map(s => getSkill(s)),
        isBoss: template.isBoss || false,
        isBigBoss: template.isBigBoss || false,
        isFinalBoss: template.isFinalBoss || false,
        skillCds: new Array(template.skills.length).fill(0),
        buffs: []
    };
    
    return enemy;
}
