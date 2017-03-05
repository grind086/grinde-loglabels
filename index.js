(function (root, factory) {
    // Universal module definition (AMD + commonJS + browser global)
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
    
    /**
     * @class LogLabel(options)
     * 
     * @param Object [options]
     * @param Array[String] [options.prefixes=["$level"]] - An array of strings 
     *      to use as prefixes for this log.
     * @param String [options.separater="]["] - A string to use as a separator 
     *      between prefixes.
     * @param String [options.format="[%p]"] - A string to use as the prefix 
     *      format. %p is replaced with the prefix string.
     * @param Number [options.level=log.levels.trace] - The log level to use
     *      for this log.
     */
     
    var LogLabel = function(options) {
        if (!options) options = {};
        
        /**
         * @member prefixes
         * @type Array[String]
         */
         
        this.prefixes  = options.prefixes  || ['$level'];
        
        /**
         * @member separator
         * @type String
         */
         
        this.separator = options.separator || '][';
        
        /**
         * @member format
         * @type String
         */
         
        this.format    = options.format    || '[%p]';
        
        /**
         * @member _level
         * @private
         * @type Number
         * @desc The current logging level.
         */
         
        this._level = null;
        
        this.setLevel(options.level || this.levels.trace);
    };
    
    /**
     * @member consoleFunctions
     * @type Object
     * @desc An object containing the console logging functions. These can
     *      be replaced with other functions, and the log methods can then
     *      be refreshed using LogLabel.setLevel
     */
     
    LogLabel.prototype.consoleFunctions = {
        trace : console.trace,
        info  : console.info,
        log   : console.log,
        warn  : console.warn,
        error : console.error
    };
    
    /**
     * @member levels
     * @type Object
     * @desc The levels assigned to the different logging functions. Higher means
     *      more priority.
     */
     
    LogLabel.prototype.levels = {
        trace : 0,
        info  : 1,
        log   : 2,
        warn  : 3,
        error : 4
    };
    
    /**
     * @method noop
     * @desc A simple no op
     */
    
    LogLabel.prototype.noop = function() {};
    
    /**
     * @method setLevel
     * @desc Rebuilds the logging functions using the given level (call
     *      log.setLevel(log.getLevel()) to refresh the methods).
     * @param Number level
     */
     
    LogLabel.prototype.setLevel = function(level) {
        this._level = level;
        
        var self = this,
            fns = self.consoleFunctions,
            levels = self.levels;
        
        if (self.prefixes.length) {
            Object.keys(fns).forEach(function(method) {
                // If the method is below the current log level, redirect it
                // to a no op.
                if (levels[method] < level) return self[method] = self.noop;
                
                // Otherwise build the prefix string
                var prefix = self.format.replace('%p', 
                    self.prefixes.reduce(function(prestr, nextpre) {
                        if (nextpre == '$level') {
                            nextpre = method.toUpperCase();
                        }
                        
                        return prestr + self.separator + nextpre;
                    }, '').slice(self.separator.length)
                );
            
                // And bind it to the console method
                self[method] = fns[method].bind(console, prefix);
            });
        } else {
            // If there are no prefixes, just redirect all methods directly to
            // their console methods or noop
            Object.keys(fns).forEach(function(method) {
                self[method] = (levels[method] < level)
                    ? self.noop
                    : fns[method];
            });
        }
    };
    
    /**
     * @method getLevel
     * @desc Returns the current logging level
     */
    
    LogLabel.prototype.getLevel = function() {
        return this._level;
    };
    
    /**
     * @method get
     * @desc Gets or creates the logger with the given name.
     * @param String name
     * @param Object options - Uses the same options as the constructor, with
     *      the addition of options.inheritPrefixes.
     * @param Boolean [options.inheritPrefixes=true] - Whether or not to 
     *      inherit prefixes from the parent log.
     */
     
    LogLabel.prototype.get = function(name, options) {
        // Check if we already made the log
        if (logs.hasOwnProperty(name)) return logs[name];
        
        // Otherwise create it, inheriting options that aren't set
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