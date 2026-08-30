// 仙途 - 游戏状态管理

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.mode = 'classic'; // classic / endless
        this.level = 1;
        this.money = 0;
        this.tickets = {
            normal: 0,
            advanced: 0
        };
        
        // 角色属性
        this.player = {
            sectId: null,
            baseAttrs: {
                hp: 0,
                strength: 0,
                inner: 0,
                body: 0,
                agility: 0,
                luck: 0
            },
            bonusAttrs: {
                hp: 0,
                strength: 0,
                inner: 0,
                body: 0,
                agility: 0,
                luck: 0
            },
            maxHp: 400,
            hp: 400,
            maxMp: 100,
            mp: 100,
            skills: [], // 4个技能槽
            equipment: [],
            inventory: [],
            buffs: []
        };

        // 战斗状态
        this.combat = null;
        
        // 奖励状态
        this.currentRewards = [];
        this.selectedReward = null;
        this.shopItems = [];
        this.shopRefreshCost = 50;

        // 解锁进度（跨局继承）
        this.unlockedSects = ['qingyun', 'fantian', 'xuanbing'];
        this.collectedSkills = new Set();
        this.totalGachaCount = 0;
        this.endlessUnlocked = false;
    }

    // 获取总属性
    getTotalAttr(attrName) {
        const base = this.player.baseAttrs[attrName] || 0;
        const bonus = this.player.bonusAttrs[attrName] || 0;
        const equip = this.getEquipmentBonus(attrName);
        return base + bonus + equip;
    }

    getEquipmentBonus(attrName) {
        let bonus = 0;
        for (const item of this.player.equipment) {
            if (item.effect && item.effect[attrName]) {
                bonus += item.effect[attrName];
            }
        }
        return bonus;
    }

    // 重新计算生命/内力上限
    recalculateStats() {
        const hp = this.getTotalAttr('hp');
        const body = this.getTotalAttr('body');
        const inner = this.getTotalAttr('inner');
        
        const oldMaxHp = this.player.maxHp;
        const oldMaxMp = this.player.maxMp;
        
        this.player.maxHp = 200 + hp * 10 + body * 5;
        this.player.maxMp = 100 + inner * 5;
        
        // 保持比例
        this.player.hp = Math.min(this.player.hp + (this.player.maxHp - oldMaxHp), this.player.maxHp);
        this.player.mp = Math.min(this.player.mp + (this.player.maxMp - oldMaxMp), this.player.maxMp);
    }

    // 设置开局属性
    setBaseAttrs(attrs) {
        this.player.baseAttrs = { ...attrs };
        this.recalculateStats();
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
    }

    // 加入宗门
    joinSect(sectId) {
        const sect = SECTS[sectId];
        if (!sect) return false;
        
        this.player.sectId = sectId;
        
        // 宗门加成
        for (const attr in sect.bonus) {
            this.player.bonusAttrs[attr] = (this.player.bonusAttrs[attr] || 0) + sect.bonus[attr];
        }
        
        // 初始功法
        this.player.skills = sect.startingSkills.map(id => {
            const skill = getSkill(id);
            return { ...skill, currentPp: skill.pp || 0 };
        });
        
        this.recalculateStats();
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        
        return true;
    }

    // 更换技能
    equipSkill(slotIndex, skill) {
        if (slotIndex >= 0 && slotIndex < 4) {
            this.player.skills[slotIndex] = { ...skill, currentPp: skill.pp || 0 };
            return true;
        }
        return false;
    }

    // 获得金钱
    addMoney(amount) {
        this.money += amount;
    }

    // 花费金钱
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        return false;
    }

    // 获得道具
    addItem(item) {
        if (item.type === ITEM_TYPES.EQUIPMENT) {
            this.player.equipment.push(item);
            this.recalculateStats();
        } else {
            this.player.inventory.push(item);
        }
    }

    // 使用道具
    useItem(item) {
        const idx = this.player.inventory.indexOf(item);
        if (idx === -1) return false;
        
        if (item.type === ITEM_TYPES.PILL) {
            // 属性丹
            this.player.bonusAttrs[item.effect.attr] += item.effect.value;
            this.recalculateStats();
            this.player.inventory.splice(idx, 1);
            return true;
        }
        
        if (item.type === ITEM_TYPES.CONSUMABLE) {
            if (item.effect.healPercent) {
                this.player.hp = Math.min(this.player.hp + this.player.maxHp * item.effect.healPercent / 100, this.player.maxHp);
            }
            if (item.effect.mpPercent) {
                this.player.mp = Math.min(this.player.mp + this.player.maxMp * item.effect.mpPercent / 100, this.player.maxMp);
            }
            if (item.effect.damageBoost) {
                this.player.buffs.push({ type: 'damageBoost', value: item.effect.damageBoost, duration: item.effect.duration });
            }
            if (item.effect.defenseBoost) {
                this.player.buffs.push({ type: 'defenseBoost', value: item.effect.defenseBoost, duration: item.effect.duration });
            }
            if (item.effect.restorePp) {
                for (const skill of this.player.skills) {
                    if (skill.pp) {
                        skill.currentPp = Math.min(skill.pp, skill.currentPp + item.effect.restorePp);
                    }
                }
            }
            if (item.effect.restoreAllPp) {
                for (const skill of this.player.skills) {
                    if (skill.pp) {
                        skill.currentPp = skill.pp;
                    }
                }
            }
            this.player.inventory.splice(idx, 1);
            return true;
        }
        
        if (item.type === ITEM_TYPES.TICKET) {
            if (item.id === 'normal_ticket') this.tickets.normal++;
            if (item.id === 'advanced_ticket') this.tickets.advanced++;
            this.player.inventory.splice(idx, 1);
            return true;
        }
        
        return false;
    }

    // 记录收集功法（用于宗门解锁）
    collectSkill(skillId) {
        this.collectedSkills.add(skillId);
        
        // 检查宗门解锁
        for (const sectId in SECTS) {
            if (this.unlockedSects.includes(sectId)) continue;
            const sect = SECTS[sectId];
            const collected = sect.coreSkills.filter(s => this.collectedSkills.has(s)).length;
            if (collected >= 3) {
                this.unlockedSects.push(sectId);
            }
        }
    }

    // 进入下一关
    nextLevel() {
        this.level++;
        if (this.mode === 'classic' && this.level > 300) {
            return 'victory';
        }
        return 'next';
    }

    // 获取存档数据
    getSaveData() {
        return {
            mode: this.mode,
            level: this.level,
            money: this.money,
            tickets: this.tickets,
            player: {
                sectId: this.player.sectId,
                baseAttrs: this.player.baseAttrs,
                bonusAttrs: this.player.bonusAttrs,
                hp: this.player.hp,
                mp: this.player.mp,
                skills: this.player.skills.map(s => s.id),
                equipment: this.player.equipment,
                inventory: this.player.inventory
            },
            unlockedSects: this.unlockedSects,
            collectedSkills: Array.from(this.collectedSkills),
            totalGachaCount: this.totalGachaCount,
            endlessUnlocked: this.endlessUnlocked
        };
    }

    // 加载存档数据
    loadSaveData(data) {
        this.mode = data.mode || 'classic';
        this.level = data.level || 1;
        this.money = data.money || 0;
        this.tickets = data.tickets || { normal: 0, advanced: 0 };
        
        this.player.sectId = data.player.sectId;
        this.player.baseAttrs = data.player.baseAttrs;
        this.player.bonusAttrs = data.player.bonusAttrs;
        this.player.skills = (data.player.skills || []).map(id => {
            const skill = getSkill(id);
            return { ...skill, currentPp: skill.pp || 0 };
        });
        this.player.equipment = data.player.equipment || [];
        this.player.inventory = data.player.inventory || [];
        
        this.unlockedSects = data.unlockedSects || ['qingyun', 'fantian', 'xuanbing'];
        this.collectedSkills = new Set(data.collectedSkills || []);
        this.totalGachaCount = data.totalGachaCount || 0;
        this.endlessUnlocked = data.endlessUnlocked || false;
        
        this.recalculateStats();
        this.player.hp = Math.min(data.player.hp || this.player.maxHp, this.player.maxHp);
        this.player.mp = Math.min(data.player.mp || this.player.maxMp, this.player.maxMp);
    }
}

const game = new GameState();
