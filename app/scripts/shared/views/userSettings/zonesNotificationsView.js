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

        events: 
        {
            "click .upgrade": "_showUpgradePrompt"
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
        },

        serializeData: function()
        {
            return {
                canApplyThreshold: theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.AutoApplyThresholdChanges)
            };
        },

        _showUpgradePrompt: function()
        {
            theMarsApp.featureAuthorizer.showUpgradeMessage();
        }
    });
    
    return ZonesNotificationsView;
});
