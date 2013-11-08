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
            this.set("id", model.id ? model.webAPIModelName + ":" + model.id : null);
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


    ActivityModel.getActivityId = function(ModelClass, model)
    {
        // already an activity model, so already has a prefixed id
        if(model instanceof ActivityModel)
        {
            return model.id;
        }

        // make sure the model class is valid
        if(ModelClass.prototype.hasOwnProperty("webAPIModelName") && ModelClass.prototype.hasOwnProperty("idAttribute"))
        {
            var prefix = ModelClass.prototype.webAPIModelName;
            var idAttribute = ModelClass.prototype.idAttribute;

            // already a model of the right type, get the id and prefix it
            if(model instanceof ModelClass)
            {
                return prefix + ":" + model.id;
            }

            // raw attributes with the correct id property
            if(_.isObject(model) && model.hasOwnProperty(idAttribute))
            {
                return prefix + ":" + model[idAttribute];
            }
        }

        return null;
    };

    return ActivityModel;
});
