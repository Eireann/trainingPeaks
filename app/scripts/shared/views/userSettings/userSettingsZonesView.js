define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/heartRateZonesView",
    "shared/views/userSettings/powerZonesView",
    "hbs!shared/templates/userSettings/userSettingsZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    HeartRateZonesView,
    PowerZonesView,
    userSettingsZonesTemplate
)
{

    var UserSettingsZonesView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: userSettingsZonesTemplate
        },

        initialize: function()
        {
            var self = this;

            this.children = new Backbone.ChildViewContainer();
            this.on("close", function() { self.children.call("close"); });
        },

        render: function()
        {
            UserSettingsZonesView.__super__.render.apply(this, arguments);

            this._addView(".heartRateZones", new TP.CollectionView({
                itemView: HeartRateZonesView,
                collection: new TP.Collection(this.model.getAthleteSettings().get("heartRateZones"))
            }));

            this._addView(".powerZones", new TP.CollectionView({
                itemView: PowerZonesView,
                collection: new TP.Collection(this.model.getAthleteSettings().get("powerZones"))
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
                title: "Notifications",
                target: "[data-subnav='notifications']"
            }
        ],

        _addView: function(selector, view)
        {
            this.children.add(view);
            this.$(selector).append(view.el);
            view.render();
        }

    });

    return UserSettingsZonesView;

});
