
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

const Lang: {[key: string]: {[key: string]: string}} = Object.freeze({
    'sync.from': {
        'en': 'Sync from cloud',
        'zh': '同步自',
    },
    'sync.to': {
        'en': 'Sync to cloud',
        'zh': '同步至',
    },
    'confirm': {
        'en': 'Confirm',
        'zh': '確認',
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
    'date': {
        'en': 'Date',
        'zh': '日期',
    },
    'sum': {
        'en': 'Sum',
        'zh': '總額',
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
});

export default useLanguage;
