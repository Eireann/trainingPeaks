define(
[
    "underscore",
    "TP",
    "shared/data/equipmentTypes",
    "shared/utilities/formUtility",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/workout/workoutEquipmentView"
],
function (
    _,
    TP,
    EquipmentTypes,
    FormUtility,
    WorkoutTypes,
    equipmentView
)
{
    return TP.ItemView.extend(
    {
        className: "workoutEquipment",

        events:
        {
            "change select": "_applyFormValuesToModel"
        },

        modelEvents:
        {
            "change:workoutTypeValueId": "_adjustSelectors",
            "change:equipmentBikeId": "_applyModelValuesToForm",
            "change:equipmentShoeId": "_applyModelValuesToForm",
            "change:workoutId": "_adjustSelectors"
        },

        template:
        {
            type: "handlebars",
            template: equipmentView
        },

        initialize: function(options)
        {
            this.bikes = new TP.Collection(
                options.collection.filter(
                    function(e)
                    {
                        if (e.get("type") === EquipmentTypes.Bike)
                        {
                            if (e.get("isDefault"))
                            {
                                this.defaultBike = e.get("equipmentId");
                            }

                            return true;
                        }

                        return false;
                    },
                    this
                )
            );

            this.shoes = new TP.Collection(
                options.collection.filter(
                    function(e)
                    {
                        if (e.get("type") === EquipmentTypes.Shoe)
                        {
                            if (e.get("isDefault"))
                            {
                                this.defaultShoe = e.get("equipmentId");
                            }

                            return true;
                        }

                        return false;
                    },
                    this
                )
            );
        },

        serializeData: function()
        {
            return {
                bikes: this.bikes.toJSON(),
                shoes: this.shoes.toJSON()
            };
        },

        onRender: function()
        {
            this._applyModelValuesToForm();
            this._adjustSelectors();
        },

        _applyFormValuesToModel: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model);
            this.trigger("change:equipment");
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model);
        },

        _adjustSelectors: function()
        {
            var requiresBikeSelector = [
                WorkoutTypes.typesByName.Bike,
                WorkoutTypes.typesByName.Brick,
                WorkoutTypes.typesByName.Crosstrain,
                WorkoutTypes.typesByName.Race,
                WorkoutTypes.typesByName["Mountain Bike"],
                WorkoutTypes.typesByName.Custom
            ];

            this.$(".bikeBlock").toggle(_.contains(requiresBikeSelector, this.model.get("workoutTypeValueId")));

            this.$("select").prop("disabled", this.model.isNew());
        }
    });
});
