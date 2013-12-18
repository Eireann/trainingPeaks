define(
[
    "jquery",
    "underscore",
    "backbone",
    "TP",
    "shared/data/equipmentTypes",
    "framework/filteredSubCollection",
    "./equipmentItemView",
    "hbs!shared/templates/userSettings/userSettingsEquipmentTemplate"
],
function(
    $,
    _,
    Backbone,
    TP,
    EquipmentTypes,
    FilteredSubCollection,
    EquipmentItemView,
    userSettingsEquipmentTemplate
)
{
    var DelegatingView = TP.CollectionView.extend(
    {
        applyFormValuesToModel: function()
        {
            this.children.call("applyFormValuesToModel");
        }
    });

    var UserSettingsEquipmentView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: userSettingsEquipmentTemplate
        },

        initialize: function(options)
        {
            var self = this;

            this.children = new Backbone.ChildViewContainer();
            this.on("close", function() { self.children.call("close"); });

            this._createCollections(options);
        },

        subNavigation:
        [
            {
                title: "Bikes",
                target: "bikes"
            },
            {
                title: "Shoes",
                target: "shoes"
            }
        ],

        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModel");
        },

        render: function()
        {
            UserSettingsEquipmentView.__super__.render.apply(this, arguments);

            this._addView(".bikeList", new DelegatingView({
                itemView: EquipmentItemView,
                collection: this.bikeCollection
            }));
            this._addView(".shoeList", new DelegatingView({
                itemView: EquipmentItemView,
                collection: this.shoeCollection
            }));
        },

        _addView: function(selector, view)
        {
            this.children.add(view);
            this.$(selector).append(view.el);
            view.render();
        },

        _createCollections: function(options)
        {
            this.bikeCollection = new FilteredSubCollection(
                null,
                {
                    sourceCollection: options.collection,
                    filterFunction: function(model) {
                        return model.get("type") === EquipmentTypes.Bike;
                    }
                }
            );
            this.shoeCollection = new FilteredSubCollection(
                null,
                {
                    sourceCollection: options.collection,
                    filterFunction: function(model) {
                        return model.get("type") === EquipmentTypes.Shoe;
                    }
                }
            );
        }

    });

    return UserSettingsEquipmentView;
});
