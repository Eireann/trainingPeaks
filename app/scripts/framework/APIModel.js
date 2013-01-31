/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "backbone"
],
function(Backbone)
{

    return Backbone.Model.extend({

        webAPIModelName: null,

        get: function(key)
        {
            this.validateKeyExistsInDefaults(key);
            return this.attributes[key];
        },

        validate: function(attrs, options)
        {
            this.validateWebAPIModelName();
            this.validateAgainstDefaultValues(attrs);
        },

        validateWebAPIModelName: function() {
            if (!this.webAPIModelName)
            {
                throw "TP Web API Models must have a webAPIModelName attribute";
            }
        },

        validateAgainstDefaultValues: function(attrs)
        {
            for (var key in attrs)
            {
                this.validateKeyExistsInDefaults(key);
            }
        },

        validateKeyExistsInDefaults: function(key) {
            if (!this.defaults)
            {
                throw "TP Web API Models must have default values (this.defaults) defined";
            }

            if (!this.defaults.hasOwnProperty(key))
            {
                throw "Cannot access key '" + key + "' because it is not in model defaults";
            }
        }

    });

});