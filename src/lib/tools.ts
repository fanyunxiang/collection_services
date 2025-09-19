export function formatMessageTime(timestamp: string) {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - messageDate.getTime()) / (60 * 1000),
  );
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // For messages from today, show time
  if (diffInDays === 0) {
    // If less than 60 minutes ago, show "X min"
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? "just now" : `${diffInMinutes}m`;
    }
    // Otherwise show time like "4:39 PM"
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // For messages from this week, show day name
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString("en-US", { weekday: "long" });
  }

  // For messages from this year, show date
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  // For older messages, show date with year
  return messageDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function compactFormat(value: number) {
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });

  return formatter.format(value);
}

export function standardFormat(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const TOKEN_KEY = "clearanceCenterToken"

// /**
//  * @param {String} token
//  * @description 存入token
//  */
// export const setToken = (token: string | null): void => {
//   Cookies.set(TOKEN_KEY, token, { expires: config.cookieExpires ?? 1 });
// };

// /**
//  * @description 从cookie中取出token
//  */
// export const getToken = (): string => {
//   const token = Cookies.get(TOKEN_KEY);
//   return token || '';
// };

/**
 * @param {String} name
 * @description 下划线转换驼峰
 */
export const linetoHump = (name: string): string => {
  return name.replace(/_(\w)/g, (all, letter)=> {
    return letter.toUpperCase();
  });
};

/**
 * @param {String} name
 * @description 驼峰转换下划线
 */
export const humptoLine = (name: string): string => {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
};

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的交集, 两个数组的元素为数值或字符串
 */

export const getIntersection = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((item) => arr2.includes(item));
};
/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的并集, 两个数组的元素为数值或字符串
 */
export const getUnion = <T>(arr1: T[], arr2: T[]): T[] => {
  return [...new Set([...arr1, ...arr2])];
};

/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 */
export const hasOneOf = <T>(target: T[], arr: T[]): boolean => {
  return target.some((elem) => arr.includes(elem));
};

/**
 * @param {Number} timeStamp 判断时间戳格式是否是毫秒
 * @returns {Boolean}
 */

export const isMillisecond = (timeStamp: number): boolean => {
  return timeStamp.toString().length > 10;
};

/**
 * @param {Number} num 数值
 * @returns {String} 处理后的字符串
 * @description 如果传入的数值小于10，即位数只有1位，则在前面补充0
 */
const getHandledValue = (num: number | string): string => {
  return Number(num) < 10 ? "0" + num : num.toString();
};

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {String} startType 要返回的时间字符串的格式类型，传入'year'则返回年开头的完整时间
 * @param {String} endType 要返回的时间字符串的格式类型，传入'second'则返回年开头的完整时间
 */
export const getDate = (
  timeStamp: number | string,
  startType?: string,
  endType?: string
): string => {
  const d = new Date(Number(timeStamp) * 1000);
  const year = startType === "year" ? `${d.getFullYear()}-` : "";
  const month = getHandledValue(d.getMonth() + 1);
  const date = getHandledValue(d.getDate());
  const hours = getHandledValue(d.getHours());
  const minutes = getHandledValue(d.getMinutes());
  const second =
    endType === "second" ? `:${getHandledValue(d.getSeconds())}` : "";
  return `${year}${month}-${date} ${hours}:${minutes}${second}`;
};

/**
 * @param {String | Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串
 */
export const getRelativeTime = (timeStamp: number): string => {
  const diff = Math.floor((Date.now() - timeStamp) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return new Date(timeStamp).toLocaleDateString();
};

/**
 * @description  {String}返回当前浏览器名称
 */
export const getExplorer = (): string => {
  const ua = window.navigator.userAgent;
  switch (true) {
    case /MSIE|Trident/.test(ua):
      return "IE";
    case /Firefox/.test(ua):
      return "Firefox";
    case /Chrome/.test(ua):
      return "Chrome";
    case /Opera/.test(ua):
      return "Opera";
    case /Safari/.test(ua):
      return "Safari";
    default:
      return "Unknown";
  }
};

/**
 * @description 判断一个对象是否存在key，如果传入第二个参数key，则是判断这个obj对象是否存在key这个属性
 * 如果没有传入key这个参数，则判断obj对象是否有键值对
 */
export const hasKey = <T extends object>(obj: T, key: keyof T): boolean => {
  return key in obj;
};

/**
 * @param {*} obj1 对象1
 * @param {*} obj2 对象2
 * @description 判断两个对象是否相等，这两个对象的值只能是数字或字符串
 */
export const objEqual = (
  obj1: Record<string, number>,
  obj2: Record<string, number>
): boolean => {
  return Object.keys(obj1).every(
    (key) => obj2.hasOwnProperty(key) && obj2[key] === obj1[key]
  );
};

/**
 * @param {object} obj
 * @description 深拷贝
 */

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))


/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on =  (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject
): void =>{
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
};

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off =  (
  element: HTMLElement | Document | Window,
  event: string,
  handler: any
): void=> {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false);
  }
};


/**
 * @param {String | Number} timestamp 时间戳
 * @param {String } fmt 格式
 * @returns {String} 指定格式的时间样式
 * @description 格式化时间戳
 */
export const formatDate = (timestamp: number | string, fmt = 'yyyy-MM-dd hh:mm:ss'): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const padLeftZero = (str: string | number): string => {
    return `00${str}`.slice(-2);
  };

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return fmt.replace(/yyyy/g, year.toString())
            .replace(/MM/g, padLeftZero(month))
            .replace(/dd/g, padLeftZero(day))
            .replace(/hh/g, padLeftZero(hour))
            .replace(/mm/g, padLeftZero(minute))
            .replace(/ss/g, padLeftZero(second));
};

