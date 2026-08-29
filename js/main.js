// 五行修仙录 - 主入口

let currentRewards = [];
let selectedRewardIndex = null;
let pendingSkillReward = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // 重置到初始状态
    game.reset();
    game.player.baseAttrs = { hp: 10, strength: 10, inner: 10, body: 10, agility: 10, luck: 10 };
    game.player.sectId = 'qingyun';
    
    UI.updateHeader();
    UI.renderModeScreen();
    UI.renderCreateScreen();
    bindEvents();
    
    UI.showScreen('screen-mode');
    UI.hideAllModals();
}

function bindEvents() {
    // 模式选择
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            game.mode = btn.dataset.mode;
            UI.updateHeader();
            UI.renderCreateScreen();
            UI.showScreen('screen-create');
        });
    });
    
    // 返回模式选择
    document.getElementById('back-to-mode-btn').addEventListener('click', () => {
        UI.showScreen('screen-mode');
    });
    
    // 开始战斗
    document.getElementById('start-combat-btn').addEventListener('click', startGame);
    
    // 下一关
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    
    // 关闭奖励弹窗（仅关闭，不影响选择）
    document.getElementById('reward-close-btn').addEventListener('click', () => {
        UI.hideModal('reward-modal');
    });
    
    // 右上角入口
    document.getElementById('bag-btn').addEventListener('click', openBag);
    document.getElementById('shop-btn').addEventListener('click', openShop);
    document.getElementById('gacha-btn').addEventListener('click', openGacha);
    
    // 商店刷新
    document.getElementById('refresh-shop-btn').addEventListener('click', refreshShop);
    
    // 存档读档
    document.getElementById('save-btn').addEventListener('click', () => {
        const result = saveSystem.save();
        UI.showMessage(result.message);
    });
    document.getElementById('load-btn').addEventListener('click', () => {
        const result = saveSystem.load();
        UI.showMessage(result.message);
        if (result.success) {
            UI.updateHeader();
            UI.renderCombat();
            UI.showScreen('screen-combat');
            UI.hideAllModals();
        }
    });
    
    // 重新开始
    document.getElementById('restart-btn').addEventListener('click', () => {
        init();
    });
    
    // 弹窗关闭按钮
    document.querySelectorAll('.close-btn[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            UI.hideModal(btn.dataset.close);
        });
    });
    
    // 点击弹窗背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && modal.id !== 'reward-modal') {
                UI.hideModal(modal.id);
            }
        });
    });
}

// 选择宗门
function selectSect(sectId) {
    if (!game.unlockedSects.includes(sectId)) {
        UI.showMessage('该宗门尚未解锁');
        return;
    }
    game.player.sectId = sectId;
    UI.renderCreateScreen();
}

// 调整属性
function changeAttr(attr, delta) {
    const total = Object.values(game.player.baseAttrs).reduce((a, b) => a + b, 0);
    const current = game.player.baseAttrs[attr];
    
    if (delta > 0 && total >= 60) return;
    if (delta < 0 && current <= 0) return;
    
    game.player.baseAttrs[attr] += delta;
    UI.renderAttrEditor();
}

// 开始游戏
function startGame() {
    const total = Object.values(game.player.baseAttrs).reduce((a, b) => a + b, 0);
    if (total !== 60) {
        UI.showMessage('请分配完所有属性点');
        return;
    }
    
    if (!game.player.sectId) {
        UI.showMessage('请选择一个宗门');
        return;
    }
    
    // 重置单局数据，保留模式
    const sectId = game.player.sectId;
    const baseAttrs = { ...game.player.baseAttrs };
    const mode = game.mode;
    
    game.reset();
    game.mode = mode;
    game.player.baseAttrs = baseAttrs;
    game.joinSect(sectId);
    
    // 初始资源
    game.money = 100;
    game.tickets.normal = 2;
    
    UI.updateHeader();
    UI.hideAllModals();
    startCombat();
}

// 开始战斗
function startCombat() {
    combat.start(game.level);
    UI.showScreen('screen-combat');
    UI.renderCombat();
}

// 玩家使用技能
function useSkill(index) {
    if (combat.finished) return;
    
    const skill = game.player.skills[index];
    const result = combat.playerUseSkill(index);
    
    if (result) {
        // 播放特效
        if (skill.type === SKILL_TYPES.ACTIVE && result.damageInfo) {
            UI.playSkillEffect(skill, true, result.damageInfo.damage, result.damageInfo.isCrit);
        }
        
        UI.renderCombat();
        
        if (result.status === 'win') {
            setTimeout(() => onCombatWin(), 800);
        } else if (result.status === 'lose') {
            setTimeout(() => onCombatLose(), 800);
        }
    }
}

