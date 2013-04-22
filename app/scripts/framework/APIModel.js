/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "underscore",
    "backbone",
    "backbone.deepmodel"
],
function(_, Backbone)
{

    return Backbone.DeepModel.extend(
    {
        webAPIModelName: null,
        idAttribute: null,

        get: function(key)
        {
            this.validateKeyExistsInDefaults(key);
            return Backbone.DeepModel.prototype.get.call(this, key);
        },

        validate: function(attrs, options)
        {
            this.validateWebAPIModelName();
            this.validateIdAttribute(attrs);
            this.validateAgainstDefaultValues(attrs);
        },

        validateIdAttribute: function (attrs)
        {
            if (!this.idAttribute)
            {
                throw this.webAPIModelName + ": TP Web API Models must have an idAttribute";
            }

            var defaults = _.result(this, 'defaults');

            if (!defaults.hasOwnProperty(this.idAttribute))
            {
                throw this.webAPIModelName + ": TP Web API Model - idAttribute " + this.idAttribute + " is not included in the defaults list";
            }

            if (!attrs.hasOwnProperty(this.idAttribute))
            {
                throw this.webAPIModelName + ": idAttribute (" + this.idAttribute + ") required, but is '" + attrs[this.idAttribute] + "'";
            }
        },

        validateWebAPIModelName: function ()
        {
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

        validateKeyExistsInDefaults: function (key)
        {
            if (!this.defaults)
            {
                throw this.webAPIModelName + ": TP Web API Models must have default values (this.defaults) defined";
            }

            var defaults = _.result(this, 'defaults');

            var separatorIndex = key.indexOf(".");
            if (separatorIndex !== -1)
                key = key.substring(0, separatorIndex);

            var arrayIndex = key.indexOf("[");
            if (arrayIndex !== -1)
                key = key.substring(0, arrayIndex);

            if (!defaults.hasOwnProperty(key))
            {
                throw this.webAPIModelName + ": Cannot access key '" + key + "' because it is not in model defaults";
            }
        }

    });

});