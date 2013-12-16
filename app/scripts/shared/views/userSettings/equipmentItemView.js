define(
[
    "underscore",
    "TP",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettings/equipmentItemTemplate"
],
function(
    _,
    TP,
    FormUtility,
    equipmentItemTemplate
)
{
    return TP.ItemView.extend(
    {

        className: "equipmentItem",

        template:
        {
            type: "handlebars",
            template: equipmentItemTemplate
        },

        onRender: function() {
            this._applyModelValuesToForm();
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model);
        },

    });
});
