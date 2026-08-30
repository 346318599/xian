// 仙途 - 抽卡系统

class GachaSystem {
    constructor() {
        this.pools = {
            normal: {
                name: '普通卡池',
                costType: 'money', // money or ticket
                costAmount: 50,
                ticketId: 'normal_ticket',
                rates: {
                    common: 0.70,
                    uncommon: 0.25,
                    rare: 0.05,
                    epic: 0,
                    legendary: 0,
                    mythic: 0
                },
                tenGuarantee: 'uncommon', // 10连保底
                guaranteeCount: 10
            },
            advanced: {
                name: '高级卡池',
                costType: 'ticket',
                costAmount: 1,
                ticketId: 'advanced_ticket',
                rates: {
                    common: 0,
                    uncommon: 0.55,
                    rare: 0.35,
                    epic: 0.09,
                    legendary: 0.01,
                    mythic: 0
                },
                tenGuarantee: 'rare',
                fiftyGuarantee: 'epic',
                guaranteeCount: 10
            }
        };
        
        this.counts = {
            normal: 0,
            advanced: 0
        };
    }

    // 抽卡
    draw(poolType, times = 1) {
        const pool = this.pools[poolType];
        if (!pool) return { success: false, message: '卡池不存在' };
        
        // 检查消耗
        let canDraw = false;
        const moneyCost = pool.costAmount * times;
        
        if (poolType === 'normal') {
            // 普通卡池：1张券抽1次，或50金钱抽1次
            if (game.tickets.normal >= times) {
                game.tickets.normal -= times;
                canDraw = true;
            } else if (game.money >= moneyCost) {
                canDraw = game.spendMoney(moneyCost);
            }
        } else if (poolType === 'advanced') {
            if (game.tickets.advanced >= times) {
                game.tickets.advanced -= times;
                canDraw = true;
            }
        }
        
        if (!canDraw) {
            return { success: false, message: '资源不足' };
        }
        
        const results = [];
        for (let i = 0; i < times; i++) {
            this.counts[poolType]++;
            game.totalGachaCount++;
            
            const result = this.rollOnce(poolType);
            results.push(result);
            
            // 记录收集
            if (result.item.id) {
                game.collectSkill(result.item.id);
            }
        }
        
        return { success: true, results };
    }

    rollOnce(poolType) {
        const pool = this.pools[poolType];
        let rarityKey;
        
        // 保底判定
        if (pool.tenGuarantee && this.counts[poolType] % pool.guaranteeCount === 0) {
            rarityKey = pool.tenGuarantee;
        } else if (pool.fiftyGuarantee && this.counts[poolType] % 50 === 0) {
            rarityKey = pool.fiftyGuarantee;
        } else {
            // 气运加成：有概率品质+1
            const luck = game.getTotalAttr('luck');
            const heavenChance = luck / (luck + 200) * 0.1;
            let roll = Math.random();
            
            // 天选之人
            if (Math.random() < heavenChance) {
                roll -= 0.15;
            }
            
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
            let cumulative = 0;
            for (const key of rarityOrder) {
                cumulative += pool.rates[key] || 0;
                if (roll <= cumulative) {
                    rarityKey = key;
                    break;
                }
            }
            rarityKey = rarityKey || 'common';
        }
        
        const rarity = RARITIES[rarityKey.toUpperCase()] || RARITIES.COMMON;
        
        // 根据稀有度抽物品
        const item = this.getRandomItem(poolType, rarity);
        
        return { item, rarity, isGuarantee: this.counts[poolType] % pool.guaranteeCount === 0 };
    }

    getRandomItem(poolType, rarity) {
        // 简化：技能池
        let pool;
        if (poolType === 'normal') {
            pool = Object.values(SKILL_DB).filter(s => s.rarity.weight >= RARITIES.UNCOMMON.weight);
        } else {
            pool = Object.values(SKILL_DB).filter(s => s.rarity.weight >= RARITIES.RARE.weight);
        }
        
        // 按稀有度筛选
        const sameRarity = pool.filter(s => s.rarity === rarity);
        const resultPool = sameRarity.length > 0 ? sameRarity : pool;
        
        const skill = resultPool[Math.floor(Math.random() * resultPool.length)] || getSkill('basic_dao');
        
        return { ...skill, itemType: 'skill' };
    }

    // 获取十连价格
    getTenCost(poolType) {
        const pool = this.pools[poolType];
        return pool.costAmount * 10;
    }
}

const gacha = new GachaSystem();
