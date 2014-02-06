define(
[
    "jquery",
    "underscore",
    "backbone"
],
function(
    $,
    _,
    Backbone
)
{

    var AutosaveMergeUtility =
    {
        join: function join(base, local, server, options)
        {
            options = _.extend({ idKey: "id" }, options);

            var all = [].concat(base, local, server);
            var ids, merged;

            if(_.any(all, function(item) { return _.has(item, options.idKey); }))
            {
                // Get IDs
                ids = _.pluck(all, options.idKey);
                ids = _.uniq(ids);

                merged = AutosaveMergeUtility.merge(_.indexBy(base, options.idKey), _.indexBy(local, options.idKey), _.indexBy(server, options.idKey), _.defaults({ keys: ids }, options));
                ids = _.filter(ids, function(id) { return id in merged; });
            }
            else
            {
                var length = base.length === local.length ? server.length : local.length;
                ids = _.range(length);

                merged = AutosaveMergeUtility.merge(base, local, server, { keys: ids });
            }

            return _.map(ids, function(id) { return merged[id]; });
        },

        merge: function merge(base, local, server, options)
        {
            options = options || {};

            base = base || {};
            local = local || {};
            server = server || {};
            var keys = options.keys || _.keys(server);

            var object = {};

            _.each(keys, function(key)
            {
                var baseValue = base[key];
                var localValue = local[key];
                var serverValue = server[key];
                var resultValue;

                if(_.all([baseValue, localValue, serverValue], _.isArray))
                {
                    resultValue = AutosaveMergeUtility.join(baseValue, localValue, serverValue);
                }
                else if(_.all([baseValue, localValue, serverValue], _.isObject))
                {
                    resultValue = AutosaveMergeUtility.merge(baseValue, localValue, serverValue);
                }
                else
                {
                    if(!_.isEqual(baseValue, localValue))
                    {
                        // If the local value changed, it takes priority
                        resultValue = localValue;
                    }
                    else
                    {
                        // Otherwise use the server value
                        resultValue = serverValue;
                    }
                }

                if(resultValue !== undefined) object[key] = resultValue;
            });

            return object;
        },

        mixin:
        {
            // Place the autosave and parse methods on an object to implement.
            autosave: function(options)
            {

                if(!_.isObject(options))
                {
                    throw new Error("AutosaveMergeUtility.mixin.autosave requires an options argument");
                }

                // if the autosaved flag is true, then we have received a server response that has triggered model change events,
                // but we don't want to save again
                if(options.autosaved)
                {
                    return;
                }

                // NOTE: this refers to the model.
                var self = this;

                if(!this._autosavePromise || this._autosavePromise.state() !== "pending")
                {
                    var deferred = new $.Deferred();
                    this._autosavePromise = deferred.promise();

                    var start = function()
                    {
                        function cloneFilter(item)
                        {
                            // null out models, otherwise return undefined to use default logic
                            return item instanceof Backbone.Model ? null : undefined;
                        }
                        self._autosaveRequest = self.save(null, { diff: _.clone(self.attributes, true, cloneFilter), autosaved: true });
                        deferred.resolve(self._autosaveRequest);
                    };

                    if(!this._autosaveRequest || this._autosaveRequest.state() !== "pending")
                    {
                        start();
                    }
                    else
                    {
                        this._autosaveRequest.always(start);
                    }
                }

                return this._autosavePromise;
            },

            parse: function(data, options)
            {
                // NOTE: this refers to the model.
                if(options && options.diff)
                {
                    data = AutosaveMergeUtility.merge(options.diff, this.attributes, data, this.autosaveMergeOptions);
                }

                return data;
            }
        }
    };

    return AutosaveMergeUtility;

});
