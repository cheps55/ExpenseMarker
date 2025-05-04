
const useLanguage = (language: 'en' | 'zh' = 'zh') => {
    const get = (key: string) => {
        if (!Lang[key]) { return ''; }
        if (!Lang[key][language]) { return ''; }
        return Lang[key][language];
    };

    return {
        get: get,
    };
};

interface ILanguage {
    [key: string]: {[key: string]: string}
}

const Lang: ILanguage = Object.freeze({
    'no_internet': {
        'en': '(No Internet)',
        'zh': '(無網路)',
    },
    'delete_local_data': {
        'en': 'Delete local data',
        'zh': '刪除本地資料',
    },
    'back_up': {
        'en': 'Back up',
        'zh': '備份',
    },
    'sync.from': {
        'en': 'Sync from cloud',
        'zh': '同步自雲端',
    },
    'sync.to': {
        'en': 'Sync to cloud',
        'zh': '同步至雲端',
    },
    'sync.last_sync': {
        'en': 'Last Sync',
        'zh': '最後同步',
    },
    'action_log': {
        'en': 'Action log',
        'zh': '同步記錄',
    },
    'go_back': {
        'en': 'Go back',
        'zh': '返回',
    },
    'clear_action_log': {
        'en': 'Clear action log',
        'zh': '清除同步記錄',
    },
    'date': {
        'en': 'Date',
        'zh': '日期',
    },
    'sum': {
        'en': 'Sum',
        'zh': '總額',
    },
    'shop.name': {
        'en': 'Shop Name',
        'zh': '店名',
    },
    'price': {
        'en': 'Price',
        'zh': '價格',
    },
    'dropdown.food': {
        'en': 'Food',
        'zh': '飲食',
    },
    'dropdown.entertainment': {
        'en': 'Entertainment',
        'zh': '娛樂',
    },
    'tag': {
        'en': 'Tag',
        'zh': '標籤',
    },
    'tag.description': {
        'en': 'Tag (Use "," to split tag)',
        'zh': '標籤 (使用 “,” 分割標籤)',
    },
    'confirm': {
        'en': 'Confirm',
        'zh': '確認',
    },
    'batch_change_name_group': {
        'en': 'Batch Change Name/Group',
        'zh': '批量更改名稱/組別',
    },
    'clear': {
        'en': 'Clear',
        'zh': '清除',
    },
    'close': {
        'en': 'Close',
        'zh': '關閉',
    },
    'pop_up.edit': {
        'en': 'Edit',
        'zh': '編輯',
    },
    'page.main': {
        'en': 'Main',
        'zh': '首頁',
    },
    'page.searchPage': {
        'en': 'Search',
        'zh': '搜尋',
    },
    'page.setting': {
        'en': 'Setting',
        'zh': '設定',
    },
});

export default useLanguage;
