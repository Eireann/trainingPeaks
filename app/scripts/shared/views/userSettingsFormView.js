define(
[
    "TP",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettingsFormTemplate"
],
function(
    TP,
    FormUtility,
    userSettingsFormTemplate
)
{
    var UserSettingsFormView = TP.ItemView.extend(
    {
        
        template:
        {
            type: "handlebars",
            template: userSettingsFormTemplate
        },

        events:
        {
            "change input select": "onChange"
        },

        initialize: function()
        {
        },

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, { model: "user" });
        },

        _save: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, { model: "user "});
        }
    });

    return UserSettingsFormView;
});

