// 五行修仙录 - UI 渲染

const UI = {
    // 当前打开的弹窗
    currentModal: null,

    // 切换屏幕
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        // 初始模式选择界面隐藏顶部信息栏
        if (screenId === 'screen-mode') {
            document.body.classList.add('mode-screen-active');
        } else {
            document.body.classList.remove('mode-screen-active');
        }
    },

    // 弹窗控制
    showModal(modalId) {
        this.hideAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modalId;
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            if (this.currentModal === modalId) {
                this.currentModal = null;
            }
        }
    },

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        this.currentModal = null;
    },

    // 更新顶部信息
    updateHeader() {
        document.getElementById('mode-display').textContent = game.mode === 'classic' ? '经典模式' : '无尽模式';
        document.getElementById('level-display').textContent = `第 ${game.level} 关`;
        document.getElementById('money-display').textContent = `金钱 ${game.money}`;
        document.getElementById('ticket-display').textContent = `普通券 ${game.tickets.normal} | 高级券 ${game.tickets.advanced}`;
        
        const endlessBtn = document.getElementById('mode-endless');
        if (endlessBtn) {
            endlessBtn.disabled = !game.endlessUnlocked;
            endlessBtn.title = game.endlessUnlocked ? '无尽模式' : '通关经典模式后解锁';
        }
    },

    // 渲染模式选择
    renderModeScreen() {
        // 模式屏幕主要由 HTML/CSS 控制，无需额外渲染
    },

    // 渲染角色创建
    renderCreateScreen() {
        const sectList = document.getElementById('sect-list');
        sectList.innerHTML = Object.values(SECTS).map(sect => `
            <div class="sect-card ${game.player.sectId === sect.id ? 'selected' : ''}" data-sect="${sect.id}" onclick="selectSect('${sect.id}')">
                <h4>${sect.name}</h4>
                <p class="element">五行偏向：${sect.element}</p>
                <p class="desc">${sect.desc}</p>
            </div>
        `).join('');
        
        this.renderSectPreview();
        this.renderAttrEditor();
    },

    renderSectPreview() {
        const preview = document.getElementById('sect-preview');
        if (!game.player.sectId) {
            preview.innerHTML = '<p>请选择宗门</p>';
            return;
        }
        const sect = SECTS[game.player.sectId];
        const coreSkills = sect.coreSkills.map(id => getSkill(id).name).join('、');
        preview.innerHTML = `
            <h4>${sect.name}</h4>
            <p><b>五行偏向：</b>${sect.element}</p>
            <p><b>特色：</b>${sect.desc}</p>
            <p><b>初始功法：</b>${sect.startingSkills.map(id => getSkill(id).name).join('、')}</p>
            <p><b>核心功法：</b>${coreSkills}</p>
        `;
    },

    renderAttrEditor() {
        const editor = document.getElementById('attr-editor');
        const attrNames = {
            hp: '血量',
            strength: '力量',
            inner: '内力',
            body: '体质',
            agility: '敏捷',
            luck: '气运'
        };
        
        const total = Object.values(game.player.baseAttrs).reduce((a, b) => a + b, 0);
        const remaining = 60 - total;
        
        editor.innerHTML = Object.keys(attrNames).map(attr => {
            const current = game.player.baseAttrs[attr] || 0;
            const canAdd = remaining > 0;
            const canMinus = current > 0;
            return `
                <div class="attr-row">
                    <label>${attrNames[attr]}</label>
                    <div class="attr-controls">
                        <button onclick="changeAttr('${attr}', -1)" ${!canMinus ? 'disabled' : ''}>-</button>
                        <span class="attr-value" id="attr-${attr}">${current}</span>
                        <button onclick="changeAttr('${attr}', 1)" ${!canAdd ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('attr-points').textContent = remaining;
    },

    // 渲染战斗
    renderCombat() {
        if (!combat.enemy) return;
        
        document.getElementById('combat-round').textContent = combat.round;
        document.getElementById('enemy-name').textContent = combat.enemy.name;
        
        // 五行徽章
        const playerBadge = document.getElementById('player-element');
        const enemyBadge = document.getElementById('enemy-element');
        const playerMainElement = game.player.skills[0] ? game.player.skills[0].element : ELEMENTS.METAL;
        playerBadge.textContent = playerMainElement;
        enemyBadge.textContent = combat.enemy.element;
        this.applyElementClass(playerBadge, playerMainElement);
        this.applyElementClass(enemyBadge, combat.enemy.element, true);
        
        // 角色模型颜色
        this.updatePlayerModel();
        this.updateEnemyModel();
        
        // 血条内力
        this.updateBars();
        
        // 技能栏
        this.renderSkillBar();
        
        // 日志
        this.renderCombatLog();
    },

    updateBars() {
        const playerHpPercent = Math.max(0, game.player.hp / game.player.maxHp * 100);
        const enemyHpPercent = Math.max(0, combat.enemy.hp / combat.enemy.maxHp * 100);
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
        document.getElementById('player-hp-text').textContent = `${game.player.hp}/${game.player.maxHp}`;
        document.getElementById('enemy-hp-text').textContent = `${combat.enemy.hp}/${combat.enemy.maxHp}`;
        
        const playerMpPercent = Math.max(0, game.player.mp / game.player.maxMp * 100);
        document.getElementById('player-mp-bar').style.width = `${playerMpPercent}%`;
        document.getElementById('player-mp-text').textContent = `${game.player.mp}/${game.player.maxMp}`;
    },

    renderSkillBar() {
        const actions = document.getElementById('combat-actions');
        actions.innerHTML = game.player.skills.map((skill, index) => {
            const disabled = skill.currentCd > 0 || game.player.mp < skill.mpCost || combat.finished;
            const cdText = skill.currentCd > 0 ? `冷却 ${skill.currentCd}` : '';
            return `
                <button class="skill-btn" onclick="useSkill(${index})" ${disabled ? 'disabled' : ''}>
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-meta">${skill.element} | 耗蓝 ${skill.mpCost} ${cdText}</span>
                </button>
            `;
        }).join('');
    },

    renderCombatLog() {
        const logPanel = document.getElementById('combat-log');
        logPanel.innerHTML = combat.logs.map(log => `<div class="log-${log.type}">${log.message}</div>`).join('');
        logPanel.scrollTop = logPanel.scrollHeight;
    },

    // 应用五行颜色类
    applyElementClass(element, elementName, isEnemy = false) {
        element.classList.remove('element-metal', 'element-wood', 'element-water', 'element-fire', 'element-earth', 'element-chaos');
        const map = {
            [ELEMENTS.METAL]: 'element-metal',
            [ELEMENTS.WOOD]: 'element-wood',
            [ELEMENTS.WATER]: 'element-water',
            [ELEMENTS.FIRE]: 'element-fire',
            [ELEMENTS.EARTH]: 'element-earth',
            [ELEMENTS.CHAOS]: 'element-chaos'
        };
        const cls = map[elementName];
        if (cls) element.classList.add(cls);
        if (isEnemy) element.classList.add('enemy');
    },

    // 更新玩家模型颜色
    updatePlayerModel() {
        const body = document.querySelector('#player-cultivator .body');
        const aura = document.querySelector('#player-cultivator .aura');
        const sect = SECTS[game.player.sectId];
        
        const colorMap = {
            [ELEMENTS.METAL]: '#a0a0a0',
            [ELEMENTS.WOOD]: '#2d6a4f',
            [ELEMENTS.WATER]: '#1e6091',
            [ELEMENTS.FIRE]: '#922b21',
            [ELEMENTS.EARTH]: '#7d6608',
            [ELEMENTS.CHAOS]: '#6c3483'
        };
        
        const auraColorMap = {
            [ELEMENTS.METAL]: '212, 160, 48',
            [ELEMENTS.WOOD]: '92, 184, 92',
            [ELEMENTS.WATER]: '91, 192, 222',
            [ELEMENTS.FIRE]: '217, 83, 79',
            [ELEMENTS.EARTH]: '240, 173, 78',
            [ELEMENTS.CHAOS]: '155, 89, 182'
        };
        
        const element = sect ? sect.element : ELEMENTS.METAL;
        const color = colorMap[element];
        const auraColor = auraColorMap[element];
        
        if (body) body.style.background = `linear-gradient(180deg, ${color}, ${this.darken(color, 20)})`;
        if (aura) aura.style.background = `radial-gradient(ellipse, rgba(${auraColor}, 0.4), transparent 70%)`;
    },

    // 更新敌人模型
    updateEnemyModel() {
        const aura = document.querySelector('#enemy-monster .m-aura');
        if (!aura) return;
        
        const auraColorMap = {
            [ELEMENTS.METAL]: '192, 192, 192',
            [ELEMENTS.WOOD]: '92, 184, 92',
            [ELEMENTS.WATER]: '91, 192, 222',
            [ELEMENTS.FIRE]: '217, 83, 79',
            [ELEMENTS.EARTH]: '240, 173, 78',
            [ELEMENTS.CHAOS]: '155, 89, 182'
        };
        
        const auraColor = auraColorMap[combat.enemy.element] || '192, 64, 48';
        aura.style.background = `radial-gradient(ellipse, rgba(${auraColor}, 0.4), transparent 70%)`;
    },

    darken(color, percent) {
        // 简单的颜色变暗
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    // 播放技能特效
    playSkillEffect(skill, isPlayer, damage, isCrit, isHeal = false) {
        const targetId = isPlayer ? 'enemy-model' : 'player-model';
        const target = document.getElementById(targetId);
        if (!target) return;
        
        const rect = target.getBoundingClientRect();
        const effectSize = 140;
        const x = rect.left + rect.width / 2 - effectSize / 2;
        const y = rect.top + rect.height / 2 - effectSize / 2;
        
        // 攻击方动画
        const actorId = isPlayer ? 'player-cultivator' : 'enemy-monster';
        const actor = document.getElementById(actorId);
        if (actor) {
            actor.classList.remove('attack');
            void actor.offsetWidth; // 触发重排
            actor.classList.add('attack');
            setTimeout(() => actor.classList.remove('attack'), 600);
        }
        
        // 受击方动画
        setTimeout(() => {
            const hitTarget = isPlayer ? document.getElementById('enemy-monster') : document.getElementById('player-cultivator');
            if (hitTarget) {
                hitTarget.classList.remove('hit');
                void hitTarget.offsetWidth;
                hitTarget.classList.add('hit');
                setTimeout(() => hitTarget.classList.remove('hit'), 500);
            }
        }, 250);
        
        // 元素特效与飘字
        setTimeout(() => {
            const layer = document.getElementById('effects-layer');
            if (!layer) return;
            
            const effect = document.createElement('div');
            effect.className = `skill-effect ${this.getEffectClass(skill.element)}`;
            effect.style.left = `${x}px`;
            effect.style.top = `${y}px`;
            layer.appendChild(effect);
            setTimeout(() => effect.remove(), 1200);
            
            // 飘字
            this.showFloatingNumber(rect.left + rect.width / 2, rect.top, damage, isCrit, isHeal);
        }, 350);
    },

    getEffectClass(element) {
        const map = {
            [ELEMENTS.METAL]: 'effect-slash',
            [ELEMENTS.WOOD]: 'effect-wood',
            [ELEMENTS.WATER]: 'effect-ice',
            [ELEMENTS.FIRE]: 'effect-fire',
            [ELEMENTS.EARTH]: 'effect-slash',
            [ELEMENTS.CHAOS]: 'effect-chaos'
        };
        return map[element] || 'effect-slash';
    },

    showFloatingNumber(x, y, number, isCrit, isHeal) {
        const el = document.createElement('div');
        el.className = isHeal ? 'heal-number' : (isCrit ? 'damage-number crit' : 'damage-number');
        el.textContent = number;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = 'translate(-50%, -50%)';
        const layer = document.getElementById('effects-layer');
        if (layer) layer.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    },

    // 渲染背包
    renderBag() {
        const equipGrid = document.getElementById('bag-equipment-grid');
        const itemGrid = document.getElementById('bag-items-grid');
        
        if (game.player.equipment.length === 0) {
            equipGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">暂无装备</p>';
        } else {
            equipGrid.innerHTML = game.player.equipment.map((item, index) => `
                <div class="bag-item">
                    <div class="name ${item.rarity.color}">${item.name}</div>
                    <div class="desc">${item.desc}</div>
                </div>
            `).join('');
        }
        
        if (game.player.inventory.length === 0) {
            itemGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">背包空空如也</p>';
        } else {
            itemGrid.innerHTML = game.player.inventory.map((item, index) => `
                <div class="bag-item" onclick="useInventoryItem(${index})">
                    <div class="name ${item.rarity.color}">${item.name}</div>
                    <div class="desc">${item.desc}</div>
                </div>
            `).join('');
        }
    },

    // 渲染商店
    renderShop() {
        document.getElementById('shop-money').textContent = game.money;
        document.getElementById('refresh-cost').textContent = game.shopRefreshCost;
        
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = game.shopItems.map(item => `
            <div class="shop-item" onclick="buyShopItem('${item.id}')">
                <div class="name ${item.rarity.color}">${item.name}</div>
                <div class="desc">${item.desc}</div>
                <div class="price">${item.shopPrice} 金钱</div>
            </div>
        `).join('');
    },

    // 渲染抽卡
    renderGacha() {
        const container = document.getElementById('gacha-pools');
        container.innerHTML = `
            <div class="pool-card">
                <h4>普通卡池</h4>
                <p>50 金钱 或 1 普通券 / 次</p>
                <p>十连保底灵品</p>
                <button class="big-btn" onclick="doGacha('normal', 1)">单抽</button>
                <button class="big-btn" onclick="doGacha('normal', 10)">十连</button>
            </div>
            <div class="pool-card">
                <h4>高级卡池</h4>
                <p>1 高级券 / 次</p>
                <p>十连保底玄品，五十连保底地品</p>
                <button class="big-btn" onclick="doGacha('advanced', 1)" ${game.tickets.advanced < 1 ? 'disabled' : ''}>单抽</button>
                <button class="big-btn" onclick="doGacha('advanced', 10)" ${game.tickets.advanced < 10 ? 'disabled' : ''}>十连</button>
            </div>
        `;
        
        document.getElementById('gacha-result').innerHTML = '';
    },

    renderGachaResult(results) {
        const container = document.getElementById('gacha-result');
        container.innerHTML = results.map(r => `
            <div class="reward-card">
                <h4 class="${r.rarity.color}">${r.item.name} ${r.isGuarantee ? '(保底)' : ''}</h4>
                <p class="desc">${r.item.desc}</p>
                <p class="rarity">${r.rarity.name}</p>
            </div>
        `).join('');
    },

    // 渲染奖励
    renderRewards(rewards) {
        const grid = document.getElementById('reward-grid');
        grid.innerHTML = rewards.map((reward, index) => `
            <div class="reward-card ${selectedRewardIndex === index ? 'selected' : ''}" onclick="selectReward(${index})">
                <h4 class="${reward.rarity.color}">${reward.name}</h4>
                <p class="desc">${reward.desc}</p>
                <p class="rarity">${reward.rarity.name}</p>
            </div>
        `).join('');
        
        document.getElementById('next-level-btn').disabled = selectedRewardIndex === null;
    },

    // 渲染技能装备弹窗
    renderSkillEquip(skill) {
        const list = document.getElementById('skill-slot-list');
        list.innerHTML = game.player.skills.map((s, index) => `
            <button class="skill-slot-btn" onclick="equipSkillToSlot(${index})">
                <span class="slot-num">槽位 ${index + 1}</span>
                <span class="slot-skill">当前：${s.name}</span>
            </button>
        `).join('');
    },

    // 渲染结束界面
    renderGameOver(result) {
        const title = document.getElementById('gameover-title');
        const desc = document.getElementById('gameover-desc');
        const stats = document.getElementById('gameover-stats');
        
        if (result === 'victory') {
            title.textContent = '飞升成仙';
            title.style.color = 'var(--gold)';
            desc.textContent = '你击败了混沌天魔，经典模式通关！无尽模式已解锁。';
            game.endlessUnlocked = true;
        } else {
            title.textContent = '道友陨落';
            title.style.color = 'var(--red)';
            desc.textContent = '本局修仙结束，但永久进度已保存。';
        }
        
        stats.innerHTML = `
            <p class="stat-row"><span>到达关卡</span><span>${game.level}</span></p>
            <p class="stat-row"><span>收集功法</span><span>${game.collectedSkills.size}</span></p>
            <p class="stat-row"><span>总抽卡次数</span><span>${game.totalGachaCount}</span></p>
            <p class="stat-row"><span>已解锁宗门</span><span>${game.unlockedSects.length}</span></p>
            <p class="stat-row"><span>持有金钱</span><span>${game.money}</span></p>
        `;
    },

    // 提示
    showMessage(message) {
        // 使用自定义弹窗替代 alert
        const existing = document.getElementById('message-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'message-toast';
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 24, 18, 0.95);
            border: 2px solid var(--gold);
            color: var(--text-color);
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 2000;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
};
