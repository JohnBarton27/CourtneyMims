/* 
	Yottie
	Version: 2.3.1
	Release date: Thu Dec 01 2016
	
	elfsight.com
	
	Copyright (c) 2016 Elfsight, LLC. ALL RIGHTS RESERVED
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var $ = require('./jquery');
var Application = function () {
    var self = this;
    self.components = {};
};
$.extend(Application, { id: 'Application' });
Application.prototype = function () {
};
$.extend(Application.prototype, {
    constructor: Application,
    components: null,
    component: function (id) {
        var self = this;
        if (!self.hasComponent(id)) {
            return;
        }
        return self.components[id];
    },
    registerComponent: function (instance, id) {
        var self = this;
        if (self.hasComponent(id)) {
            return;
        }
        instance.register(self);
        id = id || instance.constructor.getId();
        self.components[id] = instance;
        return instance;
    },
    hasComponent: function (id) {
        var self = this;
        return !!self.components[id];
    }
});
module.exports = Application;
},{"./jquery":5}],2:[function(require,module,exports){
"use strict";
var $ = require('./jquery'), utils = require('./utils');
var Cl = function () {
};
$.extend(Cl, { id: 'Cl' });
Cl.prototype = function () {
};
$.extend(Cl.prototype, {
    constructor: Cl,
    getParent: function (id) {
        var self = this;
        return self.constructor.inheritance[id];
    },
    set: function (path, value) {
        var self = this;
        return utils.setProperty(self, path, value);
    },
    get: function (path, modifier) {
        var self = this;
        return utils.getProperty(self, path, modifier);
    }
});
module.exports = Cl;
},{"./jquery":5,"./utils":12}],3:[function(require,module,exports){
"use strict";
var $ = require('./jquery');
var Component = function () {
};
$.extend(Component, {
    id: 'Component',
    getId: function () {
        var constructor = this;
        return constructor.id.substr(0, 1).toLowerCase() + constructor.id.substr(1);
    }
});
Component.prototype = function () {
};
$.extend(Component.prototype, {
    constructor: Component,
    inject: function () {
        var self = this;
        if (!self.constructor.dependencies) {
            return;
        }
        $.each(self.constructor.dependencies, function (i, id) {
            self[id] = self.app.component(id);
        });
    },
    register: function (app) {
        var self = this;
        self.app = app;
        self.inject();
    },
    trigger: function () {
        var self = this;
        self.$e.trigger.apply(self.$e, arguments);
    },
    on: function () {
        var self = this;
        self.$e.on.apply(self.$e, arguments);
    }
});
module.exports = Component;
},{"./jquery":5}],4:[function(require,module,exports){
"use strict";
module.exports = function (number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep, dec = typeof dec_point === 'undefined' ? '.' : dec_point, s = '', toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k).toFixed(prec);
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
};
},{}],5:[function(require,module,exports){
"use strict";
module.exports = window.jQuery;
},{}],6:[function(require,module,exports){
"use strict";
var $ = require('./../../jquery'), Olivie = require('./../../olivie');
module.exports = Olivie.component('Colorizer', function (schemes, schemeId, overwrites, tplId) {
    var self = this;
    self.schemes = schemes;
    self.schemeId = schemeId;
    self.tplId = tplId;
    self.overwrites = overwrites || {};
    self.setBaseScheme(schemeId);
}, { dependencies: ['renderer'] }, {
    schemes: null,
    schemeId: null,
    baseScheme: null,
    scheme: null,
    overwrites: null,
    $element: null,
    setBaseScheme: function (id) {
        var self = this;
        self.baseScheme = self.schemes[self.schemeId] || {};
    },
    applyScheme: function () {
        var self = this;
        if (!self.$element) {
            self.$element = $('<style type="text/css"></style>');
            self.app.$element.before(self.$element);
        }
        self.overwrites = Olivie.utils.filterNulls(self.overwrites);
        self.scheme = $.extend(true, {}, self.baseScheme, self.overwrites);
        var data = {
                scheme: self.scheme,
                id: self.app.getId()
            };
        self.$element.html(self.renderer.render(self.tplId, data));
    },
    run: function () {
        var self = this;
        self.applyScheme();
        self.$element.insertBefore(self.app.$element);
    }
});
},{"./../../jquery":5,"./../../olivie":11}],7:[function(require,module,exports){
"use strict";
var $ = require('./../../jquery'), Olivie = require('./../../olivie');
module.exports = Olivie.component('I18n', function (dictionary, lang) {
    var self = this;
    self.lang = lang;
    self.dictionary = dictionary;
    self.langDictionary = self.dictionary[self.lang] || self.dictionary[self.constructor.DEFAULT_LANG];
}, { DEFAULT_LANG: 'en' }, {
    lang: null,
    dictionary: null,
    langDictionary: null,
    lexemes: [
        {
            id: 'interpolation',
            regex: /\{\{([a-zA-Z]+)\}\}/,
            func: function (matches, data) {
                return data[matches[1]] || '[[Unknown variable ' + matches[1] + ']]';
            }
        },
        {
            id: 'modified_interpolation',
            regex: /\{\{([a-zA-Z]+)\s*\|\s*([a-zA-Z]+)\(([^)]*)\)\}\}/,
            func: function (matches, data, component) {
                var variable = matches[1];
                var modifier = matches[2];
                var argsStr = matches[3];
                if (!component.modifiers[modifier]) {
                    return '[[Unknown modifier "' + modifier + '"]]';
                }
                var args = argsStr ? argsStr.split(/\s*,\s*/) : [];
                return component.modifiers[modifier].apply(data[variable], args);
            }
        }
    ],
    modifiers: {},
    hasTranslation: function (phrase) {
        var self = this;
        return !!self.langDictionary[phrase];
    },
    getTranslation: function (phrase) {
        var self = this;
        return self.langDictionary[phrase];
    },
    parse: function (input, data) {
        var self = this;
        $.each(self.lexemes, function (i, lex) {
            input = input.replace(lex.regex, function () {
                return lex.func.call(undefined, arguments, data, self);
            });
        });
        return input;
    },
    t: function (phrase, data) {
        var self = this;
        data = data || {};
        return self.parse(self.getTranslation(phrase) || phrase, data);
    }
});
},{"./../../jquery":5,"./../../olivie":11}],8:[function(require,module,exports){
"use strict";
var $ = require('./../../jquery'), Olivie = require('./../../olivie');
module.exports = Olivie.component('Renderer', function (views) {
    var self = this;
    self.views = views;
}, {}, {
    views: null,
    getTemplate: function (id) {
        var self = this;
        var tpl = Olivie.utils.getProperty(self.views, id);
        if ($.type(tpl) !== 'function') {
            return;
        }
        return tpl;
    },
    render: function (id, data) {
        var self = this;
        var tpl = self.getTemplate(id);
        return tpl(data);
    }
});
},{"./../../jquery":5,"./../../olivie":11}],9:[function(require,module,exports){
"use strict";
var $ = require('./../../jquery'), Olivie = require('./../../olivie');
module.exports = Olivie.class('Cache', [], function (cacheBaseId, client) {
    var self = this;
    self.client = client;
    cacheBaseId = cacheBaseId.substr(0, 1).toUpperCase() + cacheBaseId.substr(1);
    self.cacheBaseId = 'OlivieClientCache' + cacheBaseId;
}, {}, {
    indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
    cacheStoreId: null,
    db: null,
    isSupported: function () {
        var self = this;
        return !!self.indexedDB;
    },
    isReady: function () {
        var self = this;
        return !!self.db;
    },
    connect: function (q) {
        var self = this;
        q = q || $.Deferred();
        var openRequest;
        if (!self.isSupported()) {
            q.reject();
        } else {
            try {
                openRequest = self.indexedDB.open(self.cacheBaseId, 1);
                openRequest.onsuccess = function () {
                    self.db = openRequest.result;
                    q.resolve();
                };
                openRequest.onerror = function () {
                    q.reject();
                };
                openRequest.onupgradeneeded = function (e) {
                    e.currentTarget.result.createObjectStore('Requests', { keyPath: 'url' }).createIndex('url', 'url', { unique: true });
                    self.connect(q);
                };
            } catch (e) {
                q.reject();
            }
        }
        return q.promise();
    },
    save: function (url, result) {
        var self = this;
        if (!self.isReady()) {
            return;
        }
        var transaction = self.db.transaction('Requests', 'readwrite');
        var record = {
                url: url,
                result: result,
                date: Math.floor(Date.now() / 1000)
            };
        transaction.objectStore('Requests').put(record);
    },
    getSaved: function (url, cacheTime, q) {
        var self = this;
        q = q || $.Deferred();
        try {
            var transaction, request;
            if (!self.isReady() || !cacheTime) {
                q.reject();
            } else {
                transaction = self.db.transaction(['Requests'], 'readonly');
                request = transaction.objectStore('Requests').get(url);
                request.onsuccess = function () {
                    var record = request.result;
                    if (record && record.date + cacheTime > Math.floor(Date.now() / 1000)) {
                        q.resolve(record.result);
                    } else {
                        self.delete(url);
                        q.reject();
                    }
                };
                request.onerror = function () {
                    q.reject();
                };
            }
        } catch (e) {
            q.reject();
        }
        return q.promise();
    },
    delete: function (url, q) {
        var self = this;
        q = q || $.Deferred();
        var transaction, request;
        if (!self.isReady()) {
            q.reject();
        } else {
            transaction = self.db.transaction(['Requests'], 'readwrite');
            request = transaction.objectStore('Requests').delete(url);
            request.onsuccess = function () {
                q.resolve();
            };
            request.onerror = function () {
                q.reject();
            };
        }
        return q.promise();
    }
});
},{"./../../jquery":5,"./../../olivie":11}],10:[function(require,module,exports){
"use strict";
var $ = require('./../../jquery'), Olivie = require('./../../olivie'), Cache = require('./cache');
module.exports = Olivie.component('Client', function (baseUrl, baseParams, cacheBaseId, cacheTime) {
    var self = this;
    self.requestModifiers = [];
    self.responseModifiers = [];
    if (baseUrl) {
        self.attachRequestModifier(function (options) {
            options.url = baseUrl + options.url;
        });
    }
    if (baseParams && $.isPlainObject(baseParams)) {
        self.attachRequestModifier(function (options) {
            options.data = $.extend(false, {}, options.data, baseParams);
        });
    }
    self.cache = new Cache(cacheBaseId, self);
    self.defaultCacheTime = parseInt(cacheTime, 10);
}, {
    parseQuery: function (path) {
        var queryMatches = path.match(/\?([^#]+)/);
        var params = {};
        if (!queryMatches || !queryMatches[1]) {
            return params;
        }
        var parser = function (str) {
            var field = str.split('=');
            params[field[0]] = field[1] || '';
        };
        queryMatches[1].split('&').map(parser);
        return params;
    }
}, {
    cache: null,
    requestModifiers: null,
    responseModifiers: null,
    defaultCacheTime: null,
    run: function () {
        var self = this;
        var q = $.Deferred();
        var cachePromise = self.cache.connect();
        cachePromise.done(function () {
            q.resolve();
        });
        cachePromise.fail(function () {
            q.resolve(-1);
        });
        return q.promise();
    },
    attachRequestModifier: function (modifier) {
        var self = this;
        return $.type(modifier) === 'function' && !!self.requestModifiers.push(modifier);
    },
    attachResponseModifier: function (modifier) {
        var self = this;
        return $.type(modifier) === 'function' && !!self.responseModifiers.push(modifier);
    },
    send: function (url, params, options, cacheTime) {
        var self = this;
        if ($.type(cacheTime) === 'undefined') {
            cacheTime = self.defaultCacheTime;
        }
        params = params || {};
        options = options || {};
        var q = $.Deferred();
        params = $.extend(false, {}, self.constructor.parseQuery(url), params);
        url = url.replace(/(\?\|#).*/, '') + '?' + $.param(params);
        if (params.callback) {
            params.callback = null;
        }
        options = $.extend(false, {}, options, {
            url: url,
            dataType: 'jsonp',
            type: options.type || 'get'
        });
        $.each(self.requestModifiers, function (i, modifier) {
            modifier.call(self, options);
        });
        var doneHandler = function (result, status) {
            if (cacheTime && status === 'success') {
                self.cache.save(url, result);
            }
            $.each(self.responseModifiers, function (i, modifier) {
                if (q.state() !== 'pending') {
                    return;
                }
                modifier.call(self, result, q);
            });
            if (q.state() === 'pending') {
                q.resolve(result);
            }
        };
        self.cache.getSaved(url, cacheTime).done(doneHandler).fail(function () {
            $.ajax(options).done(doneHandler);
        });
        return q.promise();
    },
    get: function (url, params, options) {
        var self = this;
        options = options || {};
        options.type = 'get';
        return self.send(url, params, options);
    }
});
},{"./../../jquery":5,"./../../olivie":11,"./cache":9}],11:[function(require,module,exports){
"use strict";
var $ = require('./jquery'), utils = require('./utils'), Cl = require('./cl'), Application = require('./application'), Component = require('./component');
var Olivie = {
        $: $,
        utils: utils,
        plugin: function (name, initialize, statics) {
            var self = this;
            if ($.fn[name]) {
                return null;
            }
            $.fn[name] = function (options) {
                return this.each(function (i, element) {
                    initialize.call(undefined, element, options);
                });
            };
            if (statics) {
                $[name] = statics;
            }
            return $.fn[name];
        },
        application: function (id, constructor, statics, properties) {
            var self = this;
            return self.class(id, [Application], constructor, statics, properties);
        },
        component: function (id, constructor, statics, properties) {
            var self = this;
            properties = properties || {};
            return self.class(id, [Component], constructor, statics, properties);
        },
        class: function (id, inheritance, constructor, statics, properties) {
            inheritance = inheritance || [];
            statics = statics || {};
            properties = properties || {};
            inheritance.unshift(Cl);
            statics.id = id;
            statics.inheritance = {};
            $.each(inheritance, function (i, c) {
                if (!c.id) {
                    return;
                }
                statics.inheritance[c.id] = c;
            });
            var cl = function () {
                var self = this;
                constructor.apply(self, arguments);
            };
            cl.prototype = function () {
            };
            properties.constructor = cl;
            $.extend.apply(self.$, [cl].concat(inheritance.concat([statics])));
            $.extend.apply(self.$, [cl.prototype].concat(inheritance.map(function (parent) {
                return parent.prototype;
            })).concat(properties));
            return cl;
        }
    };
module.exports = Olivie;
},{"./application":1,"./cl":2,"./component":3,"./jquery":5,"./utils":12}],12:[function(require,module,exports){
"use strict";
var $ = require('./jquery'), numberFormat = require('./external/number_format');
module.exports = {
    unifyMultipleOption: function (option) {
        var type = $.type(option);
        if (type === 'array') {
            return option;
        } else if (type === 'string') {
            return option.split(/[\s,;\|]+/).filter(function (item) {
                return !!item;
            });
        }
        return null;
    },
    applyModifier: function (val, modifiers) {
        if ($.type(modifiers) !== 'array') {
            modifiers = [modifiers];
        }
        $.each(modifiers, function (i, mod) {
            if ($.type(mod) !== 'function') {
                return;
            }
            val = mod.call(mod, val);
        });
        return val;
    },
    getProperty: function (object, path, modifiers) {
        var constructor = this;
        if (!object || !path || $.type(path) !== 'string') {
            return undefined;
        }
        var last = object;
        $.each(path.split('.'), function (i, name) {
            last = last[name];
            if (!last) {
                return false;
            }
        });
        if (last && modifiers) {
            last = constructor.applyModifier(last, modifiers);
        }
        return last;
    },
    setProperty: function (object, path, value) {
        if (!object || !path || $.type(path) !== 'string') {
            return undefined;
        }
        var last = object;
        var map = path.split('.');
        $.each(map, function (i, name) {
            if (i == map.length - 1) {
                last[name] = value;
            } else if ($.type(last[name]) === 'undefined') {
                last[name] = {};
            }
            last = last[name];
        });
        return object;
    },
    formatBigNumber: function (num, dec) {
        num = parseFloat(num);
        dec = dec || 1;
        if ($.type(num) !== 'number') {
            return NaN;
        }
        var fixed, integer;
        var des = '';
        if (num >= 1000000000) {
            fixed = num / 1000000000;
            des = 'b';
        } else if (num >= 1000000) {
            fixed = num / 1000000;
            des = 'm';
        } else if (num >= 1000) {
            fixed = num / 1000;
            des = 'k';
        } else {
            fixed = num;
        }
        fixed = fixed.toFixed(dec);
        integer = parseInt(fixed, 10);
        if (fixed - integer === 0) {
            fixed = integer;
        }
        return fixed + des;
    },
    parseInt: function (val) {
        return parseInt(val, 10);
    },
    formatNumberWithCommas: function (num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    },
    formatPassedTime: function (date) {
        if (!(date instanceof Date)) {
            date = Math.round(new Date(Date.parse(date)).getTime() / 1000);
        }
        var now = Math.round(new Date().getTime() / 1000);
        var diff = Math.abs(now - date);
        var factor, unit;
        if (diff >= 604800) {
            factor = diff / 604800;
            unit = 'w';
        } else if (diff >= 86400) {
            factor = diff / 86400;
            unit = 'd';
        } else if (diff >= 3600) {
            factor = diff / 3600;
            unit = 'h';
        } else if (diff >= 60) {
            factor = diff / 60;
            unit = 'm';
        } else {
            factor = diff;
            unit = 's';
        }
        factor = Math.round(factor);
        return factor + unit;
    },
    filterNulls: function (obj) {
        var constructor = this;
        var filteredObj = {};
        $.each(obj, function (name, val) {
            if ($.type(val) === 'object') {
                filteredObj[name] = constructor.filterNulls(val);
            } else if (val !== null) {
                filteredObj[name] = val;
            }
        });
        return filteredObj;
    },
    nl2br: function (str) {
        return str.replace(/\n/g, '<br>');
    },
    formatAnchors: function (str) {
        return str.replace(/(https?|ftp):\/\/[^\s\t<]+/g, function (m) {
            return '<a href="' + m + '" target="_blank" rel="nofollow">' + m + '</a>';
        });
    },
    numberFormat: function () {
        return numberFormat.apply(numberFormat, arguments);
    },
    shuffle: function (arr) {
        var i;
        var r;
        for (i = arr.length - 1; i >= 0; --i) {
            r = Math.floor(Math.random() * i);
            arr[r] = [
                arr[i],
                arr[i] = arr[r]
            ][0];
        }
    }
};
},{"./external/number_format":4,"./jquery":5}],13:[function(require,module,exports){
"use strict";
module.exports = {
    key: [
        'AIzaSyAWB3iQzHTPDTrQ7wBagcJWwYCg675ju_g',
        'AIzaSyAGsNQ3IkD6WUiuiP5nz2sPrvYZbIBHIUA'
    ],
    debug: false,
    channel: null,
    sourceGroups: null,
    order: null,
    cacheTime: 3600,
    width: 'auto',
    lang: 'en',
    header: {
        visible: true,
        layout: 'classic',
        channelName: null,
        channelDescription: null,
        channelLogo: null,
        channelBanner: null,
        info: 'logo banner channelName channelDescription videosCounter subscribersCounter viewsCounter subscribeButton'
    },
    groups: { visible: true },
    content: {
        columns: 3,
        rows: 1,
        gutter: 20,
        arrowsControl: true,
        scrollControl: false,
        dragControl: true,
        direction: 'horizontal',
        freeMode: false,
        scrollbar: false,
        transitionEffect: 'slide',
        transitionSpeed: 600,
        auto: 0,
        autoPauseOnHover: false,
        responsive: null
    },
    video: {
        layout: 'classic',
        info: 'playIcon duration title date description viewsCounter likesCounter commentsCounter',
        playMode: 'popup'
    },
    popup: {
        info: 'title channelLogo channelName subscribeButton viewsCounter likesRatio likesCounter dislikesCounter date description descriptionMoreButton comments',
        autoplay: true
    },
    color: {
        scheme: 'default',
        header: {
            bg: null,
            bannerOverlay: null,
            channelName: null,
            channelNameHover: null,
            channelDescription: null,
            anchor: null,
            anchorHover: null,
            counters: null
        },
        groups: {
            bg: null,
            link: null,
            linkHover: null,
            linkActive: null,
            highlight: null,
            highlightHover: null,
            highlightActive: null
        },
        content: {
            bg: null,
            arrows: null,
            arrowsHover: null,
            arrowsBg: null,
            arrowsBgHover: null,
            scrollbarBg: null,
            scrollbarSliderBg: null
        },
        video: {
            bg: null,
            overlay: null,
            playIcon: null,
            playIconHover: null,
            duration: null,
            durationBg: null,
            title: null,
            titleHover: null,
            date: null,
            description: null,
            anchor: null,
            anchorHover: null,
            counters: null
        },
        popup: {
            bg: null,
            overlay: null,
            title: null,
            channelName: null,
            channelNameHover: null,
            viewsCounter: null,
            likesRatio: null,
            dislikesRatio: null,
            likesCounter: null,
            dislikesCounter: null,
            date: null,
            description: null,
            anchor: null,
            anchorHover: null,
            descriptionMoreButton: null,
            descriptionMoreButtonHover: null,
            commentsUsername: null,
            commentsUsernameHover: null,
            commentsPassedTime: null,
            commentsText: null,
            commentsLikes: null,
            controls: null,
            controlsHover: null,
            controlsMobile: null,
            controlsMobileBg: null
        }
    },
    ads: {
        client: null,
        slots: {
            content: null,
            popup: null
        }
    }
};
},{}],14:[function(require,module,exports){
"use strict";
module.exports = {
    en: {},
    de: {
        'w': 'Wo.',
        'd': 'Tag',
        'h': 'Std.',
        'min': 'min',
        's': 'Sek',
        'Show more': 'Mehr anzeigen',
        'Show less': 'Weniger anzeigen',
        'Videos': 'Videos',
        'Subscribers': 'Abonnenten',
        'Views': 'Aufrufe',
        'Uploads': 'Uploads',
        'Published at': 'Ver\xf6ffentlicht am'
    },
    hr: {
        'w': 'tj',
        'd': 'd',
        'h': 's',
        'min': 'm',
        's': 's',
        'Show more': 'Prika\u017ei vi\u0161e',
        'Show less': 'Prika\u017ei manje',
        'Videos': 'Video',
        'Subscribers': 'Pretplatnici',
        'Views': 'Pregleda',
        'Uploads': 'Upload',
        'Published at': 'Objavljeno'
    },
    es: {
        'w': 'sem',
        'd': 'd\xeda',
        'h': 'h',
        'min': 'min',
        's': 's',
        'Show more': 'Mostrar m\xe1s',
        'Show less': 'Mostrar menos',
        'Videos': 'V\xeddeos',
        'Subscribers': 'Suscriptores',
        'Views': 'Visualizaciones',
        'Uploads': 'V\xeddeos subidos',
        'Published at': 'Publicado el'
    },
    fr: {
        'w': 'sem',
        'd': 'j',
        'h': 'h',
        'min': 'min',
        's': 's',
        'Show more': 'Plus',
        'Show less': 'Moins',
        'Videos': 'Vid\xe9os',
        'Subscribers': 'Abonn\xe9s',
        'Views': 'Vues',
        'Uploads': 'Vid\xe9os ajout\xe9es',
        'Published at': 'Ajout\xe9e le'
    },
    it: {
        'w': 'sett.',
        'd': 'g',
        'h': 'h',
        'min': 'm',
        's': 's',
        'Show more': 'Mostra altro',
        'Show less': 'Mostra meno',
        'Videos': 'Video',
        'Subscribers': 'Iscritti',
        'Views': 'Visualizzazioni',
        'Uploads': 'Video caricati',
        'Published at': 'Pubblicato il'
    },
    nl: {
        'w': 'w.',
        'd': 'd.',
        'h': 'u.',
        'min': 'm.',
        's': 's.',
        'Show more': 'Meer weergeven',
        'Show less': 'Minder weergeven',
        'Videos': 'Video`s',
        'Subscribers': 'Abonnees',
        'Views': 'Weergaven',
        'Uploads': 'Uploads',
        'Published at': 'Gepubliceerd op'
    },
    no: {
        'w': 'u',
        'd': 'd',
        'h': 't',
        'min': 'm',
        's': 's',
        'Show more': 'Vis mer',
        'Show less': 'Vis mindre',
        'Videos': 'Videoer',
        'Subscribers': 'Abonnenter',
        'Views': 'Avspillinger',
        'Uploads': 'Opplastinger',
        'Published at': 'Publisert'
    },
    pl: {
        'w': 'w',
        'd': 'dzie\u0144',
        'h': 'godz.',
        'min': 'min',
        's': 's',
        'Show more': 'Poka\u017c wi\u0119cej',
        'Show less': 'Poka\u017c mniej',
        'Videos': 'Wideo',
        'Subscribers': 'Subskrypcji',
        'Views': 'Wy\u015bwietlenia',
        'Uploads': 'Przes\u0142ane filmy',
        'Published at': 'Opublikowany'
    },
    'pt-BR': {
        'w': 'sem',
        'd': 'd',
        'h': 'h',
        'min': 'min',
        's': 's',
        'Show more': 'Mostrar mais',
        'Show less': 'Mostrar menos',
        'Videos': 'V\xeddeos',
        'Subscribers': 'Inscritos',
        'Views': 'Visualiza\xe7\xf5es',
        'Uploads': 'Uploads',
        'Published at': 'Publicado em'
    },
    sv: {
        'w': 'v',
        'd': 'd',
        'h': 'h',
        'min': 'min',
        's': 'sek',
        'Show more': 'Visa mer',
        'Show less': 'Visa mindre',
        'Videos': 'Videoklipp',
        'Subscribers': 'Prenumeranter',
        'Views': 'Visningar',
        'Uploads': 'Uppladdningar',
        'Published at': 'Publicerades den'
    },
    tr: {
        'w': 'h',
        'd': 'g',
        'h': 's',
        'min': 'd',
        's': 'sn',
        'Show more': 'Daha fazla g\xf6ster',
        'Show less': 'Daha az g\xf6ster',
        'Videos': 'Videolar',
        'Subscribers': 'Abone',
        'Views': 'G\xf6r\xfcnt\xfcleme',
        'Uploads': 'Y\xfcklenenler',
        'Published at': 'Tarihinde yay\u0131nland\u0131'
    },
    ru: {
        'w': '\u043d\u0435\u0434.',
        'd': '\u0434\u043d.',
        'h': '\u0447',
        'min': '\u043c\u0438\u043d',
        's': '\u0441',
        'Show more': '\u0415\u0449\u0451',
        'Show less': '\u0421\u0432\u0435\u0440\u043d\u0443\u0442\u044c',
        'Videos': '\u0412\u0438\u0434\u0435\u043e',
        'Subscribers': '\u041f\u043e\u0434\u043f\u0438\u0441\u0447\u0438\u043a\u043e\u0432',
        'Views': '\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u043e\u0432',
        'Uploads': '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438',
        'Published at': '\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e'
    },
    hi: {
        'w': '\u0938\u092a\u094d\u0924\u093e\u0939',
        'd': '\u0926\u093f\u0928',
        'h': '\u0918\u0902\u091f\u0947',
        'min': '\u092e\u093f\u0928\u091f',
        's': '\u0938\u0947\u0915\u0902\u0921',
        'Show more': '\u0914\u0930 \u0926\u093f\u0916\u093e\u090f\u0902',
        'Show less': '\u0915\u092e \u0926\u093f\u0916\u093e\u090f\u0902',
        'Videos': '\u0935\u0940\u0921\u093f\u092f\u094b',
        'Subscribers': '\u0938\u0926\u0938\u094d\u092f',
        'Views': '\u092c\u093e\u0930 \u0926\u0947\u0916\u093e \u0917\u092f\u093e',
        'Uploads': '\u0905\u092a\u0932\u094b\u0921',
        'Published at': '\u0915\u094b \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924'
    },
    'zh-HK': {
        'w': '\u5468',
        'd': '\u5929',
        'h': '\u5c0f\u65f6',
        'min': '\u5206\u949f',
        's': '\u79d2',
        'Show more': '\u5c55\u5f00',
        'Show less': '\u6536\u8d77',
        'Videos': '\u89c6\u9891',
        'Subscribers': '\u4f4d\u8ba2\u9605\u8005',
        'Views': '\u6b21\u89c2\u770b',
        'Uploads': '\u4e0a\u4f20\u7684\u89c6\u9891',
        'Published at': ''
    },
    ja: {
        'w': '\u9031\u9593\u524d',
        'd': '\u65e5\u524d',
        'h': '\u6642\u9593\u524d',
        'min': '\u5206\u524d',
        's': '\u79d2\u524d',
        'Show more': '\u3082\u3063\u3068\u898b\u308b',
        'Show less': '\u4e00\u90e8\u3092\u8868\u793a',
        'Videos': '\u52d5\u753b',
        'Subscribers': '\u4eba',
        'Views': '\u56de',
        'Uploads': '\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u6e08\u307f',
        'Published at': '\u306b\u516c\u958b'
    }
};
},{}],15:[function(require,module,exports){
"use strict";
var Olivie = require('./../../olivie/src/js/olivie'), $ = require('./../../olivie/src/js/jquery'), Yottie = require('./yottie'), YottieFacade = require('./yottie-facade'), defaults = require('./defaults'), schemes = require('./schemes');
var id = 0;
Olivie.plugin('yottie', function (element, options) {
    var facade = $.data(element, 'yottie');
    if (facade) {
        return facade;
    }
    var app = new Yottie(++id, element, options);
    var facade = new YottieFacade(app);
    $.data(element, 'yottie', facade);
    app.run();
}, {
    defaults: defaults,
    schemes: schemes,
    orderFunctions: {
        date: function (a, b) {
            var aPublicationTime = Date.parse(a.snippet.publishedAt);
            var bPublicationTime = Date.parse(b.snippet.publishedAt);
            if (aPublicationTime < bPublicationTime) {
                return -1;
            }
            if (aPublicationTime > bPublicationTime) {
                return 1;
            }
            return 0;
        }
    },
    generateAttributesMap: function (pathPrefix, obj, map) {
        pathPrefix = pathPrefix || '';
        obj = obj || defaults;
        map = map || {};
        $.each(obj, function (name, val) {
            var path;
            if ($.type(val) === 'object') {
                $.yottie.generateAttributesMap(pathPrefix ? pathPrefix + '.' + name : name, val, map);
            } else {
                path = pathPrefix ? pathPrefix + '.' + name : name;
                map[path] = path.replace(/\.|[A-Z]/g, function (m) {
                    if (m === '.') {
                        return '-';
                    } else {
                        return '-' + m.toLowerCase();
                    }
                });
            }
        });
        return map;
    },
    init: function (context) {
        context = context || document.body;
        var map = $.yottie.generateAttributesMap();
        $('[data-yt]', context).each(function (i, item) {
            var $item = $(item);
            var options = {};
            $.each(map, function (path, name) {
                var val = $item.attr('data-yt-' + name);
                if (!val) {
                    return;
                }
                if (val === 'true') {
                    val = true;
                } else if (val === 'false') {
                    val = false;
                }
                Olivie.utils.setProperty(options, path, val);
            });
            $item.yottie(options);
        });
    },
    addOrderFunction: function (name, func) {
        var constructor = this;
        if ($.type(func) !== 'function') {
            return;
        }
        constructor.orderFunctions[name] = func;
    }
});
$(function () {
    var readyFunc = window['onYottieReady'];
    if (readyFunc && $.type(readyFunc) === 'function') {
        readyFunc();
    }
    $(window).trigger('yottieReady');
    $.yottie.init();
});
},{"./../../olivie/src/js/jquery":5,"./../../olivie/src/js/olivie":11,"./defaults":13,"./schemes":38,"./yottie":41,"./yottie-facade":40}],16:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
var $w = $(window);
module.exports = Olivie.component('Popup', function () {
}, {
    AVAILABLE_INFO: [
        'duration',
        'title',
        'channelLogo',
        'channelName',
        'subscribeButton',
        'viewsCounter',
        'likesCounter',
        'dislikesCounter',
        'likesRatio',
        'date',
        'description',
        'descriptionMoreButton',
        'comments'
    ],
    dependencies: [
        'youtube',
        'i18n',
        'renderer',
        'ads',
        ''
    ]
}, {
    $e: $('<div></div>'),
    videoPlayer: null,
    open: function (videoUrl) {
        var self = this;
        if (self.showing) {
            return false;
        }
        self.showVideo(videoUrl);
        var swiper = self.app.component('feed').getActiveSection().swiper;
        swiper.lockSwipeToNext();
        swiper.stopAutoplay();
        self.showing = true;
        self.$popup.addClass('yottie-popup-show');
    },
    close: function () {
        var self = this;
        var swiper = self.app.component('feed').getActiveSection().swiper;
        swiper.unlockSwipeToNext();
        setTimeout(function () {
            self.videoPlayer.destroy();
            self.$video.remove();
            swiper.startAutoplay();
        }, 350);
        self.showing = false;
        self.$popup.removeClass('yottie-popup-show');
    },
    showVideo: function (videoUrl) {
        var self = this;
        var videoSource = self.youtube.parseSource(videoUrl);
        if (!videoSource || videoSource.kind !== 'youtube#video') {
            return;
        }
        self.$popup.addClass('yottie-popup-loading');
        self.youtube.model(videoSource.kind).find(videoSource.criteria, 'contentDetails,statistics,snippet').done(function (video) {
            if (!video) {
                return;
            }
            self.video = video;
            var preparePromises = [];
            preparePromises.push(self.getVideoChannel());
            preparePromises.push(self.getVideoCommentThreads());
            $.when.apply($, preparePromises).done(function () {
                self.$popup.removeClass('yottie-popup-loading');
                self.$video = self.createVideoElement();
                var player = new YT.Player(self.$video.find('.yottie-popup-video-player span').get(0), {
                        videoId: self.video.id,
                        playerVars: {
                            autoplay: self.app.options.popup.autoplay,
                            showinfo: false
                        },
                        events: {
                            onStateChange: function (e) {
                                switch (e.data) {
                                case YT.PlayerState.ENDED:
                                    e.target.pauseVideo();
                                    e.target.seekTo(0);
                                    break;
                                }
                            }
                        }
                    });
                self.videoPlayer = player;
                if (self.channel) {
                    self.channel.renderButton(self.$video.find('.yottie-popup-video-channel-subscribe-button').get(0));
                }
                self.$video.appendTo(self.$inner);
                self.$videoPlayer = self.$video.find('.yottie-popup-video-source iframe');
                self.fit();
                setTimeout(function () {
                    self.ads.init(self.$inner);
                }, 17);
            });
        });
    },
    getVideoChannel: function () {
        var self = this;
        if (!self.video) {
        }
        var q = $.Deferred();
        self.youtube.model('youtube#channel').find({ id: self.video.snippet.channelId }, 'snippet').done(function (channel) {
            self.channel = channel;
            q.resolve();
        }).fail(function () {
            self.channel = null;
            q.resolve();
        });
        return q;
    },
    getVideoCommentThreads: function () {
        var self = this;
        if (!self.video) {
        }
        var q = $.Deferred();
        self.youtube.model('youtube#commentThread').findAll({
            videoId: self.video.id,
            textFormat: 'plainText'
        }, 'snippet').done(function (commentThreads) {
            self.commentThreads = commentThreads;
            q.resolve();
        }).fail(function () {
            self.commentThreads = null;
            q.resolve();
        });
        return q;
    },
    createPopupElement: function () {
        var self = this, parts = {};
        parts.loader = self.renderer.render('popup.loader', { parts: parts });
        parts.controlClose = self.renderer.render('popup.control.close', { parts: parts });
        parts.controlArrows = self.renderer.render('popup.control.arrows', { parts: parts });
        parts.inner = self.renderer.render('popup.inner', { parts: parts });
        parts.overlay = self.renderer.render('popup.overlay', { parts: parts });
        parts.wrapper = self.renderer.render('popup.wrapper', { parts: parts });
        return $(self.renderer.render('popup.container', { parts: parts }));
    },
    createVideoElement: function () {
        var self = this, displaying = {}, parts = {}, date = self.i18n.t('Published at') + ' ' + new Date(Date.parse(self.video.snippet.publishedAt)).toLocaleDateString(), comments = [];
        if (self.commentThreads && self.commentThreads.length) {
            for (var i = 0, j = self.commentThreads.length; i < j; i++) {
                var text = self.commentThreads[i].getText();
                comments.push({
                    authorProfileImageUrl: self.commentThreads[i].snippet.topLevelComment.snippet.authorProfileImageUrl,
                    authorName: self.commentThreads[i].snippet.topLevelComment.snippet.authorDisplayName,
                    authorChannelUrl: self.commentThreads[i].snippet.topLevelComment.snippet.authorChannelUrl,
                    text: text,
                    passedTime: self.commentThreads[i].get('snippet.topLevelComment.snippet.publishedAt', Olivie.utils.formatPassedTime),
                    likesCount: self.commentThreads[i].get('snippet.topLevelComment.snippet.likeCount', Olivie.utils.formatBigNumber),
                    displayLikesCount: parseInt(self.commentThreads[i].snippet.topLevelComment.snippet.likeCount, 10) > 0,
                    likesTitle: self.i18n.t('Likes') + ': ' + self.commentThreads[i].get('snippet.topLevelComment.snippet.likeCount', Olivie.utils.formatNumberDigits)
                });
            }
        }
        self.activeInfo = Olivie.utils.unifyMultipleOption(self.app.options.popup.info) || [];
        self.activeInfo = self.activeInfo.filter(function (item) {
            return !!~self.constructor.AVAILABLE_INFO.indexOf(item);
        });
        $.each(self.activeInfo, function (i, item) {
            displaying[item] = true;
        });
        displaying.channel = self.channel && displaying.channelName || displaying.channelLogo || displaying.subscribeButton;
        displaying.ratingCounters = displaying.likesCounter || displaying.dislikesCounter;
        displaying.rating = displaying.ratingCounters || displaying.likesRatio;
        displaying.properties = displaying.viewsCounter || displaying.rating;
        displaying.infoMeta = displaying.channel || displaying.properties;
        displaying.info = displaying.title || displaying.date || displaying.infoMeta;
        displaying.comments = self.commentThreads && displaying.comments;
        displaying.content = displaying.info || displaying.comments;
        displaying.description = displaying.description && self.video.snippet.description;
        displaying.descriptionMoreButton = displaying.description && displaying.descriptionMoreButton;
        displaying.infoMain = displaying.description || displaying.date;
        if (self.channel) {
            parts.videoChannel = self.renderer.render('popup.video.channel', {
                displaying: displaying,
                parts: parts,
                logo: self.channel.get('snippet.thumbnails.default.url'),
                name: self.channel.get('snippet.title'),
                link: '//www.youtube.com/channel/' + self.channel.id
            });
        }
        parts.videoProperties = self.renderer.render('popup.video.properties', {
            displaying: displaying,
            parts: parts,
            viewsCount: self.video.get('statistics.viewCount', Olivie.utils.formatNumberWithCommas),
            likesCount: self.video.get('statistics.likeCount', Olivie.utils.formatBigNumber),
            dislikesCount: self.video.get('statistics.dislikeCount', Olivie.utils.formatBigNumber),
            likesRatio: parseInt(self.video.get('statistics.likeCount') * 100 / (parseInt(self.video.get('statistics.likeCount'), 10) + parseInt(self.video.get('statistics.dislikeCount'), 10)), 10),
            titles: {
                views: self.i18n.t('Views') + ': ' + self.video.get('statistics.viewCount', self.youtube.constructor.formatNumberDigits),
                likes: self.i18n.t('Likes') + ': ' + self.video.get('statistics.likeCount', self.youtube.constructor.formatNumberDigits),
                dislikes: self.i18n.t('Dislikes') + ': ' + self.video.get('statistics.dislikeCount', self.youtube.constructor.formatNumberDigits)
            }
        });
        parts.videoInfoMain = self.renderer.render('popup.video.info.main', {
            displaying: displaying,
            parts: parts,
            date: date,
            text: self.video.get('snippet.description', [
                Olivie.utils.nl2br,
                Olivie.utils.formatAnchors
            ]),
            showMoreLabel: self.i18n.t('Show more')
        });
        if (self.commentThreads) {
            parts.videoComments = self.renderer.render('popup.video.comments', {
                displaying: displaying,
                parts: parts,
                comments: comments
            });
        }
        parts.videoInfoMeta = self.renderer.render('popup.video.info.meta', {
            displaying: displaying,
            parts: parts
        });
        parts.videoInfo = self.renderer.render('popup.video.info', {
            displaying: displaying,
            parts: parts,
            title: self.video.get('snippet.title')
        });
        parts.videoContent = self.renderer.render('popup.video.content', {
            displaying: displaying,
            parts: parts
        });
        parts.videoPlayer = self.renderer.render('popup.video.player', {
            displaying: displaying,
            parts: parts
        });
        return $(self.renderer.render('popup.video.container', {
            displaying: displaying,
            parts: parts
        }));
    },
    watch: function () {
        var self = this;
        self.$wrapper.click(function (e) {
            if (e.target !== self.$wrapper.get(0)) {
                return;
            }
            self.close();
        });
        self.$controlClose.click(function (e) {
            e.preventDefault();
            self.close();
        });
        self.$popup.on('click', '.yottie-popup-video-description-more', function () {
            $(this).text(function (i, text) {
                return text === self.i18n.t('Show more') ? self.i18n.t('Show less') : self.i18n.t('Show more');
            }).siblings('.yottie-popup-video-description').toggleClass('yottie-popup-video-description-show-full');
        });
    },
    fit: function () {
        var self = this;
        var windowHeight = $w.innerHeight();
        var innerHeight = self.$inner.innerHeight();
        var offset = 0;
        if (windowHeight > innerHeight) {
            offset = windowHeight / 2 - innerHeight / 2 - 50;
        }
        self.$inner.css('top', offset);
    },
    run: function () {
        var self = this;
        if (self.get('app.options.video.playMode') == 'popup') {
            self.$popup = self.createPopupElement();
            self.$popup.appendTo(document.body);
            self.$popup.attr('id', 'yottie_popup_' + self.app.getId());
            self.$wrapper = self.$popup.find('.yottie-popup-wrapper');
            self.$inner = self.$popup.find('.yottie-popup-inner');
            self.$controlClose = self.$popup.find('.yottie-popup-control-close');
            self.watch();
            $w.resize(function () {
                self.fit();
            });
        }
        return self;
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],17:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.component('Ads', function (options) {
    var self = this;
    self.client = options.client;
    self.slots = options.slots;
}, {
    dependencies: ['renderer'],
    SIZES: [
        {
            width: 728,
            height: 90
        },
        {
            width: 320,
            height: 50
        }
    ]
}, {
    client: null,
    slots: null,
    isActive: function () {
        var self = this;
        return window.adsbygoogle && self.client;
    },
    run: function () {
        var self = this;
        if (self.slots) {
            $.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
        }
    },
    showAt: function (place) {
        var self = this;
        return !!self.slots[place];
    },
    init: function ($container) {
        var self = this;
        if (!self.isActive()) {
            return;
        }
        var $slots = $('[data-yt-ads-place]', $container);
        $slots = $slots.filter(function () {
            var place = $(this).attr('data-yt-ads-place');
            return self.showAt(place);
        });
        self.processSlots($slots);
    },
    createAdsElement: function (sizes, slotId) {
        var self = this;
        return $(self.renderer.render('ads', $.extend(false, {
            pubId: self.client,
            slotId: slotId
        }, sizes)));
    },
    processSlots: function ($slots) {
        var self = this;
        $slots.each(function () {
            var $ads = null;
            var $container = $(this);
            var slot = $container.attr('data-yt-ads-place');
            var slotId = self.slots[slot];
            var actualSize = null;
            var containerWidth = $container.width();
            if (containerWidth > self.constructor.SIZES[1].width && containerWidth < self.constructor.SIZES[0].width) {
                actualSize = self.constructor.SIZES[1];
            } else if (containerWidth > self.constructor.SIZES[0].width) {
                actualSize = self.constructor.SIZES[0];
            }
            $container.empty();
            if (actualSize) {
                $ads = self.createAdsElement(actualSize, slotId);
                $ads.appendTo($container);
            }
        });
        adsbygoogle.push({});
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],18:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Grid = require('./grid'), ProxyStorage = require('./../youtube/proxy-storage'), defaults = require('./../../defaults');
var $window = $(window);
module.exports = Olivie.class('FeedSection', [], function (controller, group) {
    var self = this;
    if (!group || !group.sources) {
        return;
    }
    if (!$.isArray(group.sources)) {
        group.sources = [group.sources];
    }
    self.controller = controller;
    self.title = group.name || self.controller.i18n.t('Untitled');
    self.videoPlayMode = self.get('controller.app.options.video.playMode');
    self.videos = [];
    self.source = [];
    $.each(group.sources, function (i, src) {
        var sourceObject;
        if ($.type(src) === 'string') {
            sourceObject = self.controller.youtube.parseSource(src);
            if (!sourceObject) {
                return;
            }
        } else if ($.isPlainObject(src) && src.kind && src.criteria) {
            sourceObject = src;
        } else {
            return;
        }
        self.source.push(sourceObject);
    });
    self.$element = self.createFeedSectionElement();
    self.$inner = self.$element.children().first();
    self.$loader = $(self.controller.renderer.render('feed.loader'));
    if (self.get('controller.app.options.content.arrowsControl')) {
        self.$element.append(self.controller.renderer.render('feed.arrows'));
        self.$arrowPrev = self.$element.find('.yottie-widget-feed-section-arrow-prev');
        self.$arrowNext = self.$element.find('.yottie-widget-feed-section-arrow-next');
    }
    if (self.get('controller.app.options.content.scrollbar')) {
        self.$scrollbar = $(self.controller.renderer.render('feed.scrollbar'));
        self.$scrollbar.appendTo(self.$element);
    }
    self.$loader.appendTo(self.$element);
    self.fetcher = self.createFetcher();
    self.inlinePlayers = {};
    self.defaultBreakpoint = {
        columns: self.get('controller.app.options.content.columns', Olivie.utils.parseInt),
        rows: self.get('controller.app.options.content.rows', Olivie.utils.parseInt),
        gutter: self.get('controller.app.options.content.gutter', Olivie.utils.parseInt)
    };
    self.currentBreakpoint = self.defaultBreakpoint;
    self.grid = new Grid(self.$inner, self.defaultBreakpoint);
    var sortedBreakpoints = [];
    var breakpoints = self.get('controller.app.options.content.responsive');
    if (breakpoints) {
        $.each(breakpoints, function (mw, opt) {
            opt.mw = parseInt(mw, 10);
            sortedBreakpoints.push(opt);
        });
        sortedBreakpoints.sort(function (a, b) {
            if (a.mw < b.mw) {
                return -1;
            } else if (a.mw > b.mw) {
                return 1;
            }
            return 0;
        });
        self.breakpoints = sortedBreakpoints;
    }
    self.auto = self.get('controller.app.options.content.auto', Olivie.utils.parseInt);
    self.autoPauseOnHover = self.get('controller.app.options.content.autoPauseOnHover');
    self.$element.addClass('yottie-widget-feed-section-' + self.get('controller.app.options.content.direction'));
}, {
    VIDEO_AVAILABLE_INFO: [
        'playIcon',
        'duration',
        'title',
        'date',
        'description',
        'viewsCounter',
        'likesCounter',
        'commentsCounter'
    ],
    AVAILABLE_EFFECTS: [
        'slide',
        'fade',
        'cube',
        'coverflow',
        'flip'
    ],
    AVAILABLE_DIRECTIONS: ['horizontal'],
    VIDEO_BREAKPOINTS: [
        560,
        490,
        440,
        370,
        280,
        230,
        180,
        130,
        70
    ],
    SWIPER_OPTIONS_ALIASES: {
        columns: 'slidesPerView',
        gutter: 'spaceBetween'
    },
    prepareSwiperBreakpoints: function (breakponts) {
        var constructor = this;
        if (!breakponts) {
            return null;
        }
        var preparedBreakpoints = {};
        $.each(breakponts, function (mw, options) {
            preparedBreakpoints[mw] = {};
            $.each(options, function (name, val) {
                var originalName = constructor.SWIPER_OPTIONS_ALIASES[name];
                if (!originalName) {
                    return;
                }
                preparedBreakpoints[mw][originalName] = val;
            });
        });
        return preparedBreakpoints;
    }
}, {
    virgin: true,
    redistributing: false,
    fetcher: null,
    videoStorage: null,
    controller: null,
    title: null,
    source: null,
    grid: null,
    swiper: null,
    auto: null,
    videoActiveInfo: null,
    videoPlayMode: null,
    inlinePlayers: null,
    breakpoints: null,
    currentBreakpoint: null,
    prevBreakpoint: null,
    defaultBreakpoint: null,
    hover: null,
    $element: null,
    $inner: null,
    $arrowPrev: null,
    $arrowNext: null,
    $scrollbar: null,
    $loader: null,
    isPlaying: null,
    createFeedSectionElement: function () {
        var self = this;
        return $(self.controller.renderer.render('feed.section'));
    },
    createFetcher: function () {
        var self = this;
        var fetcher;
        var videoStorage;
        var order = self.get('controller.app.options.order');
        var videoFetcher = self.controller.youtube.createUniversalVideoFetcher(self.source, 'snippet,contentDetails,statistics');
        if (!order) {
            fetcher = videoFetcher;
        } else {
            fetcher = new ProxyStorage(videoFetcher, order);
        }
        return fetcher;
    },
    activate: function () {
        var self = this;
        self.$element.addClass('yottie-active');
        if (self.virgin) {
            self.virgin = false;
            self.fit();
            self.showLoader(500);
            self.fetcher.prepare().done(function () {
                self.appendSlide(true).done(function () {
                    self.fit();
                    if (!self.auto) {
                        return;
                    }
                    setTimeout(function () {
                        if (!self.isPlaying && self.swiper.autoplaying && !self.hover) {
                            self.swiper.slideNext();
                        }
                    }, self.auto);
                });
            });
        }
    },
    deactivate: function () {
        var self = this;
        self.$element.removeClass('yottie-active');
        $.each(self.inlinePlayers, function (pid, instance) {
            instance.pauseVideo();
        });
    },
    createVideoElement: function (video) {
        var self = this;
        var displaying = {};
        $.each(self.videoActiveInfo, function (i, item) {
            displaying[item] = true;
        });
        displaying.properties = displaying.viewsCounter || displaying.likesCounter || displaying.commentsCounter;
        displaying.info = displaying.properties || displaying.title || displaying.date || displaying.description;
        displaying.videoPlayer = self.videoPlayMode === 'inline';
        var parts = {};
        parts.player = self.controller.renderer.render('video.player', { displaying: displaying });
        parts.preview = self.controller.renderer.render('video.preview', {
            displaying: displaying,
            id: video.id,
            thumbnail: video.get('snippet.thumbnails.high.url'),
            maxresThumbnail: video.get('snippet.thumbnails.maxres.url'),
            title: video.get('snippet.title'),
            duration: video.parseDuration()
        });
        parts.overlay = self.controller.renderer.render('video.overlay');
        parts.info = self.controller.renderer.render('video.info', {
            displaying: displaying,
            id: video.id,
            title: video.get('snippet.title'),
            description: video.get('snippet.description', [
                Olivie.utils.nl2br,
                Olivie.utils.formatAnchors
            ]),
            viewsCount: video.get('statistics.viewCount', Olivie.utils.formatBigNumber),
            likesCount: video.get('statistics.likeCount', Olivie.utils.formatBigNumber),
            commentsCount: video.get('statistics.commentCount', Olivie.utils.formatBigNumber),
            date: new Date(video.getPublishedTimestamp()).toLocaleDateString(),
            titles: {
                views: self.controller.i18n.t('Views') + ': ' + video.get('statistics.viewCount', self.controller.youtube.constructor.formatNumberDigits),
                likes: self.controller.i18n.t('Likes') + ': ' + video.get('statistics.likeCount', self.controller.youtube.constructor.formatNumberDigits),
                comments: self.controller.i18n.t('Comments') + ': ' + video.get('statistics.commentCount', self.controller.youtube.constructor.formatNumberDigits)
            }
        });
        var $video = $(self.controller.renderer.render('video.container', {
                id: video.id,
                displaying: displaying,
                parts: parts,
                layout: self.videoLayout
            }));
        return $video;
    },
    appendSlide: function (noloader) {
        var self = this;
        var count = self.grid.getItemsCount();
        var q = $.Deferred();
        if (!self.fetcher.hasNext()) {
            q.reject();
        } else {
            if (!noloader) {
                self.showLoader(300);
            }
            self.fetcher.fetch(count).done(function (list) {
                var $slideVideos = $();
                var $slide = $(self.controller.renderer.render('feed.slide'));
                $.each(list, function (i, video) {
                    var $video = self.createVideoElement(video);
                    $slideVideos = $slideVideos.add($video);
                });
                $slideVideos.appendTo($slide);
                self.swiper.appendSlide($slide.get(0));
                self.fitSlides($slide);
                self.hideLoader();
                q.resolve();
            });
        }
        return q.promise();
    },
    isHorizontal: function () {
        var self = this;
        return self.get('controller.app.options.content.direction') === 'horizontal';
    },
    run: function () {
        var self = this;
        self.videoLayout = self.get('controller.app.options.video.layout');
        self.videoActiveInfo = Olivie.utils.unifyMultipleOption(self.get('controller.app.options.video.info')) || [];
        self.videoActiveInfo = self.videoActiveInfo.filter(function (item) {
            return !!~self.constructor.VIDEO_AVAILABLE_INFO.indexOf(item);
        });
        var effect = self.get('controller.app.options.content.transitionEffect', function (val) {
                return !!~self.constructor.AVAILABLE_EFFECTS.indexOf(val) ? val : 'slide';
            });
        var direction = self.get('controller.app.options.content.direction', function (val) {
                return !!~self.constructor.AVAILABLE_DIRECTIONS.indexOf(val) ? val : 'vertical';
            });
        var Swiper = window.Swiper || Swiper;
        self.swiper = new Swiper(self.$inner, {
            direction: direction,
            effect: effect,
            speed: self.get('controller.app.options.content.transitionSpeed', Olivie.utils.parseInt),
            fade: { crossFade: true },
            cube: {
                shadowScale: 0.1,
                shadowOffset: 15
            },
            coverflow: { rotate: 60 },
            slidesPerView: 1,
            slidesPerColumn: 1,
            freeMode: self.get('controller.app.options.content.freeMode'),
            mousewheelControl: self.get('controller.app.options.content.scrollControl'),
            simulateTouch: self.get('controller.app.options.content.dragControl'),
            scrollbar: self.$scrollbar ? self.$scrollbar.get() : null,
            scrollbarDraggable: false,
            scrollbarHide: true,
            prevButton: self.$arrowPrev ? self.$arrowPrev.get() : null,
            nextButton: self.$arrowNext ? self.$arrowNext.get() : null,
            autoplay: self.auto,
            autoplayDisableOnInteraction: false,
            watchSlidesProgress: true,
            watchSlidesVisibility: true
        });
        self.swiper.on('reachEnd', function (e) {
            var hasNext = self.fetcher.hasNext();
            self.swiper.stopAutoplay();
            if (hasNext && !self.redistributing) {
                setTimeout(function () {
                    self.appendSlide(true).done(function () {
                        if (!self.hover) {
                            self.swiper.startAutoplay();
                        }
                    });
                }, 17);
            }
            if (self.$arrowNext) {
                self.$arrowNext.toggleClass('yottie-widget-feed-section-arrow-has-next', hasNext);
            }
        });
        var handleClick = function (e) {
            if (self.videoPlayMode === 'youtube') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            var player;
            var $item = $(this);
            var $video = $item.closest('.yottie-widget-video');
            var id = $video.attr('data-yt-id');
            self.swiper.stopAutoplay();
            self.isPlaying = true;
            if (self.videoPlayMode === 'popup') {
                self.controller.popup.open('https://www.youtube.com/watch?v=' + id);
            } else {
                player = self.inlinePlayers[id];
                if (!player) {
                    player = new YT.Player($video.find('.yottie-widget-video-player span').get(0), {
                        videoId: id,
                        playerVars: {
                            autoplay: true,
                            showinfo: false
                        },
                        events: {
                            onStateChange: function (e) {
                                switch (e.data) {
                                case YT.PlayerState.ENDED:
                                    e.target.pauseVideo();
                                    e.target.seekTo(0);
                                    self.isPlaying = false;
                                    self.swiper.startAutoplay();
                                    break;
                                case YT.PlayerState.PLAYING:
                                    $.each(self.inlinePlayers, function (pid, instance) {
                                        if (pid === id) {
                                            return;
                                        }
                                        self.isPlaying = true;
                                        self.swiper.stopAutoplay();
                                        instance.pauseVideo();
                                    });
                                    break;
                                case YT.PlayerState.PAUSED:
                                    setTimeout(function () {
                                        var hasPlaying = false;
                                        $.each(self.inlinePlayers, function (pid, instance) {
                                            if (pid === id || instance.getPlayerState() !== YT.PlayerState.PLAYING) {
                                                return;
                                            }
                                            hasPlaying = true;
                                        });
                                        if (!hasPlaying) {
                                            self.isPlaying = false;
                                            if (!self.hover) {
                                                self.swiper.startAutoplay();
                                            }
                                        }
                                    }, 2000);
                                    break;
                                }
                            }
                        }
                    });
                    self.fitVideos($video);
                    self.inlinePlayers[id] = player;
                } else {
                    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                        player.pauseVideo();
                    } else {
                        player.playVideo();
                    }
                }
            }
        };
        self.$element.on('click', '.yottie-widget-video', function (e) {
            if (self.videoLayout !== 'cinema') {
                return;
            }
            var $target = $(e.target);
            var $preview = $('.yottie-widget-video-preview', this);
            if (!$target.is('a') && !$target.parent().is('.yottie-widget-video-info-caption')) {
                if (self.videoPlayMode === 'youtube') {
                    window.open($preview.attr('href'));
                } else {
                    handleClick.call($preview.get(0), e);
                }
            }
        });
        self.$element.on('click', '.yottie-widget-video-info-title, .yottie-widget-video-preview', handleClick);
        if (self.autoPauseOnHover) {
            self.$element.on('mouseenter', function () {
                self.hover = true;
                self.swiper.stopAutoplay();
            });
            self.$element.on('mouseleave', function () {
                if (self.isPlaying) {
                    return;
                }
                self.hover = false;
                self.swiper.startAutoplay();
            });
        }
        $(window).resize(function () {
            self.fit();
        });
    },
    fit: function () {
        var self = this;
        self.fitGrid();
        self.fitSlides();
    },
    fitInner: function () {
        var self = this;
        var videoHeight = self.$element.find('.yottie-widget-video:first').outerHeight(true);
        var slidePadding = parseInt(self.$element.find('.yottie-widget-feed-section-slide:first').css('padding-top'), 10);
        self.$inner.innerHeight(videoHeight * self.grid.rows + slidePadding);
    },
    fitSlides: function ($slides) {
        var self = this;
        $slides = $slides || self.$element.find('.yottie-widget-feed-section-slide');
        $slides.css({
            paddingTop: self.grid.gutter,
            paddingLeft: self.grid.gutter
        });
        self.fitVideos($slides.find('.yottie-widget-video'));
    },
    fitGrid: function () {
        var self = this;
        if (!self.breakpoints || !self.breakpoints.length) {
            return;
        }
        self.prevBreakpoint = self.currentBreakpoint;
        var actualBreakpoint;
        var windowWidth = $window.width();
        $.each(self.breakpoints, function (i, bp) {
            if (windowWidth <= bp.mw) {
                actualBreakpoint = bp;
                return false;
            }
        });
        if (!actualBreakpoint) {
            actualBreakpoint = self.defaultBreakpoint;
        }
        if (actualBreakpoint !== self.currentBreakpoint) {
            self.currentBreakpoint = actualBreakpoint;
            self.grid.setOptions(self.currentBreakpoint);
            self.redistributeVideos();
        }
    },
    fitVideos: function ($videos) {
        var self = this;
        $videos = $videos || self.$element.find('.yottie-widget-video');
        self.grid.calculate();
        $videos.innerWidth(self.grid.itemWidth).css({
            marginBottom: self.grid.gutter,
            marginRight: self.grid.gutter
        });
        var $previews = $videos.find('.yottie-widget-video-preview');
        var $player = $videos.find('.yottie-widget-video-player iframe');
        var $thumbnails = $previews.find('.yottie-widget-video-preview-thumbnail');
        var previewWidth = $previews.innerWidth();
        var previewHeight = previewWidth / 16 * 9;
        self.controller.widget.constructor.updateBreakpoints($videos, self.constructor.VIDEO_BREAKPOINTS, 'yottie-mw-');
        previewWidth = $previews.innerWidth();
        previewHeight = previewWidth / 16 * 9;
        $thumbnails.find('img').each(function (i, item) {
            var $item = $(item);
            var src = $item.attr('data-src');
            var maxresSrc = $item.attr('data-maxres-src');
            if (maxresSrc && $videos.width() > 480) {
                $item.attr('src', maxresSrc);
            } else {
                $item.attr('src', src);
            }
        });
        $thumbnails.css({
            width: previewWidth,
            height: previewHeight
        });
        if (self.videoLayout === 'horizontal') {
            $videos.find('.yottie-widget-video-info').innerHeight(previewHeight);
        }
        if ($player.length) {
            $player.width(previewWidth).height(previewHeight);
        }
        self.fitInner();
    },
    redistributeVideos: function () {
        var self = this;
        var slides = [];
        var $videos = self.$element.find('.yottie-widget-video');
        var itemsPerSlide = self.grid.getItemsCount();
        var slidesCount = Math.ceil($videos.length / itemsPerSlide);
        if (!$videos.length) {
            return;
        }
        self.redistributing = true;
        self.swiper.lockSwipes();
        self.swiper.removeAllSlides();
        for (var i = 0; i < slidesCount; ++i)
            (function (i) {
                var $slide = $(self.controller.renderer.render('feed.slide'));
                var $slideVideos = $videos.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide);
                $slideVideos.appendTo($slide);
                slides.push($slide.get(0));
            }(i));
        self.swiper.prependSlide(slides.reverse());
        self.swiper.update(true);
        self.swiper.unlockSwipes();
        self.redistributing = false;
    },
    showLoader: function (delay) {
        var self = this;
        if (!self.$loader || self.$loader.is('.yottie-visible')) {
            return;
        }
        if (self.loaderTimeout) {
            clearTimeout(self.loaderTimeout);
            self.loaderTimeout = null;
        }
        self.loaderTimeout = setTimeout(function () {
            self.$loader.addClass('yottie-visible');
        }, parseInt(delay, 10));
    },
    hideLoader: function () {
        var self = this;
        if (!self.$loader) {
            return;
        }
        if (self.loaderTimeout) {
            clearTimeout(self.loaderTimeout);
            self.loaderTimeout = null;
        }
        self.$loader.removeClass('yottie-visible');
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./../../defaults":13,"./../youtube/proxy-storage":33,"./grid":20}],19:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), FeedSection = require('./feed-section');
module.exports = Olivie.component('Feed', function () {
    var self = this;
    self.sections = [];
    self.$e = $('<div></div>');
}, {
    dependencies: [
        'renderer',
        'i18n',
        'youtube',
        'popup',
        'widget',
        'ads'
    ]
}, {
    sections: null,
    activeSectionId: null,
    $element: null,
    $inner: null,
    $e: null,
    createFeedElement: function () {
        var self = this;
        return $(self.renderer.render('feed.container'));
    },
    getSection: function (id) {
        var self = this;
        if (!self.hasSection(id)) {
            return;
        }
        return self.sections[id];
    },
    hasSection: function (id) {
        var self = this;
        return !!self.sections[id];
    },
    setActiveSection: function (id) {
        var self = this;
        if (!self.hasSection(id)) {
            return;
        }
        $.each(self.sections, function (i, section) {
            section.deactivate();
        });
        self.getSection(id).activate();
        self.activeSectionId = id;
    },
    getActiveSection: function () {
        var self = this;
        return self.getSection(self.activeSectionId);
    },
    run: function (sourceGroups) {
        var self = this;
        self.$element = self.createFeedElement();
        self.$inner = self.$element.children().first();
        $.each(sourceGroups, function (i, group) {
            var section = new FeedSection(self, group);
            section.$element.appendTo(self.$inner);
            section.run();
            self.sections.push(section);
        });
        setTimeout(function () {
            self.app.component('groups').fit();
            self.ads.init(self.$element);
        }, 100);
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./feed-section":18}],20:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.class('Grid', [], function ($element, options) {
    var self = this;
    self.$element = $element;
    self.options = options;
    self.columns = self.options.columns;
    self.rows = self.options.rows;
    self.gutter = self.options.gutter;
}, {}, {
    options: null,
    columns: null,
    rows: null,
    gutter: null,
    $element: null,
    setOptions: function (options, recalculate) {
        var self = this;
        self.columns = options.hasOwnProperty('columns') ? Olivie.utils.parseInt(options.columns) : self.columns;
        self.rows = options.hasOwnProperty('rows') ? Olivie.utils.parseInt(options.rows) : self.rows;
        self.gutter = options.hasOwnProperty('gutter') ? Olivie.utils.parseInt(options.gutter) : self.gutter;
        if (recalculate) {
            self.calculate();
        }
    },
    calculate: function () {
        var self = this;
        var elementWidth = self.$element.innerWidth();
        var guttersSummary = self.gutter * (self.columns + 1);
        self.itemWidth = parseInt((elementWidth - guttersSummary) / self.columns, 10);
    },
    getItemsCount: function () {
        var self = this;
        return self.columns * self.rows;
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],21:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
var $w = $(window);
module.exports = Olivie.component('Groups', function () {
    var self = this;
    self.$e = $('<div></div>');
}, {
    dependencies: [
        'renderer',
        'i18n',
        'feed'
    ]
}, {
    sourceGroups: null,
    $element: null,
    $inner: null,
    $list: null,
    $items: null,
    $e: null,
    createGroupsElement: function () {
        var self = this;
        return $(self.renderer.render('groups.container', {
            visible: !!self.app.options.groups.visible,
            list: self.renderer.render('groups.list', { groups: self.sourceGroups }),
            controls: self.renderer.render('groups.controls')
        }));
    },
    fit: function () {
        var self = this;
        var scrollLeft = self.$list.scrollLeft();
        var maxScrollLeft = self.$list.get(0).scrollWidth - self.$list.innerWidth();
        self.$controlLeft.toggleClass('yottie-widget-nav-control-disabled', scrollLeft < 10);
        self.$controlRight.toggleClass('yottie-widget-nav-control-disabled', maxScrollLeft - scrollLeft < 10);
    },
    run: function (sourceGroups) {
        var self = this;
        self.sourceGroups = sourceGroups.slice();
        $.each(self.sourceGroups, function (i, item) {
            if (!item.name && !item.title) {
                item.title = self.i18n.t('Untitled');
            }
            if (!item.title) {
                item.title = item.name;
            }
        });
        self.$element = self.createGroupsElement();
        self.$inner = self.$element.children().first();
        self.$list = self.$inner.children().first();
        self.$items = self.$list.children();
        self.$controlLeft = self.$element.find('.yottie-widget-nav-control-left');
        self.$controlRight = self.$element.find('.yottie-widget-nav-control-right');
        self.$items.on('click', function () {
            var $item = $(this);
            var id = $item.children().first().attr('data-yt-id');
            self.$items.removeClass('yottie-active');
            $item.addClass('yottie-active');
            self.feed.setActiveSection(id);
            var itemOffset = $item.position().left;
            if (itemOffset < 20) {
                self.$list.animate({ scrollLeft: '-=' + $item.innerWidth() });
            }
            if (itemOffset + $item.innerWidth() + 20 > self.$list.innerWidth()) {
                self.$list.animate({ scrollLeft: '+=' + $item.innerWidth() });
            }
        });
        $w.resize(function () {
            self.fit();
        });
        self.$list.scroll(function () {
            self.fit();
        });
        self.$controlLeft.on('touchstart click', function () {
            var $targetItem = self.$items.filter(function () {
                    return $(this).innerWidth() - 20 - $(this).position().left < self.$list.innerWidth();
                }).first();
            self.$list.animate({ scrollLeft: $targetItem.length ? self.$list.scrollLeft() + $targetItem.position().left - 30 : 0 }, 300);
        });
        self.$controlRight.on('touchstart click', function () {
            var $targetItem = self.$items.filter(function () {
                    return $(this).position().left + $(this).innerWidth() + 20 >= self.$list.innerWidth();
                }).first();
            self.$list.animate({ scrollLeft: $targetItem.length ? self.$list.scrollLeft() + $targetItem.position().left - 30 : self.$list.get(0).scrollWidth }, 300);
        });
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],22:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.component('Header', function () {
    var self = this;
    self.$e = $('<div></div>');
}, {
    AVAILABLE_INFO: [
        'logo',
        'banner',
        'channelName',
        'channelDescription',
        'videosCounter',
        'subscribersCounter',
        'viewsCounter',
        'subscribeButton'
    ],
    dependencies: [
        'error',
        'youtube',
        'i18n',
        'renderer'
    ]
}, {
    visible: null,
    channel: null,
    activeInfo: null,
    $element: null,
    $e: null,
    createHeaderElement: function () {
        var self = this;
        self.activeInfo = Olivie.utils.unifyMultipleOption(self.app.options.header.info) || [];
        self.activeInfo = self.activeInfo.filter(function (item) {
            return !!~self.constructor.AVAILABLE_INFO.indexOf(item);
        });
        var displaying = {};
        $.each(self.activeInfo, function (i, item) {
            displaying[item] = true;
        });
        displaying.properties = self.channel.id && (displaying.videosCounter || displaying.subscribersCounter || displaying.viewsCounter);
        displaying.channel = displaying.channelName || displaying.channelDescription;
        displaying.logo = displaying.logo && self.channel.get('snippet.thumbnails.default.url');
        displaying.banner = displaying.banner && self.channel.get('brandingSettings.image.bannerTabletHdImageUrl');
        displaying.branding = displaying.logo || displaying.banner;
        displaying.subscribeButton = self.channel.id && displaying.subscribeButton;
        var parts = {};
        parts.logo = self.renderer.render('header.logo', {
            displaying: displaying,
            id: self.channel.id,
            url: self.channel.get('snippet.thumbnails.default.url'),
            title: self.channel.get('brandingSettings.channel.title')
        });
        parts.channel = self.renderer.render('header.channel', {
            displaying: displaying,
            id: self.channel.id,
            name: self.channel.get('brandingSettings.channel.title'),
            description: self.channel.get('brandingSettings.channel.description', Olivie.utils.formatAnchors)
        });
        var videoCount = self.channel.get('statistics.videoCount');
        parts.properties = self.renderer.render('header.properties', {
            displaying: displaying,
            videoCount: self.channel.get('statistics.videoCount', Olivie.utils.formatBigNumber),
            subscriberCount: self.channel.get('statistics.subscriberCount', Olivie.utils.formatBigNumber),
            viewCount: self.channel.get('statistics.viewCount', Olivie.utils.formatBigNumber),
            titles: {
                videos: self.i18n.t('Videos') + ': ' + self.channel.get('statistics.videoCount', self.youtube.constructor.formatNumberDigits),
                subscribers: self.i18n.t('Subscribers') + ': ' + self.channel.get('statistics.subscriberCount', self.youtube.constructor.formatNumberDigits),
                views: self.i18n.t('Views') + ': ' + self.channel.get('statistics.viewCount', self.youtube.constructor.formatNumberDigits)
            }
        });
        parts.overlay = self.renderer.render('header.overlay', { displaying: displaying });
        parts.banner = self.renderer.render('header.banner', {
            displaying: displaying,
            url: self.channel.get('brandingSettings.image.bannerTabletHdImageUrl')
        });
        parts.subscribe = self.renderer.render('header.subscribe', { displaying: displaying });
        return $(self.renderer.render('header.container', {
            visible: self.visible,
            layout: self.app.options.header.layout,
            displaying: displaying,
            parts: parts
        }));
    },
    run: function () {
        var self = this;
        var channelSource;
        var q = $.Deferred();
        self.visible = self.app.options.header.visible;
        if (self.app.options.channel) {
            if ($.type(self.app.options.channel) !== 'string') {
                return self;
            }
            channelSource = self.youtube.parseSource(self.app.options.channel);
            if (!channelSource || channelSource.kind !== 'youtube#channel') {
                self.error.throw('Option "channel" contents invalid channel or user url.');
                return self;
            }
            self.youtube.model(channelSource.kind).find(channelSource.criteria, 'snippet,brandingSettings,statistics,contentDetails').done(function (channel) {
                self.channel = channel;
                q.resolve();
            }).fail(function () {
                self.error.throw('Option "channel" contents invalid channel or user url.');
            });
        } else {
            self.channel = self.youtube.model('youtube#channel').create();
            q.resolve();
        }
        q.done(function () {
            if (self.channel) {
                if (self.app.options.header.channelName) {
                    self.channel.set('brandingSettings.channel.title', self.app.options.header.channelName);
                }
                if (self.app.options.header.channelDescription) {
                    self.channel.set('brandingSettings.channel.description', self.app.options.header.channelDescription);
                }
                if (self.app.options.header.channelLogo) {
                    self.channel.set('snippet.thumbnails.default.url', self.app.options.header.channelLogo);
                } else if (self.channel.id) {
                    self.channel.set('snippet.thumbnails.default.url', self.youtube.resizeLogo(self.channel.get('snippet.thumbnails.default.url'), 100));
                }
                if (self.app.options.header.channelBanner) {
                    self.channel.set('brandingSettings.image.bannerTabletHdImageUrl', self.app.options.header.channelBanner);
                }
                self.visible = self.visible && (self.channel.get('brandingSettings.channel.title') || self.channel.get('brandingSettings.channel.description') || self.channel.get('snippet.thumbnails.default.url') || self.channel.get('brandingSettings.image.bannerImageUrl'));
                self.$element = self.createHeaderElement();
                self.channel.renderButton(self.$element.find('.yottie-widget-header-subscribe-button').get(0));
            }
            setTimeout(function () {
                self.trigger('ready', [self]);
            });
        });
        return self;
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],23:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.component('Widget', function () {
    var self = this;
    self.$e = $('<div></div>');
}, {
    dependencies: ['renderer'],
    BREAKPOINTS: [
        1354,
        1056,
        780,
        640,
        460,
        410
    ],
    updateBreakpoints: function ($element, breakpoints, prefix) {
        var self = this;
        var classes = {};
        var width = $element.innerWidth();
        $.each(breakpoints, function (i, mw) {
            classes[prefix + mw] = width <= mw;
        });
        $element.removeClass(Object.keys(classes).join(' '));
        $element.addClass(Object.keys(classes).filter(function (c) {
            return classes[c];
        }).join(' '));
    }
}, {
    $e: null,
    run: function () {
        var self = this;
        var $widgetInner = $(self.renderer.render('widget'));
        self.app.$element.css('clear', 'both');
        $widgetInner.find('yottie[data-part]').each(function (i, part) {
            var $part = $(part);
            var id = $part.attr('data-part');
            var component = self.app.component(id);
            if (!component || !component.$element) {
                $part.remove();
            } else {
                $part.replaceWith(component.$element);
            }
        });
        $widgetInner.appendTo(self.app.$element);
        self.app.$element.attr('id', 'yottie_' + self.app.getId());
        self.app.$element.css({ width: self.app.options.width });
        self.fit();
        $(window).resize(function () {
            self.fit();
        });
    },
    fit: function () {
        var self = this;
        self.constructor.updateBreakpoints(self.app.$element, self.constructor.BREAKPOINTS, 'yottie-mw-');
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],24:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.component('Error', function () {
    var self = this;
}, { dependencies: ['renderer'] }, {
    $element: null,
    $content: null,
    $msg: null,
    createErrorElement: function () {
        var self = this;
        return $(self.renderer.render('error.container'));
    },
    run: function () {
        var self = this;
        self.$element = self.createErrorElement();
        self.$content = self.$element.find('.yottie-error-content');
        self.$element.appendTo(self.app.$element);
    },
    throw: function (msg) {
        var self = this;
        if (!self.app.get('options.debug')) {
            self.app.$element.hide();
        }
        self.$element.addClass('yottie-visible');
        var $msg = $(self.renderer.render('error.content', { message: msg }));
        if (!self.$msg) {
            self.$msg = $msg;
            self.$msg.appendTo(self.$content);
        } else {
            self.$msg = self.$msg.replaceWith($msg);
        }
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],25:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Model = require('./model');
module.exports = function (client) {
    return Olivie.class('Channel', [Model], function (data) {
        var self = this;
        self.getParent('Model').call(self, data);
    }, {
        client: client,
        path: '/channels'
    }, {
        renderButton: function (element) {
            var self = this;
            gapi.ytsubscribe.render(element, { channelId: self.id });
        }
    });
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./model":28}],26:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Model = require('./model');
module.exports = function (client) {
    return Olivie.class('CommentThread', [Model], function (data) {
        var self = this;
        self.getParent('Model').call(self, data);
    }, {
        client: client,
        path: '/commentThreads'
    }, {
        getText: function () {
            var self = this;
            var text = self.get('snippet.topLevelComment.snippet.textDisplay');
            return text ? text.replace(/<a([^>]+)>/, '<a$1 target="_blank" rel="nofollow">') : null;
        }
    });
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./model":28}],27:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.class('Fetcher', [], function (params, part) {
    var self = this;
    if (!params || !part) {
        return;
    }
    self.params = params;
    self.part = part;
}, {
    create: function (params, part) {
        var constructor = this;
        return new constructor(params, part);
    },
    fetchDone: function (response, f, q, stack, count) {
        var constructor = this;
        Array.prototype.push.apply(stack, response.items);
        f.nextPageToken = response.nextPageToken || null;
        f.hasNextPage = !!f.nextPageToken;
        var lacks = count - stack.length;
        if (f.hasNextPage && stack.length < count) {
            f.fetch(lacks, q, stack, count);
        } else {
            stack = stack.map(function (item) {
                return constructor.model.create(item);
            });
            q.resolve(stack, f);
        }
    }
}, {
    params: null,
    part: null,
    nextPageToken: null,
    hasNextPage: true,
    hasNext: function () {
        var self = this;
        return self.hasNextPage;
    },
    fetch: function (maxResults, q, stack, count) {
        var self = this;
        count = count || maxResults;
        maxResults = maxResults <= self.constructor.model.MAX_RESULTS_MAX ? maxResults : self.constructor.model.MAX_RESULTS_MAX;
        q = q || $.Deferred();
        stack = stack || [];
        var params = $.extend({}, self.params, {
                part: self.part,
                maxResults: maxResults,
                pageToken: self.nextPageToken
            });
        if (!self.hasNextPage) {
            q.reject();
        } else {
            self.constructor.model.client.get(self.constructor.model.path, params).done(function (response) {
                self.constructor.fetchDone(response, self, q, stack, count);
            });
        }
        return q.promise();
    },
    fetchAll: function (q) {
        var self = this;
        q = q || $.Deferred();
        var params = $.extend({}, self.params, {
                part: self.part,
                maxResults: self.constructor.model.MAX_RESULTS_MAX
            });
        if (!self.hasNextPage) {
        } else {
            self.constructor.model.client.get(self.constructor.model.path, params).done(function (response) {
                self.constructor.fetchDone(response, self, q, [], response.pageInfo.totalResults);
            });
        }
        return q.promise();
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],28:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.class('Model', [], function (data) {
    var self = this;
    if (data) {
        self.fill(data);
    }
}, {
    MAX_RESULTS_MIN: 0,
    MAX_RESULTS_MAX: 49,
    find: function (params, part, q) {
        var constructor = this;
        if (!params || !part) {
            return;
        }
        q = q || $.Deferred();
        params.maxResults = 1;
        params.part = part;
        constructor.client.get(constructor.path, params).done(function (result) {
            if (!result.items.length) {
                q.reject();
            } else {
                q.resolve(constructor.create(result.items[0]));
            }
        });
        return q.promise();
    },
    findAll: function (params, part, maxResults, q) {
        var constructor = this;
        if (!params || !part) {
            return;
        }
        q = q || $.Deferred();
        params.part = part;
        if (maxResults) {
            params.maxResults = maxResults;
        }
        constructor.client.get(constructor.path, params).done(function (result) {
            var list = [];
            if (!result.items || !result.items.length) {
                q.reject();
            } else {
                $.each(result.items, function (i, item) {
                    list.push(constructor.create(item));
                });
                q.resolve(list);
            }
        });
        return q.promise();
    },
    create: function (data) {
        var constructor = this;
        return new constructor(data);
    }
}, {
    fill: function (data) {
        var self = this;
        $.extend(self, data);
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],29:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Model = require('./model');
module.exports = function (client) {
    return Olivie.class('PlaylistItem', [Model], function (data) {
        var self = this;
        self.getParent('Model').call(self, data);
    }, {
        client: client,
        path: '/playlistItems'
    }, {});
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./model":28}],30:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Fetcher = require('./fetcher');
module.exports = function (model) {
    return Olivie.class('PlaylistItemsFetcher', [Fetcher], function (params, part) {
        var self = this;
        self.getParent('Fetcher').call(self, params, part);
    }, { model: model }, {});
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./fetcher":27}],31:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Model = require('./model');
module.exports = function (client) {
    return Olivie.class('Playlist', [Model], function (data) {
        var self = this;
        self.getParent('Model').call(self, data);
    }, {
        client: client,
        path: '/playlists'
    }, {});
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./model":28}],32:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Fetcher = require('./fetcher');
module.exports = function (model) {
    return Olivie.class('PlaylistsFetcher', [Fetcher], function (params, part) {
        var self = this;
        self.getParent('Fetcher').call(self, params, part);
    }, { model: model }, {});
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./fetcher":27}],33:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.class('ProxyStorage', [], function (fetcher, order) {
    var self = this;
    self.fetcher = fetcher;
    self.orderingRules = [];
    order = Olivie.utils.unifyMultipleOption(order) || [];
    $.each(order, function (i, rule) {
        rule = rule.split('#');
        var field = self.constructor.ORDER_FIELD_ALIASES[rule[0]] || rule[0];
        var direction = rule[1] || 'asc';
        self.orderingRules.push({
            field: field,
            direction: direction
        });
    });
}, {
    ORDER_FIELD_ALIASES: {
        likes: 'statistics.likeCount',
        dislikes: 'statistics.dislikeCount',
        views: 'statistics.viewCount',
        comments: 'statistics.commentCount',
        position: '__relatedPlaylistItem.snippet.position'
    }
}, {
    fetcher: null,
    result: null,
    orderingRules: null,
    pointer: 0,
    prepare: function () {
        var self = this;
        var q = $.Deferred();
        self.fetcher.prepare().done(function () {
            self.fetcher.fetchAll().done(function (result) {
                self.result = result;
                self.sortResult();
                q.resolve();
            });
        });
        return q.promise();
    },
    sortResult: function () {
        var self = this;
        $.each(self.orderingRules, function (i, rule) {
            var orderingFunction;
            if (rule.field === 'random') {
                Olivie.utils.shuffle(self.result);
            } else {
                orderingFunction = jQuery.yottie.orderFunctions[rule.field];
                if (!orderingFunction) {
                    orderingFunction = function (a, b) {
                        var aPropValue = Olivie.utils.getProperty(a, rule.field, Olivie.utils.parseInt);
                        var bPropValue = Olivie.utils.getProperty(b, rule.field, Olivie.utils.parseInt);
                        if (aPropValue < bPropValue) {
                            return -1;
                        }
                        if (aPropValue > bPropValue) {
                            return 1;
                        }
                        return 0;
                    };
                }
                self.result.sort(orderingFunction);
                if (rule.direction === 'desc') {
                    self.result.reverse();
                }
            }
        });
    },
    isReady: function () {
        var self = this;
        return self.fetcher.isReady();
    },
    hasNext: function () {
        var self = this;
        return self.result.length > self.pointer;
    },
    fetch: function (count, q) {
        var self = this;
        q = q || $.Deferred();
        if (self.isReady() && self.hasNext()) {
            self.pointer += count;
            q.resolve(self.result.slice(self.pointer - count, self.pointer));
        } else {
            q.reject();
        }
        return q.promise();
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],34:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie');
module.exports = Olivie.class('UniversalVideoFetcher', [], function (source, part, youtube) {
    var self = this;
    self.rawSource = source;
    self.part = part;
    self.youtube = youtube;
    self.preparedSource = [];
    self.fetchers = [];
    self.stack = [];
    self.videoPlaylistItemRelations = {};
}, {
    stackSortingFunc: function (a, b) {
        var timeA = a.getPublishedTimestamp();
        var timeB = b.getPublishedTimestamp();
        if (timeA > timeB) {
            return -1;
        } else if (timeA < timeB) {
            return 1;
        }
        return 0;
    }
}, {
    youtube: null,
    rawSource: null,
    preparedSource: null,
    fetchers: null,
    stack: null,
    part: null,
    videoPlaylistItemRelations: null,
    isReady: function () {
        var self = this;
        return !!self.fetchers.length;
    },
    sortStack: function () {
        var self = this;
        self.stack.sort(self.constructor.stackSortingFunc);
    },
    hasNext: function () {
        var self = this;
        return self.stack && self.stack.length || self.fetchers.some(function (item) {
            return item.hasNext();
        });
    },
    prepare: function () {
        var self = this;
        var q = $.Deferred();
        var preparePromises = [];
        $.each(self.rawSource, function (i, src) {
            var q = $.Deferred();
            if (src.kind === 'youtube#channel') {
                self.youtube.model(src.kind).find(src.criteria, 'contentDetails').done(function (channel) {
                    var id = Olivie.utils.getProperty(channel, 'contentDetails.relatedPlaylists.uploads');
                    if (!id) {
                        return;
                    }
                    q.resolve({
                        kind: 'youtube#playlist',
                        criteria: { id: id }
                    });
                });
            } else {
                q.resolve(src);
            }
            preparePromises.push(q);
        });
        $.when.apply($, preparePromises).done(function () {
            var playlistOrigins = [];
            var videoIds = [];
            $.each(arguments, function (i, src) {
                if (src.kind === 'youtube#playlist') {
                    playlistOrigins.push(src);
                } else {
                    videoIds.push(src.criteria.id);
                }
            });
            self.preparedSource = playlistOrigins;
            if (videoIds.length) {
                self.preparedSource.push({
                    kind: 'youtube#video',
                    criteria: { id: videoIds }
                });
            }
            $.each(self.preparedSource, function (i, src) {
                var fetcher, criteria, model, part;
                if (src.kind === 'youtube#playlist') {
                    model = 'youtube#playlistItem';
                    criteria = { playlistId: src.criteria.id };
                    part = 'contentDetails,snippet';
                } else {
                    model = src.kind;
                    criteria = { id: src.criteria.id.join(',') };
                    part = self.part;
                }
                fetcher = self.youtube.fetcher(model).create(criteria, part);
                self.fetchers.push(fetcher);
            });
            q.resolve();
        });
        return q.promise();
    },
    fetch: function (maxResults, q) {
        var self = this;
        q = q || $.Deferred();
        var chunk;
        var stack;
        var fetchPromises = [];
        var hasNext = self.hasNext();
        if (!self.isReady()) {
            q.reject(0);
        } else if (self.stack.length >= maxResults || !hasNext && self.stack.length) {
            chunk = self.stack.slice(0, maxResults);
            self.stack.splice(0, maxResults);
            q.resolve(chunk);
        } else if (!hasNext) {
            q.reject(1);
        } else {
            $.each(self.fetchers, function (i, fetcher) {
                if (!fetcher.hasNext()) {
                    return;
                }
                fetchPromises.push(fetcher.fetch(maxResults));
            });
            if (!fetchPromises.length && self.stack && self.stack.length) {
                stack = self.stack.slice();
                self.stack = [];
                q.resolve(stack);
            }
            $.when.apply($, fetchPromises).done(function () {
                var videoIds = [];
                var args = $.type(arguments[1]) === 'object' ? [arguments] : arguments;
                $.each(args, function (i, res) {
                    if (!res) {
                        return;
                    }
                    var list = res[0];
                    var fetcher = res[1];
                    if (fetcher.constructor.id === 'VideoFetcher') {
                        Array.prototype.push.apply(self.stack, list);
                    } else {
                        Array.prototype.push.apply(videoIds, list.map(function (t) {
                            self.videoPlaylistItemRelations[t.contentDetails.videoId] = t;
                            return t.contentDetails.videoId;
                        }));
                    }
                });
                var videosLoadPromise = $.Deferred();
                if (videoIds.length) {
                    self.youtube.model('youtube#video').findAllVideos({ id: videoIds.join(',') }, self.part).done(function (list) {
                        Array.prototype.push.apply(self.stack, list);
                        $.each(self.stack, function (i, video) {
                            video.__relatedPlaylistItem = self.videoPlaylistItemRelations[video.id];
                        });
                        videosLoadPromise.resolve();
                    });
                } else {
                    videosLoadPromise.resolve();
                }
                videosLoadPromise.done(function () {
                    self.fetch(maxResults, q);
                });
            });
        }
        return q.promise();
    },
    fetchAll: function (q, result) {
        var self = this;
        q = q || $.Deferred();
        result = result || [];
        self.fetch(49).done(function (chunk) {
            Array.prototype.push.apply(result, chunk);
            self.fetchAll(q, result);
        }).fail(function () {
            q.resolve(result);
        });
        return q.promise();
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11}],35:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Fetcher = require('./fetcher');
module.exports = function (model) {
    return Olivie.class('VideoFetcher', [Fetcher], function (params, part) {
        var self = this;
        self.getParent('Fetcher').call(self, params, part);
        self.stack = [];
    }, { model: model }, {
        stack: null,
        hasNext: function () {
            var self = this;
            return self.hasNextPage || self.stack.length;
        },
        fetch: function (maxResults, q, stack, count) {
            var self = this;
            count = count || maxResults;
            q = q || $.Deferred();
            stack = stack || [];
            var preloaderDef = $.Deferred();
            if (!self.hasNext()) {
                q.reject();
            } else {
                if (!self.stack.length) {
                    self.hasNextPage = false;
                    self.constructor.model.findAllVideos({ id: self.params.id }, self.part).done(function (list) {
                        self.stack = list;
                        preloaderDef.resolve();
                    }).fail(function () {
                        q.reject();
                    });
                } else {
                    preloaderDef.resolve();
                }
                preloaderDef.done(function () {
                    var chunk = self.stack.slice(0, maxResults);
                    self.stack.splice(0, maxResults);
                    if (chunk.length) {
                        q.resolve(chunk, self);
                    } else {
                        q.reject();
                    }
                });
            }
            return q.promise();
        }
    });
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./fetcher":27}],36:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), Model = require('./model');
module.exports = function (client) {
    return Olivie.class('Video', [Model], function (data) {
        var self = this;
        self.getParent('Model').call(self, data);
    }, {
        DURATION_REGEX: /\d+[A-Z]/g,
        client: client,
        path: '/videos',
        findAllVideos: function (params, part, maxResults, q, stack) {
            var constructor = this;
            q = q || $.Deferred();
            var partParams;
            if (params && params.id) {
                params.id = $.type(params.id) === 'string' ? params.id.split(',') : params.id;
                params.id = maxResults ? params.id.slice(0, maxResults) : params.id;
                if (stack || params.id.length > constructor.MAX_RESULTS_MAX) {
                    stack = stack || [];
                    partParams = $.extend(false, {}, params, { id: params.id.slice(0, constructor.MAX_RESULTS_MAX).join(',') });
                    constructor.findAll(partParams, part).done(function (chunk) {
                        Array.prototype.push.apply(stack, chunk);
                        var itemsLeft = params.id.slice(constructor.MAX_RESULTS_MAX);
                        var nextPartParams;
                        if (itemsLeft.length) {
                            nextPartParams = $.extend(false, {}, params, { id: itemsLeft });
                            constructor.findAllVideos(nextPartParams, part, null, q, stack);
                        } else {
                            q.resolve(stack);
                        }
                    });
                } else {
                    params.id = params.id.join(',');
                    constructor.findAll(params, part, maxResults, q);
                }
            } else {
                constructor.findAll(params, part, maxResults, q);
            }
            return q.promise();
        }
    }, {
        getPublishedTimestamp: function () {
            var self = this;
            return self.get('snippet.publishedAt', Date.parse);
        },
        parseDuration: function () {
            var self = this;
            var duration = {};
            var durationStr = self.get('contentDetails.duration');
            if (!durationStr) {
                return;
            }
            var matches = durationStr.match(self.constructor.DURATION_REGEX);
            $.each(matches, function (i, match) {
                var designator = match.substr(match.length - 1).toLowerCase();
                var value = '0' + parseInt(match.substr(0, match.length - 1), 10);
                value = value.substr(-2);
                duration[designator] = value;
            });
            return duration;
        }
    });
};
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./model":28}],37:[function(require,module,exports){
"use strict";
var $ = require('./../../../../olivie/src/js/jquery'), Olivie = require('./../../../../olivie/src/js/olivie'), UniversalVideoFetcher = require('./universal-video-fetcher'), channel = require('./channel'), playlist = require('./playlist'), playlistItem = require('./playlist-item'), video = require('./video'), commentThread = require('./comment-thread'), playlistsFetcher = require('./playlists-fetcher'), playlistItemFetcher = require('./playlist-items-fetcher'), videoFetcher = require('./video-fetcher');
module.exports = Olivie.component('Youtube', function () {
}, {
    dependencies: ['client'],
    SOURCE_DETERMINANTS: [
        {
            kind: 'youtube#channel',
            regex: /^https?:\/\/(www\.)?youtube\.com\/channel\/([^\/]+)\/?$/,
            func: function (matches) {
                return { criteria: { id: matches[2] } };
            }
        },
        {
            kind: 'youtube#channel',
            regex: /^https?:\/\/(www\.)?youtube\.com\/user\/([^\/]+)\/?$/,
            func: function (matches) {
                return { criteria: { forUsername: matches[2] } };
            }
        },
        {
            kind: 'youtube#playlist',
            regex: /^https?:\/\/(www\.)?youtube\.com\/playlist\/?\?list=([^$]+)$/,
            func: function (matches) {
                return { criteria: { id: matches[2] } };
            }
        },
        {
            kind: 'youtube#video',
            regex: /^https?:\/\/(www\.)?youtube\.com\/watch\/?\?v=([^$&]+)/,
            func: function (matches) {
                return { criteria: { id: matches[2] } };
            }
        }
    ],
    formatNumberDigits: function (num) {
        return Olivie.utils.numberFormat(num, 0, null, ' ');
    }
}, {
    models: null,
    register: function (app) {
        var self = this;
        self.getParent('Component').prototype.register.call(self, app);
        self.models = {
            'youtube#channel': channel(self.client),
            'youtube#playlist': playlist(self.client),
            'youtube#playlistItem': playlistItem(self.client),
            'youtube#video': video(self.client),
            'youtube#commentThread': commentThread(self.client)
        };
        self.fetchers = {
            'youtube#playlist': playlistsFetcher(self.model('youtube#playlist')),
            'youtube#playlistItem': playlistItemFetcher(self.model('youtube#playlistItem')),
            'youtube#video': videoFetcher(self.model('youtube#video'))
        };
    },
    hasModel: function (id) {
        var self = this;
        return !!self.models[id];
    },
    model: function (id) {
        var self = this;
        if (!self.hasModel(id)) {
            return;
        }
        return self.models[id];
    },
    hasFetcher: function (id) {
        var self = this;
        return !!self.fetchers[id];
    },
    fetcher: function (id) {
        var self = this;
        if (!self.hasFetcher(id)) {
            return;
        }
        return self.fetchers[id];
    },
    createUniversalVideoFetcher: function (source, part) {
        var self = this;
        return new UniversalVideoFetcher(source, part, self);
    },
    parseSource: function (str) {
        var self = this;
        var source = null;
        $.each(self.constructor.SOURCE_DETERMINANTS, function (i, det) {
            var matches = str.match(det.regex);
            if (matches) {
                source = $.extend({ kind: det.kind }, det.func(matches));
                return false;
            }
        });
        return source;
    },
    resizeLogo: function (url, size) {
        return url.replace(/\/s\d+-c-k-no/, '/s' + parseInt(size, 10) + '-c-k-no');
    }
});
},{"./../../../../olivie/src/js/jquery":5,"./../../../../olivie/src/js/olivie":11,"./channel":25,"./comment-thread":26,"./playlist":31,"./playlist-item":29,"./playlist-items-fetcher":30,"./playlists-fetcher":32,"./universal-video-fetcher":34,"./video":36,"./video-fetcher":35}],38:[function(require,module,exports){
"use strict";
module.exports = {
    default: {
        header: {
            bg: 'rgb(255, 255, 255)',
            bannerOverlay: 'rgba(255, 255, 255, 0.81)',
            channelName: 'rgb(34, 34, 34)',
            channelNameHover: 'rgb(47, 165, 255)',
            channelDescription: 'rgb(34, 34, 34)',
            anchor: 'rgb(47, 165, 255)',
            anchorHover: 'rgb(34, 34, 34)',
            counters: 'rgb(102, 102, 102)'
        },
        groups: {
            bg: 'rgb(255, 255, 255)',
            link: 'rgb(79, 79, 79)',
            linkHover: 'rgb(79, 79, 79)',
            linkActive: 'rgb(0, 0, 0)',
            highlight: 'rgb(235, 235, 235)',
            highlightHover: 'rgb(255, 0, 0)',
            highlightActive: 'rgb(255, 0, 0)'
        },
        content: {
            bg: 'rgb(255, 255, 255)',
            arrows: 'rgb(255, 255, 255)',
            arrowsHover: 'rgb(255, 0, 0)',
            arrowsBg: 'rgba(0, 0, 0, 0.4)',
            arrowsBgHover: 'rgba(0, 0, 0, 0.8)',
            scrollbarBg: 'rgb(204, 204, 204)',
            scrollbarSliderBg: 'rgba(0, 0, 0, 0.4)'
        },
        video: {
            bg: 'rgb(243, 243, 243)',
            overlay: 'rgba(255, 255, 255, 0.9)',
            playIcon: 'rgba(255, 255, 255, 0.4)',
            playIconHover: 'rgba(255, 255, 255, 0.8)',
            duration: 'rgb(255, 255, 255)',
            durationBg: 'rgba(34, 34, 34, 0.81)',
            title: 'rgb(26, 137, 222)',
            titleHover: 'rgb(47, 165, 255)',
            date: 'rgb(140, 140, 140)',
            description: 'rgb(34, 34, 34)',
            anchor: 'rgb(26, 137, 222)',
            anchorHover: 'rgb(47, 165, 255)',
            counters: 'rgb(149, 149, 149)'
        },
        popup: {
            bg: 'rgb(255, 255, 255)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            title: 'rgb(34, 34, 34)',
            channelName: 'rgb(34, 34, 34)',
            channelNameHover: 'rgb(47, 165, 255)',
            viewsCounter: 'rgb(85, 85, 85)',
            likesRatio: 'rgb(47, 165, 255)',
            dislikesRatio: 'rgb(207, 207, 207)',
            likesCounter: 'rgb(144, 144, 144)',
            dislikesCounter: 'rgb(144, 144, 144)',
            date: 'rgb(34, 34, 34)',
            description: 'rgb(34, 34, 34)',
            anchor: 'rgb(26, 137, 222)',
            anchorHover: 'rgb(47, 165, 255)',
            descriptionMoreButton: 'rgb(102, 102, 102)',
            descriptionMoreButtonHover: 'rgb(34, 34, 34)',
            commentsUsername: 'rgb(34, 34, 34)',
            commentsUsernameHover: 'rgb(47, 165, 255)',
            commentsPassedTime: 'rgb(115, 115, 115)',
            commentsText: 'rgb(34, 34, 34)',
            commentsLikes: 'rgb(180, 180, 180)',
            controls: 'rgb(160, 160, 160)',
            controlsHover: 'rgb(220, 220, 220)',
            controlsMobile: 'rgb(220, 220, 220)',
            controlsMobileBg: 'rgba(255, 255, 255, 0)'
        }
    },
    dark: {
        header: {
            bg: 'rgb(51, 51, 51)',
            bannerOverlay: 'rgba(51, 51, 51, 0.81)',
            channelName: 'rgb(255, 255, 255)',
            channelNameHover: 'rgb(77, 178, 255)',
            channelDescription: 'rgb(255, 255, 255)',
            anchor: 'rgb(77, 178, 255)',
            anchorHover: 'rgb(255, 255, 255)',
            counters: 'rgb(160, 160, 160)'
        },
        groups: {
            bg: 'rgb(51, 51, 51)',
            link: 'rgb(255, 255, 255)',
            linkHover: 'rgb(255, 66, 66)',
            linkActive: 'rgb(255, 66, 66)',
            highlight: 'rgb(85, 85, 85)',
            highlightHover: 'rgb(255, 66, 66)',
            highlightActive: 'rgb(255, 66, 66)'
        },
        content: {
            bg: 'rgb(51, 51, 51)',
            arrows: 'rgb(34, 34, 34)',
            arrowsHover: 'rgb(255, 0, 0)',
            arrowsBg: 'rgba(255, 255, 255, 0.4)',
            arrowsBgHover: 'rgba(255, 255, 255, 0.8)',
            scrollbarBg: 'rgb(85, 85, 85)',
            scrollbarSliderBg: 'rgba(255, 255, 255, 0.4)'
        },
        video: {
            bg: 'rgb(28, 28, 28)',
            overlay: 'rgba(28, 28, 28, 0.9)',
            playIcon: 'rgba(255, 255, 255, 0.4)',
            playIconHover: 'rgba(255, 255, 255, 0.8)',
            duration: 'rgb(255, 255, 255)',
            durationBg: 'rgba(28, 28, 28, 0.81)',
            title: 'rgb(42, 163, 255)',
            titleHover: 'rgb(77, 178, 255)',
            date: 'rgb(116, 116, 116)',
            description: 'rgb(200, 200, 200)',
            anchor: 'rgb(42, 163, 255)',
            anchorHover: 'rgb(77, 178, 255)',
            counters: 'rgb(112, 112, 112)'
        },
        popup: {
            bg: 'rgb(51, 51, 51)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            title: 'rgb(255, 255, 255)',
            channelName: 'rgb(255, 255, 255)',
            channelNameHover: 'rgb(77, 178, 255)',
            viewsCounter: 'rgb(255, 255, 255)',
            likesRatio: 'rgb(47, 165, 255)',
            dislikesRatio: 'rgb(100, 100, 100)',
            likesCounter: 'rgb(144, 144, 144)',
            dislikesCounter: 'rgb(144, 144, 144)',
            date: 'rgb(255, 255, 255)',
            description: 'rgb(255, 255, 255)',
            anchor: 'rgb(42, 163, 255)',
            anchorHover: 'rgb(77, 178, 255)',
            descriptionMoreButton: 'rgb(120, 120, 120)',
            descriptionMoreButtonHover: 'rgb(255, 255, 255)',
            commentsUsername: 'rgb(255, 255, 255)',
            commentsUsernameHover: 'rgb(77, 178, 255)',
            commentsPassedTime: 'rgb(116, 116, 116)',
            commentsText: 'rgb(255, 255, 255)',
            commentsLikes: 'rgb(116, 116, 116)',
            controls: 'rgb(160, 160, 160)',
            controlsHover: 'rgb(220, 220, 220)',
            controlsMobile: 'rgb(220, 220, 220)',
            controlsMobileBg: 'rgba(255, 255, 255, 0)'
        }
    },
    red: {
        header: {
            bg: 'rgb(197, 17, 9)',
            bannerOverlay: 'rgb(197, 17, 9)',
            channelName: 'rgb(255, 255, 255)',
            channelNameHover: 'rgba(255, 255, 255, 0.9)',
            channelDescription: 'rgb(255, 255, 255)',
            anchor: 'rgba(255, 255, 255, 0.9)',
            anchorHover: 'rgb(255, 255, 255)',
            counters: 'rgba(255, 255, 255, 0.6)'
        },
        groups: {
            bg: 'rgb(230, 33, 23)',
            link: 'rgba(255, 255, 255, 0.8)',
            linkHover: 'rgb(255, 255, 255)',
            linkActive: 'rgb(255, 255, 255)',
            highlight: 'rgba(255, 255, 255, 0.4)',
            highlightHover: 'rgb(255, 255, 255)',
            highlightActive: 'rgb(255, 255, 255)'
        },
        content: {
            bg: 'rgb(236, 236, 236)',
            arrows: 'rgb(255, 255, 255)',
            arrowsHover: 'rgb(0, 198, 255)',
            arrowsBg: 'rgba(0, 0, 0, 0.7)',
            arrowsBgHover: 'rgba(0, 0, 0, 0.95)',
            scrollbarBg: 'rgb(223, 223, 223)',
            scrollbarSliderBg: 'rgba(133, 133, 133, 0.4)'
        },
        video: {
            bg: 'rgb(255, 255, 255)',
            overlay: 'rgba(255, 255, 255, 0.95)',
            playIcon: 'rgba(255, 255, 255, 0.4)',
            playIconHover: 'rgba(255, 255, 255, 0.8)',
            duration: 'rgb(209, 238, 246)',
            durationBg: 'rgba(5, 25, 43, 0.81)',
            title: 'rgb(0, 0, 0)',
            titleHover: 'rgb(255, 26, 54)',
            date: 'rgb(177, 177, 177)',
            description: 'rgb(80, 80, 80)',
            anchor: 'rgb(255, 26, 54)',
            anchorHover: 'rgb(0, 0, 0)',
            counters: 'rgb(177, 177, 177)'
        },
        popup: {
            bg: 'rgb(255, 255, 255)',
            overlay: 'rgba(12, 2, 2, 0.8)',
            title: 'rgb(0, 0, 0)',
            channelName: 'rgb(0, 0, 0)',
            channelNameHover: 'rgb(255, 26, 54)',
            viewsCounter: 'rgb(85, 85, 85)',
            likesRatio: 'rgb(47, 165, 255)',
            dislikesRatio: 'rgb(207, 207, 207)',
            likesCounter: 'rgb(144, 144, 144)',
            dislikesCounter: 'rgb(144, 144, 144)',
            date: 'rgb(80, 80, 80)',
            description: 'rgb(80, 80, 80)',
            anchor: 'rgb(255, 26, 54)',
            anchorHover: 'rgb(0, 0, 0)',
            descriptionMoreButton: 'rgb(177, 177, 177)',
            descriptionMoreButtonHover: 'rgb(80, 80, 80)',
            commentsUsername: 'rgb(0, 0, 0)',
            commentsUsernameHover: 'rgb(255, 26, 54)',
            commentsPassedTime: 'rgb(177, 177, 177)',
            commentsText: 'rgb(80, 80, 80)',
            commentsLikes: 'rgb(180, 180, 180)',
            controls: 'rgb(160, 160, 160)',
            controlsHover: 'rgb(220, 220, 220)',
            controlsMobile: 'rgb(220, 220, 220)',
            controlsMobileBg: 'rgba(255, 255, 255, 0)'
        }
    },
    'deep blue': {
        header: {
            bg: 'rgb(50, 81, 108)',
            bannerOverlay: 'rgba(50, 81, 108, 0.81)',
            channelName: 'rgb(255, 255, 255)',
            channelNameHover: 'rgb(98, 220, 255)',
            channelDescription: 'rgb(209, 238, 246)',
            anchor: 'rgb(98, 220, 255)',
            anchorHover: 'rgb(255, 255, 255)',
            counters: 'rgb(140, 170, 197)'
        },
        groups: {
            bg: 'rgb(33, 56, 75)',
            link: 'rgb(255, 255, 255)',
            linkHover: 'rgb(98, 220, 255)',
            linkActive: 'rgb(98, 220, 255)',
            highlight: 'rgb(50, 81, 108)',
            highlightHover: 'rgb(0, 198, 255)',
            highlightActive: 'rgb(0, 198, 255)'
        },
        content: {
            bg: 'rgb(33, 56, 75)',
            arrows: 'rgb(255, 255, 255)',
            arrowsHover: 'rgb(0, 198, 255)',
            arrowsBg: 'rgba(0, 0, 0, 0.7)',
            arrowsBgHover: 'rgba(0, 0, 0, 0.95)',
            scrollbarBg: 'rgb(50, 81, 108)',
            scrollbarSliderBg: 'rgb(66, 114, 156)'
        },
        video: {
            bg: 'rgb(5, 25, 43)',
            overlay: 'rgba(5, 25, 43, 0.9)',
            playIcon: 'rgba(255, 255, 255, 0.4)',
            playIconHover: 'rgba(255, 255, 255, 0.8)',
            duration: 'rgb(209, 238, 246)',
            durationBg: 'rgba(5, 25, 43, 0.81)',
            title: 'rgb(0, 198, 255)',
            titleHover: 'rgb(255, 255, 255)',
            date: 'rgb(50, 81, 108)',
            description: 'rgb(209, 238, 246)',
            anchor: 'rgb(0, 198, 255)',
            anchorHover: 'rgb(255, 255, 255)',
            counters: 'rgb(50, 81, 108)'
        },
        popup: {
            bg: 'rgb(33, 56, 75)',
            overlay: 'rgba(4, 17, 28, 0.8)',
            title: 'rgb(255, 255, 255)',
            channelName: 'rgb(255, 255, 255)',
            channelNameHover: 'rgb(0, 198, 255)',
            viewsCounter: 'rgb(255, 255, 255)',
            likesRatio: 'rgb(44, 138, 218)',
            dislikesRatio: 'rgb(51, 79, 102)',
            likesCounter: 'rgb(68, 107, 140)',
            dislikesCounter: 'rgb(68, 107, 140)',
            date: 'rgb(68, 107, 140)',
            description: 'rgb(209, 238, 246)',
            anchor: 'rgb(0, 198, 255)',
            anchorHover: 'rgb(255, 255, 255)',
            descriptionMoreButton: 'rgb(68, 107, 140)',
            descriptionMoreButtonHover: 'rgb(209, 238, 246)',
            commentsUsername: 'rgb(255, 255, 255)',
            commentsUsernameHover: 'rgb(0, 198, 255)',
            commentsPassedTime: 'rgb(68, 107, 140)',
            commentsText: 'rgb(209, 238, 246)',
            commentsLikes: 'rgb(68, 107, 140)',
            controls: 'rgb(68, 107, 140)',
            controlsHover: 'rgb(0, 198, 255)',
            controlsMobile: 'rgb(68, 107, 140)',
            controlsMobileBg: 'rgb(33, 56, 75)'
        }
    }
};
},{}],39:[function(require,module,exports){
"use strict";
var views = {};
views['ads'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<ins class="adsbygoogle" style="width:' + alias3((helper = (helper = helpers.width || (depth0 != null ? depth0.width : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'width',
            'hash': {},
            'data': data
        }) : helper)) + 'px;height:' + alias3((helper = (helper = helpers.height || (depth0 != null ? depth0.height : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'height',
            'hash': {},
            'data': data
        }) : helper)) + 'px" data-ad-client="' + alias3((helper = (helper = helpers.pubId || (depth0 != null ? depth0.pubId : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'pubId',
            'hash': {},
            'data': data
        }) : helper)) + '" data-ad-slot="' + alias3((helper = (helper = helpers.slotId || (depth0 != null ? depth0.slotId : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'slotId',
            'hash': {},
            'data': data
        }) : helper)) + '"></ins>';
    },
    'useData': true
});
views['colorizer'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression, alias4 = this.lambda;
        return ' #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.bg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-overlay { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.bannerOverlay : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-title, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-title a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.channelName : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-title:hover, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-title a:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.channelNameHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-caption { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.channelDescription : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-caption a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.anchor : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-channel-caption a:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.anchorHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-header-properties-item { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.header : stack1) != null ? stack1.counters : stack1, depth0)) + '; }  #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.bg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.link : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item:hover a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.linkHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item.yottie-active a, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item.yottie-active:hover a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.linkActive : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.highlight : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item:hover::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.highlightHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item.yottie-active:hover::after, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-list-item.yottie-active::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.highlightActive : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control-left::before { background: linear-gradient(to left, rgba(255, 255, 255, 0), ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.bg : stack1, depth0)) + ' 60%); } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control-right::before { background: linear-gradient(to right, rgba(255, 255, 255, 0), ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.bg : stack1, depth0)) + ' 60%); } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control span::before, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control span::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.link : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control:hover span::before, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-nav-control:hover span::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.groups : stack1) != null ? stack1.linkActive : stack1, depth0)) + '; }  #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.bg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.arrowsBg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow:hover { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.arrowsBgHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow span::before, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow span::after, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow::before { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.arrows : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow:hover span::before, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow:hover span::after, #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-arrow:hover::before { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.arrowsHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-scrollbar { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.scrollbarBg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-feed-section-scrollbar .swiper-scrollbar-drag { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.content : stack1) != null ? stack1.scrollbarSliderBg : stack1, depth0)) + '; }  #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.bg : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-overlay { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.overlay : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-preview-play { border-left-color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.playIcon : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video:hover .yottie-widget-video-preview-play { border-left-color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.playIconHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-preview-marker-duration { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.durationBg : stack1, depth0)) + '; color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.duration : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-title { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.title : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-title:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.titleHover : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-passed-time { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.date : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-caption { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.description : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-properties-item { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.counters : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-caption a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.anchor : stack1, depth0)) + '; } #yottie_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-widget-video-info-caption a:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.video : stack1) != null ? stack1.anchorHover : stack1, depth0)) + '; }  #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-inner { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.bg : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-inner a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.anchor : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-inner a:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.anchorHover : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-overlay { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.overlay : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-title { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.title : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-title { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.title : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-inner .yottie-popup-video-channel-name { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.channelName : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-inner .yottie-popup-video-channel-name:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.channelNameHover : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-properties-views { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.viewsCounter : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-properties-rating-ratio { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.dislikesRatio : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-properties-rating-ratio span { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.likesRatio : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-properties-rating-counters-like span { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.likesCounter : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-properties-rating-counters-dislike span { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.dislikesCounter : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-date { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.date : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-description { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.description : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-description-more { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.descriptionMoreButton : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-description-more:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.descriptionMoreButtonHover : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-comments-item-name a { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.commentsUsername : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-comments-item-name a:hover { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.commentsUsernameHover : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-comments-item-passed-time { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.commentsPassedTime : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-comments-item-text { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.commentsText : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-video-comments-item-likes { color: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.commentsLikes : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close::before, #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.controls : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close:hover::before, #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close:hover::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.controlsHover : stack1, depth0)) + '; } @media only screen and (max-width: 768px) { #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.controlsMobileBg : stack1, depth0)) + '; } #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close::before, #yottie_popup_' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + ' .yottie-popup-control-close::after { background: ' + alias3(alias4((stack1 = (stack1 = depth0 != null ? depth0.scheme : depth0) != null ? stack1.popup : stack1) != null ? stack1.controlsMobile : stack1, depth0)) + '; } }';
    },
    'useData': true
});
views['error'] = views['error'] || {};
views['error']['container'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-error"><div class="yottie-error-overlay"></div><div class="yottie-error-content"><div class="yottie-error-content-title">Unfortunately, an error occurred:</div></div></div>';
    },
    'useData': true
});
views['error']['content'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-error-content-msg">' + this.escapeExpression((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'message',
            'hash': {},
            'data': data
        }) : helper)) + '</div>';
    },
    'useData': true
});
views['feed'] = views['feed'] || {};
views['feed']['arrows'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed-section-arrow yottie-widget-feed-section-arrow-prev"><span></span></div><div class="yottie-widget-feed-section-arrow yottie-widget-feed-section-arrow-next"><span></span></div>';
    },
    'useData': true
});
views['feed']['container'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed"><div class="yottie-widget-feed-inner"></div><div class="yottie-widget-feed-ads" data-yt-ads-place="content"></div></div>';
    },
    'useData': true
});
views['feed']['loader'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed-section-loader"><div class="yottie-spinner"></div></div>';
    },
    'useData': true
});
views['feed']['scrollbar'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed-section-scrollbar swiper-scrollbar"></div>';
    },
    'useData': true
});
views['feed']['section'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed-section"><div class="yottie-widget-feed-section-inner swiper-container"><div class="swiper-wrapper"></div></div></div>';
    },
    'useData': true
});
views['feed']['slide'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-feed-section-slide swiper-slide""></div>';
    },
    'useData': true
});
views['groups'] = views['groups'] || {};
views['groups']['container'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        return ' yottie-disabled';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function';
        return '<div class="yottie-widget-nav' + ((stack1 = helpers.unless.call(depth0, depth0 != null ? depth0.visible : depth0, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '"><div class="yottie-widget-nav-inner"> ' + ((stack1 = (helper = (helper = helpers.list || (depth0 != null ? depth0.list : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'list',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + ' ' + ((stack1 = (helper = (helper = helpers.controls || (depth0 != null ? depth0.controls : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'controls',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + '</div></div>';
    },
    'useData': true
});
views['groups']['controls'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-nav-control yottie-widget-nav-control-left yottie-widget-nav-control-disabled"><span></span></div><div class="yottie-widget-nav-control yottie-widget-nav-control-right yottie-widget-nav-control-disabled"><span></span></div>';
    },
    'useData': true
});
views['groups']['list'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<li class="yottie-widget-nav-list-item' + ((stack1 = helpers.unless.call(depth0, data && data.index, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(2, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '"> <a href="javascript:void(0)" data-yt-id="' + alias3((helper = (helper = helpers.index || data && data.index) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'index',
            'hash': {},
            'data': data
        }) : helper)) + '">' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '</a></li> ';
    },
    '2': function (depth0, helpers, partials, data) {
        return ' yottie-active';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<ul class="yottie-widget-nav-list"> ' + ((stack1 = helpers.each.call(depth0, depth0 != null ? depth0.groups : depth0, {
            'name': 'each',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</ul>';
    },
    'useData': true
});
views['header'] = views['header'] || {};
views['header']['banner'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-widget-header-banner" style="background-image: url(\'' + this.escapeExpression((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'url',
            'hash': {},
            'data': data
        }) : helper)) + '\');"></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.banner : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['header']['channel'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-widget-header-channel"><div class="yottie-widget-header-channel-inner"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channelName : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(2, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channelDescription : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(7, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div></div> ';
    },
    '2': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.id : depth0, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers.unless.call(depth0, depth0 != null ? depth0.id : depth0, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(5, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ';
    },
    '3': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<div class="yottie-widget-header-channel-title"> <a href="https://www.youtube.com/channel/' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + '/" title="' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank">' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '</a></div> ';
    },
    '5': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-widget-header-channel-title">' + this.escapeExpression((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '</div> ';
    },
    '7': function (depth0, helpers, partials, data) {
        var stack1, helper;
        return '<div class="yottie-widget-header-channel-caption">' + ((stack1 = (helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'description',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + '</div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channel : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['header']['container'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        return ' yottie-visible';
    },
    '3': function (depth0, helpers, partials, data) {
        return ' yottie-widget-header-brandingless';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.lambda;
        return '<div class="yottie-widget-header yottie-widget-header-' + this.escapeExpression((helper = (helper = helpers.layout || (depth0 != null ? depth0.layout : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'layout',
            'hash': {},
            'data': data
        }) : helper)) + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.visible : depth0, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ((stack1 = helpers.unless.call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.branding : stack1, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '"> ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.logo : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.overlay : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.banner : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.channel : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.properties : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.subscribe : stack1, depth0)) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['header']['logo'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.id : depth0, {
            'name': 'if',
            'hash': {},
            'fn': this.program(2, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers.unless.call(depth0, depth0 != null ? depth0.id : depth0, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(4, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ';
    },
    '2': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return ' <a class="yottie-widget-header-logo" href="https://www.youtube.com/channel/' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + '/" title="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" rel="nofollow"><img src="' + alias3((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'url',
            'hash': {},
            'data': data
        }) : helper)) + '" alt="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '"/></a> ';
    },
    '4': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<div class="yottie-widget-header-logo"> <img src="' + alias3((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'url',
            'hash': {},
            'data': data
        }) : helper)) + '" alt="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '"/></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.logo : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['header']['overlay'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-header-overlay"></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.banner : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['header']['properties'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-widget-header-properties"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.videosCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(2, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.subscribersCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(4, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.viewsCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(6, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div> ';
    },
    '2': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-header-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.videos : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-video"></span> <span>' + alias1((helper = (helper = helpers.videoCount || (depth0 != null ? depth0.videoCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'videoCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    '4': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-header-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.subscribers : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-subscribers"></span> <span>' + alias1((helper = (helper = helpers.subscriberCount || (depth0 != null ? depth0.subscriberCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'subscriberCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    '6': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-header-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.views : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-views"></span> <span>' + alias1((helper = (helper = helpers.viewCount || (depth0 != null ? depth0.viewCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'viewCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.properties : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['header']['subscribe'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-header-subscribe"><div class="yottie-widget-header-subscribe-button"></div></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.subscribeButton : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['popup'] = views['popup'] || {};
views['popup']['container'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, alias1 = this.lambda;
        return '<div class="yottie-popup yottie"> ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.overlay : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.wrapper : stack1, depth0)) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['control'] = views['popup']['control'] || {};
views['popup']['control']['arrows'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-control-arrow-previous yottie-popup-control-arrow"><span></span></div><div class="yottie-popup-control-arrow-next yottie-popup-control-arrow"><span></span></div>';
    },
    'useData': true
});
views['popup']['control']['close'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-control-close"></div>';
    },
    'useData': true
});
views['popup']['inner'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, alias1 = this.lambda;
        return '<div class="yottie-popup-inner"> ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.loader : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.controlClose : stack1, depth0)) != null ? stack1 : '') + '  ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.video : stack1, depth0)) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['loader'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-loader"><div class="yottie-spinner"></div></div>';
    },
    'useData': true
});
views['popup']['overlay'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-overlay"></div>';
    },
    'useData': true
});
views['popup']['video'] = views['popup']['video'] || {};
views['popup']['video']['channel'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<div class="yottie-popup-video-channel-logo"> <a href="' + alias3((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'link',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" rel="nofollow" title="' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '"><img src="' + alias3((helper = (helper = helpers.logo || (depth0 != null ? depth0.logo : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'logo',
            'hash': {},
            'data': data
        }) : helper)) + '" alt="' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '"></a></div> ';
    },
    '3': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return ' <a href="' + alias3((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'link',
            'hash': {},
            'data': data
        }) : helper)) + '" class="yottie-popup-video-channel-name" target="_blank" rel="nofollow">' + alias3((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'name',
            'hash': {},
            'data': data
        }) : helper)) + '</a> ';
    },
    '5': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-video-channel-subscribe"><div class="yottie-popup-video-channel-subscribe-button"></div></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-channel"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channelLogo : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '<div class="yottie-popup-video-channel-info"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channelName : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.subscribeButton : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(5, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div></div>';
    },
    'useData': true
});
views['popup']['video']['comments'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<div class="yottie-popup-video-comments-item"><div class="yottie-popup-video-comments-item-profile-image"> <a href="' + alias3((helper = (helper = helpers.authorChannelUrl || (depth0 != null ? depth0.authorChannelUrl : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'authorChannelUrl',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" rel="nofollow"><img src="' + alias3((helper = (helper = helpers.authorProfileImageUrl || (depth0 != null ? depth0.authorProfileImageUrl : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'authorProfileImageUrl',
            'hash': {},
            'data': data
        }) : helper)) + '"></a></div><div class="yottie-popup-video-comments-item-info"><div class="yottie-popup-video-comments-item-header"><div class="yottie-popup-video-comments-item-name"> <a href="' + alias3((helper = (helper = helpers.authorChannelUrl || (depth0 != null ? depth0.authorChannelUrl : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'authorChannelUrl',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" rel="nofollow">' + alias3((helper = (helper = helpers.authorName || (depth0 != null ? depth0.authorName : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'authorName',
            'hash': {},
            'data': data
        }) : helper)) + '</a></div><div class="yottie-popup-video-comments-item-passed-time">' + alias3((helper = (helper = helpers.passedTime || (depth0 != null ? depth0.passedTime : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'passedTime',
            'hash': {},
            'data': data
        }) : helper)) + '</div></div><div class="yottie-popup-video-comments-item-text"> ' + ((stack1 = (helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'text',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + '</div> ' + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.displayLikesCount : depth0, {
            'name': 'if',
            'hash': {},
            'fn': this.program(2, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div></div> ';
    },
    '2': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return '<div class="yottie-popup-video-comments-item-likes" title="' + alias3((helper = (helper = helpers.likesTitle || (depth0 != null ? depth0.likesTitle : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'likesTitle',
            'hash': {},
            'data': data
        }) : helper)) + '"><span class="yottie-icon-likes yottie-icon"></span> <span>' + alias3((helper = (helper = helpers.likesCount || (depth0 != null ? depth0.likesCount : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'likesCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-comments"> ' + ((stack1 = helpers.each.call(depth0, depth0 != null ? depth0.comments : depth0, {
            'name': 'each',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['container'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoContent : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video"> ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoPlayer : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.content : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['content'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoInfo : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoComments : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-content"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.info : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '<div class="yottie-popup-video-content-ads" data-yt-ads-place="popup"></div> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.comments : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['info'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-popup-video-title">' + this.escapeExpression((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '</div> ';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoInfoMeta : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    '5': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoInfoMain : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-info"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.title : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.infoMeta : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.infoMain : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(5, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['info'] = views['popup']['video']['info'] || {};
views['popup']['video']['info']['main'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-popup-video-date">' + this.escapeExpression((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'date',
            'hash': {},
            'data': data
        }) : helper)) + '</div> ';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1, helper;
        return '<div class="yottie-popup-video-description' + ((stack1 = helpers.unless.call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.descriptionMoreButton : stack1, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(4, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '"> ' + ((stack1 = (helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'text',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + '</div> ';
    },
    '4': function (depth0, helpers, partials, data) {
        return ' yottie-popup-video-description-show-full';
    },
    '6': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-popup-video-description-more"><span>' + this.escapeExpression((helper = (helper = helpers.showMoreLabel || (depth0 != null ? depth0.showMoreLabel : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'showMoreLabel',
            'hash': {},
            'data': data
        }) : helper)) + '</span></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-info-main"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.date : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.description : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.descriptionMoreButton : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(6, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['info']['meta'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoChannel : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1;
        return ' ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.videoProperties : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-info-meta"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.channel : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.properties : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['video']['player'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-popup-video-player"><span></span></div>';
    },
    'useData': true
});
views['popup']['video']['properties'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<div class="yottie-popup-video-properties-views" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.views : stack1, depth0)) + '">' + alias1((helper = (helper = helpers.viewsCount || (depth0 != null ? depth0.viewsCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'viewsCount',
            'hash': {},
            'data': data
        }) : helper)) + '</div> ';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-properties-rating"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.likesRatio : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(4, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.ratingCounters : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(6, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div> ';
    },
    '4': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-popup-video-properties-rating-ratio"><span style="width: ' + this.escapeExpression((helper = (helper = helpers.likesRatio || (depth0 != null ? depth0.likesRatio : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'likesRatio',
            'hash': {},
            'data': data
        }) : helper)) + '%"></span></div> ';
    },
    '6': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-properties-rating-counters"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.likesCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(7, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.dislikesCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(9, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div> ';
    },
    '7': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<div class="yottie-popup-video-properties-rating-counters-like" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.likes : stack1, depth0)) + '"><span class="yottie-icon-likes yottie-icon"></span> <span>' + alias1((helper = (helper = helpers.likesCount || (depth0 != null ? depth0.likesCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'likesCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></div> ';
    },
    '9': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<div class="yottie-popup-video-properties-rating-counters-dislike" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.dislikes : stack1, depth0)) + '"><span class="yottie-icon-dislikes yottie-icon"></span> <span>' + alias1((helper = (helper = helpers.dislikesCount || (depth0 != null ? depth0.dislikesCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'dislikesCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></div> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-video-properties"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.viewsCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.rating : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['popup']['wrapper'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-popup-wrapper"> ' + ((stack1 = this.lambda((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.inner : stack1, depth0)) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['video'] = views['video'] || {};
views['video']['container'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var stack1, alias1 = this.lambda;
        return ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.overlay : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias1((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.info : stack1, depth0)) != null ? stack1 : '') + ' ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression, alias4 = this.lambda;
        return '<div class="yottie-widget-video yottie-widget-video-' + alias3((helper = (helper = helpers.layout || (depth0 != null ? depth0.layout : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'layout',
            'hash': {},
            'data': data
        }) : helper)) + '" data-yt-id="' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + '"> ' + ((stack1 = alias4((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.player : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = alias4((stack1 = depth0 != null ? depth0.parts : depth0) != null ? stack1.preview : stack1, depth0)) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.info : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['video']['info'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return ' <a href="https://www.youtube.com/watch?v=' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + '" title="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" class="yottie-widget-video-info-title">' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '</a> ';
    },
    '3': function (depth0, helpers, partials, data) {
        var helper;
        return '<div class="yottie-widget-video-info-passed-time">' + this.escapeExpression((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'date',
            'hash': {},
            'data': data
        }) : helper)) + '</div> ';
    },
    '5': function (depth0, helpers, partials, data) {
        var stack1, helper;
        return '<div class="yottie-widget-video-info-caption"> ' + ((stack1 = (helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'description',
            'hash': {},
            'data': data
        }) : helper)) != null ? stack1 : '') + '</div> ';
    },
    '7': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-widget-video-info-properties"><div class="yottie-widget-video-info-properties-inner"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.viewsCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(8, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.likesCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(10, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.commentsCounter : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(12, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div></div> ';
    },
    '8': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-video-info-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.views : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-views"></span> <span>' + alias1((helper = (helper = helpers.viewsCount || (depth0 != null ? depth0.viewsCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'viewsCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    '10': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-video-info-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.likes : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-likes"></span> <span>' + alias1((helper = (helper = helpers.likesCount || (depth0 != null ? depth0.likesCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'likesCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    '12': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = this.escapeExpression;
        return '<span class="yottie-widget-video-info-properties-item" title="' + alias1(this.lambda((stack1 = depth0 != null ? depth0.titles : depth0) != null ? stack1.comments : stack1, depth0)) + '"><span class="yottie-icon yottie-icon-comments"></span> <span>' + alias1((helper = (helper = helpers.commentsCount || (depth0 != null ? depth0.commentsCount : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'commentsCount',
            'hash': {},
            'data': data
        }) : helper)) + '</span></span> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return '<div class="yottie-widget-video-info"> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.title : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.date : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.description : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(5, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.properties : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(7, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</div>';
    },
    'useData': true
});
views['video']['overlay'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-video-overlay"></div>';
    },
    'useData': true
});
views['video']['player'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        return '<span class="yottie-widget-video-player"><span></span></span> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1;
        return (stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.videoPlayer : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '';
    },
    'useData': true
});
views['video']['preview'] = Handlebars.template({
    '1': function (depth0, helpers, partials, data) {
        var helper;
        return 'data-maxres-src="' + this.escapeExpression((helper = (helper = helpers.maxresThumbnail || (depth0 != null ? depth0.maxresThumbnail : depth0)) != null ? helper : helpers.helperMissing, typeof helper === 'function' ? helper.call(depth0, {
            'name': 'maxresThumbnail',
            'hash': {},
            'data': data
        }) : helper)) + '"';
    },
    '3': function (depth0, helpers, partials, data) {
        var stack1;
        return ' <span class="yottie-widget-video-preview-marker yottie-widget-video-preview-marker-duration">' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.h : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(4, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.m : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(6, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ((stack1 = helpers.unless.call(depth0, (stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.m : stack1, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(8, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.s : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(10, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ((stack1 = helpers.unless.call(depth0, (stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.s : stack1, {
            'name': 'unless',
            'hash': {},
            'fn': this.program(12, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</span> ';
    },
    '4': function (depth0, helpers, partials, data) {
        var stack1;
        return this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.h : stack1, depth0)) + ':';
    },
    '6': function (depth0, helpers, partials, data) {
        var stack1;
        return this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.m : stack1, depth0)) + ':';
    },
    '8': function (depth0, helpers, partials, data) {
        return '00:';
    },
    '10': function (depth0, helpers, partials, data) {
        var stack1;
        return this.escapeExpression(this.lambda((stack1 = depth0 != null ? depth0.duration : depth0) != null ? stack1.s : stack1, depth0));
    },
    '12': function (depth0, helpers, partials, data) {
        return '00';
    },
    '14': function (depth0, helpers, partials, data) {
        return '<span class="yottie-widget-video-preview-play"></span> ';
    },
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        var stack1, helper, alias1 = helpers.helperMissing, alias2 = 'function', alias3 = this.escapeExpression;
        return ' <a href="https://www.youtube.com/watch?v=' + alias3((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'id',
            'hash': {},
            'data': data
        }) : helper)) + '" title="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '" target="_blank" class="yottie-widget-video-preview"><span class="yottie-widget-video-preview-thumbnail"><img alt="' + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'title',
            'hash': {},
            'data': data
        }) : helper)) + '" data-src="' + alias3((helper = (helper = helpers.thumbnail || (depth0 != null ? depth0.thumbnail : depth0)) != null ? helper : alias1, typeof helper === alias2 ? helper.call(depth0, {
            'name': 'thumbnail',
            'hash': {},
            'data': data
        }) : helper)) + '" ' + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.maxresThumbnail : depth0, {
            'name': 'if',
            'hash': {},
            'fn': this.program(1, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '/></span> ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.duration : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(3, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + ' ' + ((stack1 = helpers['if'].call(depth0, (stack1 = depth0 != null ? depth0.displaying : depth0) != null ? stack1.playIcon : stack1, {
            'name': 'if',
            'hash': {},
            'fn': this.program(14, data, 0),
            'inverse': this.noop,
            'data': data
        })) != null ? stack1 : '') + '</a>';
    },
    'useData': true
});
views['widget'] = Handlebars.template({
    'compiler': [
        6,
        '>= 2.0.0-beta.1'
    ],
    'main': function (depth0, helpers, partials, data) {
        return '<div class="yottie-widget-inner"><yottie data-part="header"></yottie><div class="yottie-widget-contents"><yottie data-part="groups"></yottie><yottie data-part="feed"></yottie></div></div>';
    },
    'useData': true
});
module.exports = views;
},{}],40:[function(require,module,exports){
"use strict";
var $ = require('./../../olivie/src/js/jquery'), Olivie = require('./../../olivie/src/js/olivie');
module.exports = Olivie.class('YottieFacade', [], function (app) {
    var self = this;
    self.app = app;
}, {}, { app: null });
},{"./../../olivie/src/js/jquery":5,"./../../olivie/src/js/olivie":11}],41:[function(require,module,exports){
"use strict";
var $ = require('./../../olivie/src/js/jquery'), Olivie = require('./../../olivie/src/js/olivie'), Client = require('./../../olivie/src/js/modules/mies/client'), I18n = require('./../../olivie/src/js/modules/appearance/i18n'), Renderer = require('./../../olivie/src/js/modules/appearance/renderer'), Colorizer = require('./../../olivie/src/js/modules/appearance/colorizer'), YTError = require('./modules/widget/yt-error'), YouTube = require('./modules/youtube/youtube'), Widget = require('./modules/widget/widget'), Header = require('./modules/widget/header'), Groups = require('./modules/widget/groups'), Feed = require('./modules/widget/feed'), Ads = require('./modules/widget/ads'), Popup = require('./modules/popup/popup'), dictionary = require('./dictionary'), views = require('./views'), schemes = require('./schemes'), defaults = require('./defaults');
module.exports = Olivie.application('Yottie', function (id, element, options) {
    var self = this;
    self.getParent('Application').call(self);
    self.id = id;
    self.$element = $(element);
    self.options = $.extend(true, {}, defaults, options);
    var key;
    var keys = self.options.key;
    if (!$.isArray(keys)) {
        key = keys;
    } else {
        key = keys[Math.floor(Math.random() * keys.length)];
    }
    self.registerComponent(new Client('https://www.googleapis.com/youtube/v3', { key: key }, 'Yottie', self.options.cacheTime));
    self.registerComponent(new I18n(dictionary, self.options.lang));
    self.registerComponent(new Renderer(views));
    self.registerComponent(new Colorizer(schemes, self.options.color.scheme, self.options.color, 'colorizer'));
    self.registerComponent(new YTError());
    self.registerComponent(new YouTube());
    self.registerComponent(new Ads(self.options.ads));
    self.registerComponent(new Widget());
    self.registerComponent(new Header());
    self.registerComponent(new Popup());
    self.registerComponent(new Feed());
    self.registerComponent(new Groups());
}, { VERSION: '2.3.1 Volta' }, {
    id: null,
    $element: null,
    options: null,
    run: function () {
        var self = this;
        self.$element.addClass('yottie yottie-widget');
        self.component('error').run();
        if ($.type(self.options.sourceGroups) === 'string' && self.options.sourceGroups.length) {
            try {
                self.options.sourceGroups = $.parseJSON(decodeURIComponent(self.options.sourceGroups));
            } catch (e) {
                self.options.sourceGroups = null;
            }
        }
        if ($.type(self.options.content.responsive) === 'string' && self.options.content.responsive.length) {
            try {
                self.options.content.responsive = $.parseJSON(decodeURIComponent(self.options.content.responsive));
            } catch (e) {
                self.options.content.responsive = null;
            }
        }
        self.component('colorizer').run();
        self.component('ads').run();
        self.component('client').run().done(function () {
            self.component('header').run().on('ready', function (e, header) {
                var sourceGroups;
                if (self.options.sourceGroups) {
                    sourceGroups = self.options.sourceGroups;
                } else if (self.options.channel) {
                    sourceGroups = [{
                            title: self.component('i18n').t('Uploads'),
                            sources: [{
                                    kind: 'youtube#playlist',
                                    criteria: { id: header.channel.contentDetails.relatedPlaylists.uploads }
                                }]
                        }];
                } else {
                    self.component('error').throw('Channel and sourceGroups are not specified.');
                    return;
                }
                self.component('groups').run(sourceGroups);
                self.component('feed').run(sourceGroups);
                self.component('widget').run();
                self.component('popup').run();
                self.component('feed').setActiveSection(0);
            });
        });
    },
    getId: function () {
        var self = this;
        return self.id;
    }
});
},{"./../../olivie/src/js/jquery":5,"./../../olivie/src/js/modules/appearance/colorizer":6,"./../../olivie/src/js/modules/appearance/i18n":7,"./../../olivie/src/js/modules/appearance/renderer":8,"./../../olivie/src/js/modules/mies/client":10,"./../../olivie/src/js/olivie":11,"./defaults":13,"./dictionary":14,"./modules/popup/popup":16,"./modules/widget/ads":17,"./modules/widget/feed":19,"./modules/widget/groups":21,"./modules/widget/header":22,"./modules/widget/widget":23,"./modules/widget/yt-error":24,"./modules/youtube/youtube":37,"./schemes":38,"./views":39}]},{},[15])