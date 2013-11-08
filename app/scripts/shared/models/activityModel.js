define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var ActivityModel = Backbone.Model.extend({

        initialize: function()
        {
            var model = this.unwrap();
            this.cid = model.cid;

            this.listenTo(model, "change:" + model.idAttribute, _.bind(this._updatePrefixedId, this));
            this.listenTo(model, "all", _.bind(this._retrigger, this));
            this._updatePrefixedId();
        },

        getCalendarDay: function()
        {
            var model = this.unwrap();
            return model.getCalendarDay();
        },

        unwrap: function()
        {
            var model =  this.get("activity");
            return model;
        },

        _updatePrefixedId: function()
        {
            var model = this.unwrap();
            this.set("id", ActivityModel.getActivityId({ model: model }));
        },

        _retrigger: function()
        {
            var args = [].slice.call(arguments);

            if(args[1] instanceof Backbone.Model) {
                args[1] = ActivityModel.wrap(args[1]);
            }

            this.trigger.apply(this, args);
        }

    });

    ActivityModel.wrap = function(model)
    {
        if (model instanceof ActivityModel)
        {
            return model;
        }

        if (model.activity)
        {
            return model.activity;
        }

        var activity = new ActivityModel({ activity: model });

        model.activity = activity;

        return activity;
    };

    ActivityModel.unwrap = function(model)
    {
        return _.isFunction(model && model.unwrap) ? model.unwrap() : model;
    };


    ActivityModel.getActivityId = function(options)
    {
        // already an activity model, so already has a prefixed id
        if(options.model && options.model instanceof ActivityModel)
        {
            return options.model.id;
        }

        // constructor and model or attributes
        if(options.klass &&
           options.model &&
           options.klass.prototype.hasOwnProperty("webAPIModelName") &&
           options.klass.prototype.hasOwnProperty("idAttribute"))
        {
            var prefix = options.klass.prototype.webAPIModelName;
            var idAttribute = options.klass.prototype.idAttribute;

            // already a model of the right type, get the id and prefix it
            if(options.model instanceof options.klass)
            {
                return prefix + ":" + options.model.id;
            }

            // attributes object with the correct id property
            if(_.isObject(options.model) && options.model.hasOwnProperty(idAttribute))
            {
                return prefix + ":" + options.model[idAttribute];
            }
        }

        // constructor and id
        if(options.klass &&
           options.id &&
           options.klass.prototype.hasOwnProperty("webAPIModelName"))
        {
            return options.klass.prototype.webAPIModelName + ":" + options.id;
        }
       
        // api model
        if(options.model && options.model.webAPIModelName && options.model.id)
        {
            return options.model.webAPIModelName + ":" + options.model.id;
        } 

        // not enough info to build an id
        return null;
    };

    return ActivityModel;
});