// 战斗胜利
function onCombatWin() {
    const enemy = combat.enemy;
    
    // 金钱奖励
    let moneyReward = 10 + game.level * 2;
    if (enemy.isBoss) moneyReward *= 3;
    if (enemy.isBigBoss) moneyReward *= 10;
    game.addMoney(Math.floor(moneyReward));
    
    // 战后恢复
    const body = game.getTotalAttr('body');
    let healPercent = 5 + body * 0.1;
    if (enemy.isBoss) healPercent += 20;
    if (enemy.isBigBoss) healPercent += 50;
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + Math.floor(game.player.maxHp * healPercent / 100));
    game.player.mp = Math.min(game.player.maxMp, game.player.mp + Math.floor(game.player.maxMp * 0.2));
    
    // 生成奖励
    const luck = game.getTotalAttr('luck');
    currentRewards = rewards.generateRewards(game.level, enemy, luck);
    selectedRewardIndex = null;
    pendingSkillReward = null;
    
    // Boss掉落抽奖券
    if (enemy.isBoss || enemy.isBigBoss) {
        if (enemy.isBigBoss) {
            game.addItem({ ...getItem('advanced_ticket') });
        } else {
            game.addItem({ ...getItem('normal_ticket') });
        }
    }
    
    // 自动存档
    saveSystem.save();
    
    UI.updateHeader();
    UI.renderCombat();
    UI.renderRewards(currentRewards);
    document.getElementById('reward-desc').textContent = `战胜了 ${enemy.name}！获得 ${Math.floor(moneyReward)} 金钱。请选择奖励。`;
    UI.showModal('reward-modal');
}

// 战斗失败
function onCombatLose() {
    UI.renderGameOver('lose');
    UI.showScreen('screen-gameover');
    UI.hideAllModals();
}

// 选择奖励
function selectReward(index) {
    selectedRewardIndex = index;
    UI.renderRewards(currentRewards);
    
    const reward = currentRewards[index];
    if (reward.type === 'skill') {
        pendingSkillReward = reward.data;
        UI.renderSkillEquip(reward.data);
        UI.showModal('skill-equip-modal');
    } else {
        rewards.applyReward(reward);
        currentRewards = [];
        selectedRewardIndex = null;
        UI.renderRewards([]);
        UI.updateHeader();
        UI.renderCombat();
        UI.showMessage(`获得 ${reward.name}`);
    }
}

// 装备功法到指定槽位
function equipSkillToSlot(slotIndex) {
    if (!pendingSkillReward) return;
    
    game.equipSkill(slotIndex, pendingSkillReward);
    game.collectSkill(pendingSkillReward.id);
    
    const reward = currentRewards[selectedRewardIndex];
    rewards.applyReward(reward);
    
    currentRewards = [];
    selectedRewardIndex = null;
    pendingSkillReward = null;
    
    UI.hideModal('skill-equip-modal');
    UI.hideModal('reward-modal');
    UI.renderRewards([]);
    UI.updateHeader();
    UI.renderCombat();
    UI.showMessage('功法已装备');
}

// 进入下一关
function nextLevel() {
    UI.hideModal('reward-modal');
    const result = game.nextLevel();
    if (result === 'victory') {
        UI.renderGameOver('victory');
        UI.showScreen('screen-gameover');
        return;
    }
    
    UI.updateHeader();
    startCombat();
}

// 打开背包
function openBag() {
    if (!game.player.sectId) {
        UI.showMessage('请先开始游戏');
        return;
    }
    UI.renderBag();
    UI.showModal('bag-modal');
}

// 打开商店
function openShop() {
    if (!game.player.sectId) {
        UI.showMessage('请先开始游戏');
        return;
    }
    const luck = game.getTotalAttr('luck');
    shop.open(game.level, luck);
    UI.renderShop();
    UI.showModal('shop-modal');
}

// 刷新商店
function refreshShop() {
    const luck = game.getTotalAttr('luck');
    if (shop.refresh(game.level, luck)) {
        UI.renderShop();
    } else {
        UI.showMessage('金钱不足');
    }
}

// 购买商店物品
function buyShopItem(itemId) {
    const item = game.shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    const result = shop.buy(item);
    if (result.success) {
        UI.renderShop();
        UI.updateHeader();
        UI.showMessage(result.message);
    } else {
        UI.showMessage(result.message);
    }
}

// 打开抽卡
function openGacha() {
    if (!game.player.sectId) {
        UI.showMessage('请先开始游戏');
        return;
    }
    UI.renderGacha();
    UI.showModal('gacha-modal');
}

// 抽卡
function doGacha(poolType, times) {
    const result = gacha.draw(poolType, times);
    if (result.success) {
        UI.renderGachaResult(result.results);
        UI.updateHeader();
        UI.renderGacha(); // 刷新按钮状态
        UI.showMessage(`抽卡完成！获得 ${result.results.length} 个物品`);
    } else {
        UI.showMessage(result.message);
    }
}

// 使用背包物品
function useInventoryItem(index) {
    const item = game.player.inventory[index];
    if (!item) return;
    
    if (item.type === ITEM_TYPES.TICKET) {
        if (item.id === 'normal_ticket') game.tickets.normal++;
        if (item.id === 'advanced_ticket') game.tickets.advanced++;
        game.player.inventory.splice(index, 1);
        UI.showMessage(`已获得 ${item.name}，可在抽卡界面使用`);
    } else {
        const result = game.useItem(item);
        if (result) {
            UI.showMessage(`使用了 ${item.name}`);
        } else {
            UI.showMessage('无法使用该物品');
        }
    }
    
    UI.updateHeader();
    UI.renderBag();
    UI.renderCombat();
}
