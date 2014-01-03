define(
[
    "jquery",
    "underscore",
    "backbone",
    "TP",
    "shared/data/equipmentTypes",
    "framework/filteredSubCollection",
    "models/equipmentModel",
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
    EquipmentModel,
    EquipmentItemView,
    userSettingsEquipmentTemplate
)
{

    var UserSettingsEquipmentView = TP.CompositeView.extend({
        tagName: "div",
        className: "userSettingsContent userSettingsEquipmentTemplate userSettingsAccountContent",

        template:{
            type: "handlebars",
            template: userSettingsEquipmentTemplate
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

        itemView: EquipmentItemView,

        events:
        {
            "click .addEquipment": "_addEquipment"
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var bikeList = this.$(".bikeList");
            var shoeList = this.$(".shoeList");

            switch (itemView.model.get("type"))
            {
                case EquipmentTypes.Bike:
                    bikeList.append(itemView.el);
                    break;

                case EquipmentTypes.Shoe:
                    shoeList.append(itemView.el);
                    break;
            }
        },

        initialize: function(options)
        {
            this.user = options && options.user ? options.user : theMarsApp.user;

            this.collection = options.collection;
        },

        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModel");
        },

        _addEquipment: function(e)
        {
            var equipmentModel = new EquipmentModel();

            equipmentModel.set("athleteId", this.user.getCurrentAthleteId());
            equipmentModel.set("retired", false);
            equipmentModel.set("type", EquipmentTypes.convertLabelToType($(e.target).data("equipmenttype")));

            this.collection.push(equipmentModel);
        }

    });

    return UserSettingsEquipmentView;

});
