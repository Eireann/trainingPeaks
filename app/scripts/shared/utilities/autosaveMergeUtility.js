define(
[
    "underscore"
],
function(
    _
)
{

    var AutosaveMergeUtility =
    {
        join: function join(base, local, server)
        {
            // Get IDs
            var ids = [].concat(_.pluck(base, "id"), _.pluck(local, "id"), _.pluck(server, "id"));
            ids = _.uniq(ids);

            var merged = AutosaveMergeUtility.merge(_.indexBy(base, "id"), _.indexBy(local, "id"), _.indexBy(server, "id"), ids);

            ids = _.filter(ids, function(id) { return id in merged; });
            return _.map(ids, function(id) { return merged[id]; });
        },

        merge: function merge(base, local, server, keys)
        {
            base = base || {};
            local = local || {};
            server = server || {};
            keys = keys || _.keys(server);

            var object = {};

            _.each(keys, function(key)
            {
                var baseValue = base[key];
                var localValue = local[key];
                var serverValue = server[key];
                var resultValue;

                if(typeof(baseValue) !== typeof(localValue))
                {
                    resultValue = localValue;
                }
                else if(typeof(baseValue) !== typeof(serverValue))
                {
                    resultValue = serverValue;
                }
                else if(_.isArray(baseValue))
                {
                    resultValue = AutosaveMergeUtility.join(baseValue, localValue, serverValue);
                }
                else if(_.isObject(baseValue))
                {
                    resultValue = AutosaveMergeUtility.merge(baseValue, localValue, serverValue);
                }
                else
                {
                    if(baseValue !== localValue)
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
        }
    };

    return AutosaveMergeUtility;

});
