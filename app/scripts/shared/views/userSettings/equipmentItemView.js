define(
[
    "underscore",
    "jqueryui/datepicker",
    "TP",
    "shared/utilities/formUtility",
    "shared/utilities/calendarUtility",
    "hbs!shared/templates/userSettings/equipmentItemTemplate"
],
function(
    _,
    datePicker,
    TP,
    FormUtility,
    CalendarUtility,
    equipmentItemTemplate
)
{

    return TP.ItemView.extend(
    {

        events: {
            "change .defaultToggle": "_onDefaultToggleChange",
            "change .retiredToggle": "_onRetiredToggleChange",

            "click .removeEquipment": "_removeEquipment"
        },

        className: "equipmentItem",

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

            if (!this.model.has("actualDistance") && this.model.has("equipmentId"))
            {
                this.model.getActualDistance();
            }

            this._applyModelValuesToForm();
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
            if (this.parentView)
            {
                this.parentView.trigger("defaultEquipmentChange", this.model.get("type"), this.model.get("equipmentId"));
            }
        },

        _onRetiredToggleChange: function()
        {
            var $retiredToggle = this.$(".retiredToggle");

            this.$(".retiredDate").toggle($retiredToggle.is(':checked'));

            var $notes = this.$(".equipRightCol textarea");

            if ($retiredToggle.is(':checked'))
            {
                $notes.addClass("retiredItem");
            }
            else
            {
                $notes.removeClass("retiredItem");
            }
        },

        _removeEquipment: function()
        {
            this.model.trigger("destroy", this.model);
        }

    });

});
