// 仙途 - 战斗系统

class CombatSystem {
    constructor() {
        this.enemy = null;
        this.round = 1;
        this.logs = [];
        this.finished = false;
        this.result = null;
        this.lastPlayerDamage = null;
    }

    start(level) {
        this.enemy = generateEnemy(level);
        this.round = 1;
        this.logs = [];
        this.finished = false;
        this.result = null;
        this.lastPlayerDamage = null;
        
        game.player.buffs = [];
        
        this.log(`遭遇了 ${this.enemy.name}（${this.enemy.element}）！`, 'info');
        
        // 先手判定
        const playerAgi = game.getTotalAttr('agility');
        if (playerAgi >= this.enemy.def + 5) {
            this.log('你速度更快，获得先手！', 'info');
        }
        
        return this.enemy;
    }

    // 计算最终伤害
    calculateDamage(attacker, defender, skill, isPlayer) {
        const isEnemy = !isPlayer;
        let baseDamage = skill.baseDamage || 0;
        
        // 属性加成
        let attrBonus = 1.0;
        if (isPlayer) {
            const strength = game.getTotalAttr('strength');
            const inner = game.getTotalAttr('inner');
            if (skill.damageType === DAMAGE_TYPES.PHYSICAL) {
                attrBonus = 1 + strength * 0.02;
            } else if (skill.damageType === DAMAGE_TYPES.MAGIC) {
                attrBonus = 1 + inner * 0.02;
            } else if (skill.damageType === DAMAGE_TYPES.MIXED) {
                attrBonus = 1 + (strength + inner) / 2 * 0.015;
            }
            
            // BUFF加成
            for (const buff of game.player.buffs) {
                if (buff.type === 'damageBoost') {
                    attrBonus += buff.value;
                }
            }
        }
        
        // 克制系数
        let elementMultiplier = 1.0;
        if (isPlayer) {
            elementMultiplier = getElementMultiplier(skill.element, this.enemy.element);
        } else {
            elementMultiplier = getElementMultiplier(skill.element, ELEMENTS.CHAOS);
            // 简化：敌人对玩家使用技能时，玩家五行按当前主要功法属性算
            const playerMainElement = game.player.skills[0] ? game.player.skills[0].element : ELEMENTS.METAL;
            elementMultiplier = getElementMultiplier(skill.element, playerMainElement);
        }
        
        // 随机波动
        const randomFactor = 0.95 + Math.random() * 0.1;
        
        // 基础伤害
        let damage = baseDamage * attrBonus * elementMultiplier * randomFactor;
        
        // 防御减伤
        let defense = 0;
        if (isEnemy) {
            // 玩家攻击敌人
            defense = this.enemy.def;
            // 破防效果
            if (elementMultiplier === 1.5 && Math.random() < 0.3) {
                defense *= 0.5;
                this.log('触发破防！', 'critical');
            }
        } else {
            // 敌人攻击玩家
            const body = game.getTotalAttr('body');
            defense = body * 1.5;
            for (const buff of game.player.buffs) {
                if (buff.type === 'defenseBoost') {
                    defense *= (1 + buff.value);
                }
            }
            // 压制效果
            if (elementMultiplier === 0.7 && Math.random() < 0.3) {
                this.log('你被压制，PP 值被削弱！', 'info');
                // 随机减少一个技能 PP
                const availableSkills = game.player.skills.filter(s => s.currentPp > 0);
                if (availableSkills.length > 0) {
                    const target = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                    target.currentPp--;
                }
            }
        }
        
        const level = game.level;
        const reduction = defense / (defense + 100 + level * 2);
        damage = damage * (1 - reduction);
        
        // 暴击
        let isCrit = false;
        if (isPlayer) {
            const agility = game.getTotalAttr('agility');
            const critRate = Math.min(agility * 0.002, 0.3);
            if (Math.random() < critRate) {
                damage *= 1.5;
                isCrit = true;
            }
        }
        
        // 闪避
        if (!isPlayer) {
            const agility = game.getTotalAttr('agility');
            const dodgeRate = Math.min(agility * 0.0015, 0.25);
            if (Math.random() < dodgeRate) {
                return { damage: 0, isDodge: true, elementMultiplier, isCrit };
            }
        }
        
        return { damage: Math.max(1, Math.floor(damage)), elementMultiplier, isCrit };
    }

