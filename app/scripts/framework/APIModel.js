define(
[
    "jquery",
    "underscore",
    "backbone",
    "backbone.deepmodel",
    "moment",
    "framework/utilities"
],
function($, _, Backbone, DeepModel, moment, utils)
{

    var SharedBase =
    {
        getState: function()
        {
            if(this._$state)
            {
                return this._$state;
            }

            this._$state = new Backbone.Model();

            // Proxy events from state model to parent with "state:" prefix
            var self = this;
            this.listenTo(this._$state, "all", function()
            {
                var args = [].slice.call(arguments);

                args[0] = "state:" + args[0];

                // pass self, not self._$state
                for(var i = 1; i<=args.length; i++)
                {
                    if(args[i] === self._$state)
                    {
                        args[i] = self;
                    }
                } 

                self.trigger.apply(self, args);
            });

            return this._$state;
        },

        initialize: function(attrs, options)
        {
            this.options = options;
        },
        
        _getUser: function()
        {
            return this.options && this.options.user ? this.options.user : theMarsApp.user;
        },

        _getApiRoot: function()
        {
            return this.options && this.options.apiRoot ? this.options.apiRoot : theMarsApp.apiRoot;
        }
    };

    var BaseModel = {

        myBackboneModelPrototype: Backbone.Model.prototype,

        save: function(key, val, options) {
            var deferred = Backbone.Model.prototype.save.call(this, key, val, options);
            var model = this;
            deferred.always(function()
            {
                theMarsApp.trigger("save:model", this);
            });
            return deferred;
        },

        destroy: function(options) {
            var deferred = Backbone.Model.prototype.destroy.call(this, options);
            var model = this;

            // if the model is new, destroy just returns false, and we don't need to trigger anything because we haven't changed any existing data
            if(deferred && _.isFunction(deferred.always))
            {
                deferred.always(function()
                {
                    theMarsApp.trigger("destroy:model", this);
                });
            }

            return deferred;
        },

        getFetchPromise: function(refresh)
        {
            if(!this.promise || refresh)
            {
                if(this.id)
                {
                    this.promise = this.fetch();
                } else
                {
                    this.promise = new $.Deferred();
                }
            }
            return this.promise;
        }

    };

    var APIModel = _.extend({}, BaseModel, { 

        myBackboneModelPrototype: Backbone.Model.prototype,

        checkpoint: function()
        {
            this.checkpointAttributes = utils.deepClone(this.attributes);
        },
        
        revert: function()
        {
            if (this.checkpointAttributes && !_.isEmpty(this.checkpointAttributes) && !_.isEqual(this.attributes, this.checkpointAttributes))
            {
                this.set(this.checkpointAttributes);
                this.save();
            }
        },

        getFetchPromise: function(refresh)
        {
            if(!this.promise || refresh)
            {
                if (this.get(this.idAttribute))
                {
                    this.promise = this.fetch();
                } else
                {
                    this.promise = new $.Deferred();
                }
            }
            return this.promise;
        },

        has: function(attr)
        {
            return this.get(attr) != null;
        }
    });

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
                    throw new Error("Do not use moments as model attributes, due to performance issues");
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
                throw new Error(this.webAPIModelName + ": TP Web API Models must have an idAttribute");
            }

            var defaults = _.result(this, 'defaults');

            if (!defaults.hasOwnProperty(this.idAttribute))
            {
                throw new Error(this.webAPIModelName + ": TP Web API Model - idAttribute " + this.idAttribute + " is not included in the defaults list");
            }

            if (!attrs.hasOwnProperty(this.idAttribute))
            {
                throw new Error(this.webAPIModelName + ": idAttribute (" + this.idAttribute + ") required, but is '" + attrs[this.idAttribute] + "'");
            }
        },

        validateWebAPIModelName: function ()
        {
            if (!this.webAPIModelName)
            {
                throw new Error("TP Web API Models must have a webAPIModelName attribute");
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
                throw new Error(this.webAPIModelName + ": TP Web API Models must have default values (this.defaults) defined");
            }

            if(key.indexOf("state$") === 0)
            {
                return;
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
                throw new Error(this.webAPIModelName + ": Cannot access key '" + key + "' because it is not in model defaults");
            }
        },

        validateAgainstMoments: function(attrs)
        {
            for (var key in attrs)
            {
                if (moment.isMoment(attrs[key]))
                {
                    throw new Error(this.webAPIModelName + ": Do not use moments as model attributes, due to performance issues");
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
        BaseModel: Backbone.Model.extend(_.extend({}, SharedBase, BaseModel)),
        DeepModel: Backbone.DeepModel.extend(_.extend({}, SharedBase, BaseModel, { myBackboneModelPrototype: Backbone.DeepModel.prototype })),
        APIBaseModel: Backbone.Model.extend(_.extend({}, SharedBase, APIModel)),
        APIDeepModel: Backbone.DeepModel.extend(_.extend({}, SharedBase, APIModel, { myBackboneModelPrototype: Backbone.DeepModel.prototype }))
    };
});
