define(
[
    "underscore",
    "setImmediate",
    "jqueryui/datepicker",
    "TP",
    "shared/data/equipmentTypes",
    "shared/utilities/formUtility",
    "shared/utilities/calendarUtility",
    "views/userConfirmationView",
    "hbs!shared/templates/userSettings/equipmentItemTemplate",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    _,
    setImmediate,
    datePicker,
    TP,
    EquipmentTypes,
    FormUtility,
    CalendarUtility,
    UserConfirmationView,
    equipmentItemTemplate,
    deleteConfirmationTemplate
)
{

    return TP.ItemView.extend(
    {

        events: {
            "change .defaultToggle": "_onDefaultToggleChange",
            "change .retiredToggle": "_onRetiredToggleChange",

            "click .removeEquipment": "_removeEquipment",
            "click .expander": "_toggleExpanded"
        },

        modelEvents: {
            "change:actualDistance": "render",
            "change:isDefault": "_updateDefaultState"
        },

        className: function()
        {
            var names = ["equipmentItem"];

            names.push(EquipmentTypes.convertTypeToLabel(this.model.get("type")));

            if(this.model.get("retired"))
            {
                names.push("retiredItem");
            }

            if(this.model.get("isDefault"))
            {
                names.push("defaultItem");
            }

            if(this.model.getState().get("expanded"))
            {
                names.push("expanded");
            }

            return names.join(" ");
        },

        template:
        {
            type: "handlebars",
            template: equipmentItemTemplate
        },

        initialize: function(options)
        {
            this.parentView = options.parentView;
        },

        onRender: function()
        {
            this.$(".datepicker").datepicker(
            {
                dateFormat: TP.utils.datetime.formatter.getFormatForDatepicker(),
                firstDay: CalendarUtility.startOfWeek
            });

            if (this.model.has("equipmentId"))
            {
                // since this model was cloned from a parent model, fetch on the parent model so it stays in app state if we don't save this item
                this.model.originalModel.getActualDistance().done(_.bind(function()
                {
                    this.model.set("actualDistance", this.model.originalModel.get("actualDistance"));
                }, this));
            }

            this._applyModelValuesToForm();

            if(this.model.isNew())
            {
                this._toggleExpanded();
                setImmediate(_.bind(function(){this.$("input[name=name]").focus();}, this));
            }
        },

        serializeData: function()
        {
            var serializedData = this.model.toJSON();

            if (this.model && this.model.get("type") === 1)
            {
                serializedData.CrankLengths = this.model.CrankLengths;
            }

            return serializedData;
        },

        applyFormValuesToModel: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model);
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model);
        },

        _onDefaultToggleChange: function()
        {
            this.model.set("isDefault", this.$(".defaultToggle").is(":checked"));
        },

        _updateDefaultState: function()
        {
            var isDefault = this.model.get("isDefault");
            this.$(".defaultToggle").prop("checked", isDefault);
            this.$el.toggleClass("defaultItem", isDefault);
        },

        _onRetiredToggleChange: function()
        {
            this.$el.toggleClass("retiredItem", this.$(".retiredToggle").is(":checked"));
        },

        _removeEquipment: function()
        {
            if(this.model.isNew())
            {
                this.model.trigger("destroy", this.model); 
            }
            else
            {
                var deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
                deleteConfirmationView.render();
                this.listenTo(deleteConfirmationView, "userConfirmed",  _.bind(function(){this.model.trigger("destroy", this.model);}, this));
            }
        },

        _toggleExpanded: function()
        {
            this.$el.toggleClass("expanded");
            this.model.getState().set("expanded", this.$el.is(".expanded"));
        }

    });

});
