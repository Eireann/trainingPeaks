define(
[
    "underscore",
    "backbone",
    "TP"
],
function(
    _,
    Backbone,
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
            this.set("id", ActivityModel.getActivityId(model));
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

        // As a special case a model may be passed in instead of options
        if(options instanceof Backbone.Model)
        {
            var model = options;
            if(model instanceof ActivityModel)
            {
                return model.id;
            }
            else
            {
                return model.id ? model.webAPIModelName + ":" + model.id : null;
            }
        }

        options = _.clone(options);

        // Derive id from attributes and klass, if needed
        if(!options.id && options.attributes && options.klass)
        {
            options.id = options.attributes[options.klass.prototype.idAttribute || "id"];
        }

        // Derive prefix from klass, if needed
        if(!options.prefix && options.klass)
        {
            options.prefix = options.klass.prototype.webAPIModelName;
        }

        // Create composite key
        if(options.prefix && options.id)
        {
            return options.prefix + ":" + options.id;
        }
        else
        {
           return null;
        }

    };

    return ActivityModel;
});
