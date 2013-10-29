define(
[
    "underscore"
],
function(_)
{

    var utilsKeyPrefix = "localStorageUtils_";

    function keyIsPrefixed(key)
    {
        return key.indexOf(utilsKeyPrefix) === 0 ? true : false;
    }

    function prefixKey(key)
    {
        if(!keyIsPrefixed(key))
        {
            return utilsKeyPrefix + key;
        }
        else
        {
            return key;
        }
    }

    return {

        setItem: function(key, value)
        {
            key = prefixKey(key);
            if(!_.isString(value))
            {
                value = JSON.stringify(value);
            }

            try
            {
                return localStorage.setItem(key, value);
            } catch (err)
            {
                if(err.code === 22 || err.name === "QuotaExceededError")
                {
                    this.clearStorage();
                    return localStorage.setItem(key, value);
                }
                else
                {
                    throw err;
                }
            }
        },

        getItem: function(key)
        {
            key = prefixKey(key);
            var item = localStorage.getItem(key);
            if(_.isString(item))
            {
                try {
                    item = JSON.parse(item);
                }
                catch (e) {
                    // maybe item was a raw string, not json object
                }
            }
            return item;
        },

        removeItem: function(key)
        {
            key = prefixKey(key);
            return localStorage.removeItem(key);
        },

        clearStorage: function()
        {
            _.each(_.keys(localStorage), function(key)
            {
                if(keyIsPrefixed(key))
                {
                    localStorage.removeItem(key);
                }
            });
        }
    };

});