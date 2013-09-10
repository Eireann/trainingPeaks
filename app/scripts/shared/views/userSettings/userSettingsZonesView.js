define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/heartRateZonesView",
    "shared/views/userSettings/powerZonesView",
    "shared/views/userSettings/speedPaceZonesView",
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

        initialize: function()
        {
            var self = this;

            this.children = new Backbone.ChildViewContainer();
            this.on("close", function() { self.children.call("close"); });
        },

        render: function()
        {
            UserSettingsZonesView.__super__.render.apply(this, arguments);

            this.heartRateZonesCollection = new TP.Collection(this.model.get("heartRateZones"));
            this._addView(".heartRateZones", new TP.CollectionView({
                itemView: HeartRateZonesView,
                collection: this.heartRateZonesCollection
            }));

            this.powerZonesCollection = new TP.Collection(this.model.get("powerZones"));
            this._addView(".powerZones", new TP.CollectionView({
                itemView: PowerZonesView,
                collection: this.powerZonesCollection
            }));

            this.speedPaceZonesCollection = new TP.Collection(this.model.get("speedZones"));
            this._addView(".speedPaceZones", new TP.CollectionView({
                itemView: SpeedPaceZonesView,
                collection: this.speedPaceZonesCollection
            }));
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
                child.children.call("applyFormValuesToModels");
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
        }

    });

    return UserSettingsZonesView;

});
