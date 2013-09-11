define(
[
    "underscore",
    "TP",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettings/zonesNotificationsTemplate"
],
function(
    _,
    TP,
    FormUtility,
    zonesNotificationsTemplate
)
{
    var ZonesNotificationsView = TP.ItemView.extend({
        template:
        {
            type: "handlebars",
            template: zonesNotificationsTemplate
        },

        initialize: function()
        {
            this.on("render", this.applyModelValuesToForm, this);
        },

        applyFormValuesToModels: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zonesNotifications']"
            });
        },

        applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zonesNotifications']"
            });
        }
    });
    
    return ZonesNotificationsView;
});
