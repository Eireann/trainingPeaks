define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettings/userSettingsZonesTemplate",
    "hbs!shared/templates/userSettings/powerZonesTemplate",
    "hbs!shared/templates/userSettings/zoneEntryTemplate"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    userSettingsZonesTemplate,
    powerZonesTemplate,
    zoneEntryTemplate
)
{
    var ZoneEntryView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: zoneEntryTemplate
        },

        modelEvents: {},
        collectionEvents: {},

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneEntry']"
            });
        }

    });

    var PowerZonesView = TP.CompositeView.extend({

        template:
        {
            type: "handlebars",
            template: powerZonesTemplate
        },

        itemView: ZoneEntryView,

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']"
            });
        },

        initialize: function()
        {
            this.collection = new TP.Collection(this.model.get("zones"));
        }

    });

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

            this._addView(".powerZones", new TP.CollectionView({
                itemView: PowerZonesView,
                collection: new TP.Collection(this.model.getAthleteSettings().get("powerZones"))
            }));
        },

        subNavigation:
        [
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
