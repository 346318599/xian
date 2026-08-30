// 仙途 - 奖励系统

class RewardSystem {
    constructor() {
        this.rewardTypes = ['skill', 'equipment', 'item', 'pill', 'money', 'ticket', 'special'];
    }

    // 生成击败奖励
    generateRewards(level, enemy, luck) {
        const rewards = [];
        const count = enemy.isBigBoss ? 5 : (enemy.isBoss ? 5 : (3 + Math.floor(Math.random() * 3)));
        
        // 根据气运调整稀有组合概率
        const luckFactor = luck / (luck + 100);
        const roll = Math.random();
        let typePool;
        
        if (roll < 0.15 + luckFactor * 0.1) {
            // 全功法
            typePool = new Array(count).fill('skill');
        } else if (roll < 0.30 + luckFactor * 0.05) {
            // 全道具
            typePool = new Array(count).fill('item');
        } else if (roll < 0.40) {
            // 全金钱/抽奖券
            typePool = new Array(count).fill('money_or_ticket');
        } else if (roll < 0.90 + luckFactor * 0.08) {
            // 混合
            typePool = [];
            const mixedTypes = ['skill', 'equipment', 'item', 'money', 'ticket'];
            for (let i = 0; i < count; i++) {
                typePool.push(mixedTypes[i % mixedTypes.length]);
            }
            // 打乱
            typePool.sort(() => Math.random() - 0.5);
        } else {
            // 特殊组合
            typePool = new Array(count).fill('special');
        }
        
        for (let i = 0; i < count; i++) {
            const reward = this.generateRewardByType(typePool[i], level, enemy, luck);
            if (reward) rewards.push(reward);
        }
        
        // Boss奖励品质提升
        if (enemy.isBigBoss) {
            rewards.forEach(r => this.upgradeRarity(r, 2));
        } else if (enemy.isBoss) {
            rewards.forEach(r => this.upgradeRarity(r, 1));
        }
        
        return rewards;
    }

    generateRewardByType(type, level, enemy, luck) {
        switch (type) {
            case 'skill':
                return this.generateSkillReward(level, luck);
            case 'equipment':
                return this.generateEquipmentReward(level, luck);
            case 'item':
                return this.generateItemReward(level, luck);
            case 'pill':
                return this.generatePillReward(level, luck);
            case 'money':
                return this.generateMoneyReward(level, enemy);
            case 'ticket':
                return this.generateTicketReward(luck);
            case 'money_or_ticket':
                return Math.random() < 0.6 ? this.generateMoneyReward(level, enemy) : this.generateTicketReward(luck);
            case 'special':
                return Math.random() < 0.5 ? this.generateSkillReward(level, luck, true) : this.generatePillReward(level, luck);
            default:
                return this.generateMoneyReward(level, enemy);
        }
    }

    generateSkillReward(level, luck, rareOnly = false) {
        const rarity = this.rollRarity(level, luck, rareOnly);
        const pool = Object.values(SKILL_DB).filter(s => {
            if (rareOnly && s.rarity.weight > RARITIES.RARE.weight) return false;
            return s.rarity === rarity || (s.rarity.weight >= rarity.weight && Math.random() < 0.3);
        });
        
        const skill = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : getSkill('basic_dao');
        
        return {
            type: 'skill',
            data: { ...skill },
            name: skill.name,
            rarity: skill.rarity,
            desc: skill.desc
        };
    }

    generateEquipmentReward(level, luck) {
        const rarity = this.rollRarity(level, luck);
        const pool = Object.values(EQUIPMENT_DB).filter(e => e.rarity.weight <= rarity.weight);
        const equip = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : EQUIPMENT_DB.iron_sword;
        
        return {
            type: 'equipment',
            data: { ...equip },
            name: equip.name,
            rarity: equip.rarity,
            desc: equip.desc
        };
    }

    generateItemReward(level, luck) {
        const consumables = ['small_hp_pill', 'medium_hp_pill', 'small_mp_pill', 'medium_mp_pill', 'atk_talisman', 'def_talisman'];
        const id = consumables[Math.floor(Math.random() * consumables.length)];
        const item = getItem(id);
        
        return {
            type: 'item',
            data: { ...item },
            name: item.name,
            rarity: item.rarity,
            desc: item.desc
        };
    }

    generatePillReward(level, luck) {
        const pills = ['hp_pill', 'str_pill', 'inner_pill', 'body_pill', 'agi_pill'];
        const id = pills[Math.floor(Math.random() * pills.length)];
        const item = getItem(id);
        
        return {
            type: 'pill',
            data: { ...item },
            name: item.name,
            rarity: item.rarity,
            desc: item.desc
        };
    }

    generateMoneyReward(level, enemy) {
        let base = 10 + level * 2;
        if (enemy.isBoss) base *= 3;
        if (enemy.isBigBoss) base *= 10;
        const amount = Math.floor(base * (0.9 + Math.random() * 0.2));
        
        return {
            type: 'money',
            data: { amount },
            name: `金钱袋 (${amount})`,
            rarity: RARITIES.COMMON,
            desc: `获得 ${amount} 金钱`
        };
    }

    generateTicketReward(luck) {
        const luckFactor = luck / (luck + 100);
        const isAdvanced = Math.random() < 0.15 + luckFactor * 0.2;
        const item = isAdvanced ? getItem('advanced_ticket') : getItem('normal_ticket');
        
        return {
            type: 'ticket',
            data: { ...item },
            name: item.name,
            rarity: item.rarity,
            desc: item.desc
        };
    }

    rollRarity(level, luck, rareOnly = false) {
        if (rareOnly) {
            const rareRoll = Math.random();
            if (rareRoll < 0.5) return RARITIES.RARE;
            if (rareRoll < 0.85) return RARITIES.EPIC;
            return RARITIES.LEGENDARY;
        }
        
        const luckFactor = luck / (luck + 100);
        let roll = Math.random();
        roll -= luckFactor * 0.15; // 气运提升稀有度
        
        // 关卡越高基础稀有度越高
        if (level > 100) roll -= 0.05;
        if (level > 200) roll -= 0.05;
        
        if (roll < 0.50) return RARITIES.COMMON;
        if (roll < 0.80) return RARITIES.UNCOMMON;
        if (roll < 0.94) return RARITIES.RARE;
        if (roll < 0.99) return RARITIES.EPIC;
        if (roll < 0.999) return RARITIES.LEGENDARY;
        return RARITIES.MYTHIC;
    }

    upgradeRarity(reward, tiers) {
        const rarityOrder = [RARITIES.COMMON, RARITIES.UNCOMMON, RARITIES.RARE, RARITIES.EPIC, RARITIES.LEGENDARY, RARITIES.MYTHIC];
        let idx = rarityOrder.indexOf(reward.rarity);
        idx = Math.min(rarityOrder.length - 1, idx + tiers);
        reward.rarity = rarityOrder[idx];
    }

    // 应用奖励
    applyReward(reward) {
        if (!reward) return;
        
        switch (reward.type) {
            case 'skill':
                // 技能奖励在UI中选择槽位装备
                break;
            case 'equipment':
                game.addItem(reward.data);
                break;
            case 'item':
            case 'pill':
            case 'ticket':
                game.addItem(reward.data);
                break;
            case 'money':
                game.addMoney(reward.data.amount);
                break;
        }
    }
}

const rewards = new RewardSystem();
