
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
    'sync.from': {
        'en': 'Sync from cloud ↓',
        'zh': '同步自雲端 ↓',
    },
    'sync.to': {
        'en': 'Sync to cloud ↑',
        'zh': '同步至雲端 ↑',
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
    'page.chart': {
        'en': 'Chart',
        'zh': '圖表',
    },
});

export default useLanguage;
