define(
[
    "underscore",
    "backbone",
    "backbone.deepmodel",
    "moment"
],
function(_, Backbone, DeepModel, moment)
{
    var BaseModel = {

        myBackboneModelPrototype: Backbone.Model.prototype,

        createPromise: function()
        {
            var deferred;
            if(this.id)
            {
                deferred = this.fetch();
            } else
            {
                deferred = new $.Deferred();
            }

            var self = this;
            deferred.done(function(){self.trigger("promise:fetched");});

            return deferred;
        }

    };

    var APIModel = 
    {

        myBackboneModelPrototype: Backbone.Model.prototype,

        checkpoint: function()
        {
            this.checkpointAttributes = _.clone(this.attributes);
        },
        
        revert: function()
        {
            if (this.checkpointAttributes && !_.isEmpty(this.checkpointAttributes) && !_.isEqual(this.attributes, this.checkpointAttributes))
            {
                this.set(this.checkpointAttributes);
                this.save();
            }
        },

        createPromise: function()
        {
            var deferred;
            if (this.get(this.idAttribute))
            {
                deferred = this.fetch();
            } else
            {
                deferred = new $.Deferred();
            }

            var self = this;
            deferred.done(function(){self.trigger("promise:fetched");});
            return deferred;
        },

        has: function(attr)
        {
            return this.get(attr) != null;
        }
    };

    var BaseModelDevValidationExtensions =
    {

        validate: function (attrs, options)
        {
            this.validateAgainstMoments(attrs);
        },

        validateAgainstMoments: function(attrs)
        {
            for (var key in attrs)
            {
                if (moment.isMoment(attrs[key]))
                {
                    throw "Do not use moments as model attributes, due to performance issues";
                }
            }
        }
    };

    var APIModelDevValidationExtensions =
    {
        webAPIModelName: null,
        idAttribute: null,

        get: function (key)
        {
            this.validateKeyExistsInDefaults(key);
            return this.myBackboneModelPrototype.get.call(this, key);
        },

        validate: function (attrs, options)
        {
            if (options && options.disableDevValidations)
            {
                this.disableDevValidations = true;
            }

            if (this.disableDevValidations)
            {
                return;
            }

            this.validateWebAPIModelName();
            this.validateIdAttribute(attrs);
            this.validateAgainstDefaultValues(attrs);
            this.validateAgainstMoments(attrs);
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

        validateAgainstDefaultValues: function (attrs)
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
        },

        validateAgainstMoments: function(attrs)
        {
            for (var key in attrs)
            {
                if (moment.isMoment(attrs[key]))
                {
                    throw this.webAPIModelName + ": Do not use moments as model attributes, due to performance issues";
                }
            }
        }
    };

    if (typeof apiConfig !== "undefined" && apiConfig.hasOwnProperty("configuration") && (apiConfig.configuration === "local" || apiConfig.configuration === "dev"))
    {
        _.extend(BaseModel, BaseModelDevValidationExtensions);
        _.extend(APIModel, APIModelDevValidationExtensions);
    }

    return {
        BaseModel: Backbone.Model.extend(BaseModel),
        DeepModel: Backbone.DeepModel.extend(_.extend({}, BaseModel, { myBackboneModelPrototype: Backbone.DeepModel.prototype })),
        APIBaseModel: Backbone.Model.extend(APIModel),
        APIDeepModel: Backbone.DeepModel.extend(_.extend({}, APIModel, { myBackboneModelPrototype: Backbone.DeepModel.prototype }))
    };
});