define(
[
    "jquery",
    "underscore",
    "setImmediate",
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
    setImmediate,
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

        itemViewOptions: function()
        {
            return { parentView: this };
        },

        events:
        {
            "click .addEquipment": "_addEquipment"
        },

        collectionEvents:
        {
            "change:retired": "_sortAndRender",
            "change:isDefault": "_handleDefaultEquipmentChange"
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
        },

        _handleDefaultEquipmentChange: function(model)
        {
            // if model default was turned off, nothing else to be done
            if(!model.get("isDefault"))
            {
                return;
            }


            // else set other models of this type to not default
            _.chain(this.collection.where({ type: model.get("type") }))
                .reject({id: model.id })
                .each(function(model)
                {
                    model.set("isDefault", false);
                });

        },

        _sortAndRender: function()
        {
            // calling this as a setImmediate to avoid modifying or removing child views during applyFormValuesToModels 
            setImmediate(_.bind(function()
            {
                this.collection.sort();
                this.closeChildren();
                this.showCollection();            
            }, this));
        }

    });

    return UserSettingsEquipmentView;

});
