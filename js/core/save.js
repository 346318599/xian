// 仙途 - 存档系统

const SAVE_KEY = 'wuxia_roguelike_save';

class SaveSystem {
    save() {
        try {
            const data = game.getSaveData();
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return { success: true, message: '存档成功' };
        } catch (e) {
            return { success: false, message: '存档失败：' + e.message };
        }
    }

    load() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (!data) {
                return { success: false, message: '没有存档' };
            }
            game.loadSaveData(JSON.parse(data));
            return { success: true, message: '读档成功' };
        } catch (e) {
            return { success: false, message: '读档失败：' + e.message };
        }
    }

    hasSave() {
        return !!localStorage.getItem(SAVE_KEY);
    }

    delete() {
        localStorage.removeItem(SAVE_KEY);
    }
}

const saveSystem = new SaveSystem();
