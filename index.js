// Universal module definition (AMD + commonJS + browser global)
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.loglabels = factory();
  }
}(this, function () {
    'use strict';
    
    var logs = {};
    
    var LogLabel = function(options) {
        if (!options) options = {};
        
        this.prefixes  = options.prefixes  || ['$level'];
        this.separator = options.separator || '][';
        this.format    = options.format    || '[%p]';
        
        this._level = null;
        
        this.setLevel(options.level || this.levels.trace);
    };
    
    LogLabel.prototype.consoleFunctions = {
        trace : console.trace,
        info  : console.info,
        log   : console.log,
        warn  : console.warn,
        error : console.error
    };
    
    LogLabel.prototype.levels = {
        trace : 0,
        info  : 1,
        log   : 2,
        warn  : 3,
        error : 4
    };
    
    LogLabel.prototype.noop = function() {};
    
    LogLabel.prototype.setLevel = function(level) {
        this._level = level;
        
        var self = this,
            fns = self.consoleFunctions,
            levels = self.levels;
        
        if (self.prefixes.length) {
            Object.keys(fns).forEach(function(method) {
                if (levels[method] >= level) {
                    var prefix = self.format.replace('%p', 
                        self.prefixes.reduce(function(prestr, nextpre) {
                            if (nextpre == '$level') {
                                nextpre = method.toUpperCase();
                            }
                            
                            return prestr + self.separator + nextpre;
                        }, '').slice(self.separator.length)
                    );
                
                    self[method] = fns[method].bind(console, prefix);
                } else {
                    self[method] = self.noop;
                }
            });
        } else {
            Object.keys(fns).forEach(function(method) {
                self[method] = fns[method];
            });
        }
    };
    
    LogLabel.prototype.getLevel = function() {
        return this._level;
    };
    
    LogLabel.prototype.get = function(name, options) {
        if (logs.hasOwnProperty(name)) return logs[name];
        
        if (!options) options = {};
        
        var has = options.hasOwnProperty;
        
        return (logs[name] = new LogLabel({
            prefixes: (has('inheritPrefixes') && options.inheritPrefixes === false) 
                ? options.prefixes || [name]
                : this.prefixes.concat(options.prefixes || [name]),
            
            separator : has('separator') ? options.separator : this.separator,
            format    : has('format')    ? options.format    : this.format,
            level     : has('level')     ? options.level     : this.getLevel()
        }));
    };
    
    return new LogLabel();
}));