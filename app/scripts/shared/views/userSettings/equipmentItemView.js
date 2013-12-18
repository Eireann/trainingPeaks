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
            "change .retiredToggle": "_onRetiredToggleChange",
            "click .removeEquipment": "_removeEquipment"
        },

        className: "equipmentItem",

        template:
        {
            type: "handlebars",
            template: equipmentItemTemplate
        },

        onRender: function() {
            this.$(".datepicker").datepicker(
            {
                dateFormat: TP.utils.datetime.format.getFormatForDatepicker(),
                firstDay: CalendarUtility.startOfWeek
            });

            this._applyModelValuesToForm();
        },

        applyFormValuesToModel: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model);
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model);
        },

        _onRetiredToggleChange: function()
        {
            this.$(".retiredDate").toggle(this.$(".retiredToggle").is(':checked'));
        },

        _removeEquipment: function()
        {
            this.model.trigger("destroy", this.model);
        }

    });
});
