// 五行修仙录 - 商店系统

class ShopSystem {
    constructor() {
        this.baseRefreshCost = 50;
    }

    open(level, luck) {
        game.shopItems = generateShopItems(level, luck);
        game.shopRefreshCost = this.baseRefreshCost;
        return game.shopItems;
    }

    refresh(level, luck) {
        if (game.spendMoney(game.shopRefreshCost)) {
            game.shopItems = generateShopItems(level, luck);
            game.shopRefreshCost = Math.floor(game.shopRefreshCost * 1.5);
            return true;
        }
        return false;
    }

    buy(item) {
        const shopItem = game.shopItems.find(i => i.id === item.id);
        if (!shopItem) return { success: false, message: '商品不存在' };
        
        if (game.spendMoney(shopItem.shopPrice)) {
            game.addItem({ ...shopItem });
            // 从商店移除
            game.shopItems = game.shopItems.filter(i => i !== shopItem);
            return { success: true, message: `购买 ${shopItem.name} 成功` };
        }
        
        return { success: false, message: '金钱不足' };
    }
}

const shop = new ShopSystem();