    // 玩家使用技能
    playerUseSkill(skillIndex) {
        if (this.finished) return null;
        
        const skill = game.player.skills[skillIndex];
        if (!skill || skill.currentPp <= 0) {
            this.log('PP 值不足，无法使用该技能！', 'info');
            return null;
        }
        if (game.player.mp < skill.mpCost) {
            this.log('内力不足！', 'info');
            return null;
        }
        
        game.player.mp -= skill.mpCost;
        skill.currentPp--;
        
        // 记录功法收集
        game.collectSkill(skill.id);
        
        // 处理被动技能
        if (skill.type === SKILL_TYPES.PASSIVE) {
            this.log(`被动心法【${skill.name}】生效`, 'info');
            return this.checkCombatEnd();
        }
        
        // 处理BUFF/控制
        if (skill.type === SKILL_TYPES.BUFF) {
            this.applyBuff(skill, true);
            this.log(`使用【${skill.name}】`, 'info');
            return this.endPlayerTurn();
        }
        
        if (skill.type === SKILL_TYPES.CONTROL) {
            this.applyControl(skill);
            this.log(`使用【${skill.name}】`, 'info');
            return this.endPlayerTurn();
        }
        
        // 处理伤害
        const result = this.calculateDamage(null, this.enemy, skill, true);
        this.lastPlayerDamage = { damage: result.damage, isCrit: result.isCrit };
        
        let logText = `你使用【${skill.name}】`;
        if (result.elementMultiplier === 1.5) logText += '，属性克制！';
        else if (result.elementMultiplier === 0.7) logText += '，被克制！';
        
        if (result.isCrit) logText += ' 暴击！';
        
        this.enemy.hp = Math.max(0, this.enemy.hp - result.damage);
        logText += ` 造成 ${result.damage} 点伤害`;
        this.log(logText, 'damage');
        
        // DOT伤害
        if (skill.dotDamage && skill.dotDuration) {
            this.enemy.buffs = this.enemy.buffs || [];
            this.enemy.buffs.push({
                type: 'dot',
                value: skill.dotDamage,
                duration: skill.dotDuration,
                name: skill.name
            });
            this.log(`敌人陷入【${skill.name}】毒素，持续${skill.dotDuration}回合`, 'info');
        }
        
        // 焚天心法自损
        if (game.player.sectId === 'fantian' && skill.element === ELEMENTS.FIRE) {
            const selfDamage = Math.floor(result.damage * 0.1);
            game.player.hp = Math.max(1, game.player.hp - selfDamage);
            this.log(`焚天心法反噬，损失 ${selfDamage} 生命`, 'damage');
        }
        
        return this.endPlayerTurn();
    }

    applyBuff(skill, isPlayer) {
        if (isPlayer) {
            // 治疗效果
            if (skill.effect && skill.effect.healPercent) {
                let heal = Math.floor(game.player.maxHp * skill.effect.healPercent / 100);
                // 青云心法加成
                if (game.player.sectId === 'qingyun') {
                    heal = Math.floor(heal * 1.3);
                }
                game.player.hp = Math.min(game.player.maxHp, game.player.hp + heal);
                this.log(`回复 ${heal} 点生命`, 'heal');
            }
            if (skill.effect && skill.effect.hotPercent) {
                game.player.buffs.push({
                    type: 'hot',
                    value: skill.effect.hotPercent,
                    duration: skill.duration,
                    name: skill.name
                });
            }
        }
    }

    applyControl(skill) {
        if (skill.effect && skill.effect.stun) {
            this.enemy.buffs = this.enemy.buffs || [];
            this.enemy.buffs.push({
                type: 'stun',
                duration: skill.effect.stun + (game.player.sectId === 'xuanbing' ? 1 : 0),
                name: skill.name
            });
            this.log(`敌人被冻结 ${skill.effect.stun} 回合！`, 'info');
        }
    }

    endPlayerTurn() {
        if (this.enemy.hp <= 0) {
            return this.endCombat('win');
        }
        
        if (game.player.hp <= 0) {
            // 检查复活
            const reviveItem = game.player.inventory.find(i => i.id === 'revive_pill');
            if (reviveItem) {
                this.useRevive(reviveItem);
            } else {
                return this.endCombat('lose');
            }
        }
        
        // 处理玩家BUFF
        this.processBuffs(true);
        
        // 敌人回合
        const enemyResult = this.enemyTurn();
        return { ...enemyResult, damageInfo: this.lastPlayerDamage };
    }