/**
 * @param {String | Number} intnum 需要格式化的厘
 * @description 厘截取两位小数
 */
export const moneyli2yuan = (intnum: number | string): string => {
  const num = Math.round(Number(intnum) / 1000) / 100;
  return formatMoney(num);
}

/**
 * @param {String | Number} num 需要转为货币格式的参数
 * @description 把参数转化为货币格式
 */
export const formatMoney = (num: number | string): string => {
  if (!num || typeof num === 'object') {return "0.00"}
  const hasComma = /,/
  if (hasComma.test(num as string)) {
    num = (num as string).replace(/,/g, '');
  }
  const [left, right = ""] = String(num).split(".")
  let formattedLeft = left.split("").reverse().reduce((acc, curr, i) => {
    return curr + (i > 0 && i % 3 === 0 ? "," : "") + acc
  }, "")

  formattedLeft = formattedLeft.replace(/-,/g, "-")
  const formattedRight = right.padEnd(2, "0").slice(0, 2)
  return `${formattedLeft}.${formattedRight}`
}

/**
 * 将人民币转换为厘
 * @param {number} floatNum - 人民币金额
 * @returns {number} 厘
 */
export const moneyToLi = (floatNum: number): number => {
  const floatStr = floatNum.toString().replace(/,/g, '');
  const parsedFloat = parseFloat(floatStr);
  return isNaN(parsedFloat) ? 0 : Math.round(parsedFloat * 1000);
};


/**
 * @description 格式化秒数
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的字符串
 */
export const formatSecond = (seconds: number| string): string => {
  if (!seconds) {
    return '0秒';
  }

  const { floor } = Math;
  const numSeconds = Number(seconds);
  const numMinutes = floor(numSeconds / 60);
  const remainingSeconds = numSeconds % 60;
  const numHours = floor(numMinutes / 60);
  const remainingMinutes = numMinutes % 60;
  const hoursStr = numHours > 0 ? `${numHours}时` : '';
  const minutesStr = numMinutes > 0 ? `${String(remainingMinutes).padStart(2, '0')}分` : '';
  const secondsStr = `${String(remainingSeconds).padStart(2, '0')}秒`;

  return `${hoursStr}${minutesStr}${secondsStr}`;
};

/**
 * @description 格式化持续时间
 * @param {number} intnum - 需要格式化的时间
 * @param {boolean} _zh - 是否为中文格式
 * @returns {string} 格式化后的时间
 */
export const formatDuration = (intnum: number | string, _zh?: boolean | string): string => {
  if (!intnum) {
    return !_zh ? "00:00:00" : "0秒";
  }
  intnum = Number(intnum)
  const h = Math.floor(intnum / 3600);
  const m = Math.floor((intnum % 3600) / 60);
  const s = (intnum % 60).toFixed(0);
  const out = _zh
    ? `${h}小时${m}分钟${s}秒`
    : `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return out;
};


/**
 * @param {String} DictionaryKey 字典的key
 * @param {*} inputValue 字典的value
 * @param {*} format 格式
 * @description 根据传入的key 将参数格式化为指定样式
 */

export const getDictionaryName = (mapkey: string | Array<{ name: string, value: any }>, value: any, _fmt?: string): string => {
  switch (mapkey) {
    case 'formatDate':
      return value ? formatDate(value, _fmt) : ''
    case 'formatDuration':
      return value ? formatDuration(value) : '00:00:00'
    case 'zhFormatDuration':
      return value ? formatDuration(value, 'zh') : '0秒'
    case 'formatMoney':
      return formatMoney(value)
    case 'time':
      return value ? formatSecond(value) : '0秒'
    case 'depName':
    case 'teamName':
      return value || '-'
    default:
      const dictionary = Array.isArray(mapkey) ? mapkey : []
      if (!dictionary.length) { return '' }

      const values = typeof value === 'string' ? value.split(',') : [value]
      const names = dictionary.reduce((acc:any, item) => {
        if (values.includes(String(item.value))) {
          acc.push(item.name)
        }
        return acc
      }, [])
      return names.join(',')
  }
}

/**
 * @param {String} key 存入本地的key
 * @param {*} value 存入本地的value
 * @description 本地存储
 */
export const localSave = (key: string, value: any): void => {
  localStorage.setItem(key, value)
};


/**
 * @param {String} key 查询本地的key
 * @description 本地提取参数
 */
export const localRead = (key: string) :any => {
  return localStorage.getItem(key) || ""
};

/**
 * @param {String} url 浏览器的url
 * @description 把url中的参数转为对象
 */
export const getParams = (url: string): Record<string, string> => {
  const [, queryString] = url.split('?');
  if (!queryString) {
    return {};
  }
  return queryString.split('&').reduce((params, param) => {
    const [key, value] = param.split('=');
    return { ...params, [key]: value };
  }, {});
};

/**
 * @param {String} url 货币格式的参数
 * @description 把货币格式的参数转为number
 */
export const currencyToNumber = (currency: string): number => {
  if (!currency) return 0
  return parseFloat(currency.replace(/,/g, ''))
};

/**
 * @param {String|Number} value 要验证的字符串或数值
 * @param {*} validList 用来验证的列表
 */
export const oneOf = (value: string | number, validList: string[] | number[]): boolean => {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}

/**
 * 查找数组对象的某个下标
 * @param {Array} ary 查找的数组
 * @param {Functon} fn 判断的方法
 */
// eslint-disable-next-line
export const findIndex = (ary: Array<any>, fn: Fn): number => {
  if (ary.findIndex) {
    return ary.findIndex(fn)
  }
  let index = -1
  ary.some((item: any, i: number, ary: Array<any>) => {
    const ret: any = fn(item, i, ary)
    if (ret) {
      index = i
      return ret
    }
  })
  return index
}