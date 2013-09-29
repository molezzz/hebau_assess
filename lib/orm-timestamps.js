function Plugin(db, opts) {
	var options = {
		createdProperty: 'created_at',
		modifiedProperty: 'modified_at',
		dbtype: { type: 'date', time: true },
		now: function() { return new Date(); }
	};


	function extend(original, update) {
		if(typeof update == 'undefined') return original;

		var union = {};
		for(var k in original) {
			union[k] = typeof(update[k]) != 'undefined' ? update[k]  : original[k];
		}

		return union;
	}

	function wrapHook(hooks, hookName, postLogic) {
		if(typeof hooks[hookName] == 'function') {
			var oldHook = hooks[hookName];
			hooks[hookName] = function(next) {
				postLogic.call(this);
				oldHook.call(this, next);
			};
		} else {
			hooks[hookName] = postLogic;
		}
	}

	function monitor(name, properties, opts) {
		//console.log([name, properties, opts]);
		if(opts.timestamp !== true) return;

		if(options.createdProperty !== false)
			properties[options.createdProperty] = options.dbtype;
		if(options.modifiedProperty !== false)
			properties[options.modifiedProperty] = options.dbtype;

		opts.hooks = opts.hooks || {};

		if(options.createdProperty !== false)
			wrapHook(opts.hooks, 'beforeCreate', function() {
				this[options.createdProperty] = options.now();
			});

		if(options.modifiedProperty !== false)
			wrapHook(opts.hooks, 'beforeSave', function() {
				this[options.modifiedProperty] = options.now();
				//console.log(['beforeSave', this, this[options.modifiedProperty], options.modifiedProperty]);
			});
	};


	options = extend(options, opts);

	return {
		beforeDefine: monitor
	}
};

module.exports = Plugin;