    enemyTurn() {
        if (this.finished) return null;
        
        // 检查眩晕
        const stunBuff = (this.enemy.buffs || []).find(b => b.type === 'stun');
        if (stunBuff) {
            this.log(`${this.enemy.name} 被冻结，无法行动！`, 'info');
            stunBuff.duration--;
            if (stunBuff.duration <= 0) {
                this.enemy.buffs = this.enemy.buffs.filter(b => b !== stunBuff);
            }
            return this.endEnemyTurn();
        }
        
        // 敌人选择技能
        let availableSkills = this.enemy.skills.map((s, i) => ({ skill: s, index: i }))
            .filter(item => this.enemy.skillPp[item.index] > 0);
        
        if (availableSkills.length === 0) {
            // PP 耗尽，使用普通攻击
            availableSkills = [{ skill: getSkill('basic_dao'), index: -1 }];
        }
        
        const chosen = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        const skill = chosen.skill;
        
        if (chosen.index >= 0) {
            this.enemy.skillPp[chosen.index]--;
        }
        
        const result = this.calculateDamage(this.enemy, game.player, skill, false);
        
        if (result.isDodge) {
            this.log(`你闪避了 ${this.enemy.name} 的【${skill.name}】！`, 'info');
        } else {
            let logText = `${this.enemy.name} 使用【${skill.name}】`;
            if (result.elementMultiplier === 1.5) logText += '，克制你！';
            if (result.isCrit) logText += ' 暴击！';
            logText += ` 造成 ${result.damage} 点伤害`;
            this.log(logText, 'damage');
            game.player.hp = Math.max(0, game.player.hp - result.damage);
        }
        
        return this.endEnemyTurn();
    }

    endEnemyTurn() {
        if (game.player.hp <= 0) {
            const reviveItem = game.player.inventory.find(i => i.id === 'revive_pill');
            if (reviveItem) {
                this.useRevive(reviveItem);
            } else {
                return this.endCombat('lose');
            }
        }
        
        if (this.enemy.hp <= 0) {
            return this.endCombat('win');
        }
        
        // 处理敌人BUFF
        this.processBuffs(false);
        
        // 玄冰心法内力回复
        if (game.player.sectId === 'xuanbing') {
            game.player.mp = Math.min(game.player.maxMp, game.player.mp + 10);
        }
        
        this.round++;
        this.log(`--- 第 ${this.round} 回合 ---`, 'info');
        
        return { status: 'continue' };
    }

    processBuffs(isPlayer) {
        if (isPlayer) {
            // 持续治疗
            const hots = game.player.buffs.filter(b => b.type === 'hot');
            for (const hot of hots) {
                const heal = Math.floor(game.player.maxHp * hot.value / 100);
                game.player.hp = Math.min(game.player.maxHp, game.player.hp + heal);
                this.log(`【${hot.name}】回复 ${heal} 生命`, 'heal');
                hot.duration--;
            }
            // 焚身诀自损
            const fenShen = game.player.buffs.find(b => b.name === '焚身诀');
            if (fenShen) {
                const damage = Math.floor(game.player.maxHp * fenShen.value / 100);
                game.player.hp = Math.max(1, game.player.hp - damage);
                this.log(`焚身诀燃烧，损失 ${damage} 生命`, 'damage');
                fenShen.duration--;
            }
            // 清理过期BUFF
            game.player.buffs = game.player.buffs.filter(b => b.duration > 0);
        } else {
            // 敌人DOT
            if (!this.enemy.buffs) this.enemy.buffs = [];
            const dots = this.enemy.buffs.filter(b => b.type === 'dot');
            for (const dot of dots) {
                let damage = dot.value;
                if (game.player.sectId === 'qingyun') damage *= 1.2;
                damage = Math.floor(damage);
                this.enemy.hp = Math.max(0, this.enemy.hp - damage);
                this.log(`【${dot.name}】造成 ${damage} 毒素伤害`, 'damage');
                dot.duration--;
            }
            this.enemy.buffs = this.enemy.buffs.filter(b => b.duration > 0);
        }
    }

    useRevive(item) {
        const idx = game.player.inventory.indexOf(item);
        if (idx !== -1) game.player.inventory.splice(idx, 1);
        game.player.hp = Math.floor(game.player.maxHp * 0.5);
        this.log('还魂丹生效，你复活了！', 'critical');
    }

    endCombat(result) {
        this.finished = true;
        this.result = result;
        
        if (result === 'win') {
            this.log(`战胜了 ${this.enemy.name}！`, 'critical');
            return { status: 'win', enemy: this.enemy, damageInfo: this.lastPlayerDamage };
        } else {
            this.log('你倒下了...', 'damage');
            return { status: 'lose', damageInfo: this.lastPlayerDamage };
        }
    }

    log(message, type = 'info') {
        this.logs.push({ message, type, time: Date.now() });
        if (this.logs.length > 50) this.logs.shift();
    }
}

const combat = new CombatSystem();
