define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/heartRateZonesView",
    "shared/views/userSettings/powerZonesView",
    "shared/views/userSettings/speedPaceZonesView",
    "shared/views/userSettings/zonesNotificationsView",
    "hbs!shared/templates/userSettings/userSettingsZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    HeartRateZonesView,
    PowerZonesView,
    SpeedPaceZonesView,
    ZonesNotificationsView,
    userSettingsZonesTemplate
)
{

    var UserSettingsZonesView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: userSettingsZonesTemplate
        },

        modelEvents: {},

        events:
        {
            "click .addWorkoutType": "_addWorkoutType"
        },

        initialize: function()
        {
            var self = this;

            this.children = new Backbone.ChildViewContainer();
            this.on("close", function() { self.children.call("close"); });

            this.heartRateZonesCollection = this._createCollection(this.model.get("heartRateZones"));
            this.powerZonesCollection = this._createCollection(this.model.get("powerZones"));
            this.speedPaceZonesCollection = this._createCollection(this.model.get("speedZones"));
        },

        render: function()
        {
            UserSettingsZonesView.__super__.render.apply(this, arguments);

            this._addView(".heartRateZones", new TP.CollectionView({
                itemView: HeartRateZonesView,
                collection: this.heartRateZonesCollection
            }));

            this._addView(".powerZones", new TP.CollectionView({
                itemView: PowerZonesView,
                collection: this.powerZonesCollection
            }));

            this._addView(".speedPaceZones", new TP.CollectionView({
                itemView: SpeedPaceZonesView,
                collection: this.speedPaceZonesCollection
            }));

            this._addView(".zonesNotifications", new ZonesNotificationsView({
                model: this.model
            }));
        },

        onShow: function()
        {
            this._updateSelects();
        },

        subNavigation:
        [
            {
                title: "Heart Rate",
                target: "[data-subnav='heartrate']"
            },
            {
                title: "Power",
                target: "[data-subnav='power']"
            },
            {
                title: "Speed/Pace",
                target: "[data-subnav='speedPace']"
            },
            {
                title: "Notifications",
                target: "[data-subnav='notifications']"
            }
        ],

        applyFormValuesToModels: function()
        {
            this.children.each(function(child)
            {
                if(child.children)
                {
                    child.children.call("applyFormValuesToModels");
                }
                else
                {
                    child.applyFormValuesToModels();
                }
            });

            this.model.set("heartRateZones", this.heartRateZonesCollection.toJSON());
            this.model.set("powerZones", this.powerZonesCollection.toJSON());
            this.model.set("speedZones", this.speedPaceZonesCollection.toJSON());
        },

        _addView: function(selector, view)
        {
            this.children.add(view);
            this.$(selector).append(view.el);
            view.render();
        },

        _createCollection: function(items)
        {
            var collection =  new TP.Collection(items,
            {
                comparator: "workoutTypeId"
            });

            this.listenTo(collection, "add remove reset", _.bind(this._updateSelects, this));

            return collection;
        },

        _updateSelects: function()
        {
            var self = this;

            this.$("select[data-zone-type]").each(function(i, el)
            {
                var $el = $(el);
                var type = $el.data("zone-type");
                var collection = self._getCollection(type);

                var workoutTypeIds = _.values(TP.utils.workout.types.typesByName);
                var usedWorkoutTypeIds = collection.pluck("workoutTypeId");

                workoutTypeIds = _.difference(workoutTypeIds, usedWorkoutTypeIds);


                $el.empty();

                _.each(workoutTypeIds, function(workoutTypeId)
                {
                    $("<option/>")
                    .attr({ value: workoutTypeId })
                    .text(TP.utils.workout.types.getNameById(workoutTypeId))
                    .appendTo($el);
                });

                var visible = workoutTypeIds.length > 0;
                $el.toggle(visible);
                self.$(".addWorkoutType[data-zone-type='" + type + "']").toggle(visible);
                if($el.data("selectBox-selectBoxIt"))
                {
                    $el.selectBoxIt("destroy");
                    $el.hide();
                }
                if(visible)
                {
                    $el.show();
                    $el.selectBoxIt();
                }
            });
        },

        _addWorkoutType: function(e)
        {
            var type = $(e.target).data("zone-type");
            var workoutType = parseInt(this.$("select[data-zone-type='" + type + "']").val(), 10);
            this._getCollection(type).add({ workoutTypeId: workoutType });
        },

        _getCollection: function(type)
        {
            var collection;

            switch(type)
            {
                case "heartRate": 
                    collection = this.heartRateZonesCollection;
                    break;
                case "power":
                    collection = this.powerZonesCollection;
                    break;
                case "speedPace":
                    collection = this.speedPaceZonesCollection;
                    break;
                default:
                    throw new Error("Unknown zone type: " + type);
            }

            return collection;
        }

    });

    return UserSettingsZonesView;

});
