define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "hbs!templates/views/selectedRangeSettings",
    "hbs!templates/views/deleteConfirmationView"
],
function(TP, setImmediate, jqueryOutside, UserConfirmationView, selectedRangeSettingsTemplate, deleteConfirmationTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
       

        className: "selectedRangeSettings",

        events:
        {
            "click #selectedRangeSettingsDeleteLabel": "onDeleteClicked",
            "click #selectedRangeSettingsCutLabel": "onCutClicked",
            "click #selectedRangeSettingsCopyLabel": "onCopyClicked",
            "click #selectedRangeSettingsShiftLabel": "onShiftClicked"
        },

        initialize: function(options)
        {
            this.selectedRangeCollection = options.collection;
            this.on("clickoutside", this.unselect, this);
        },

        attributes:
        {
            "id": "selectedRangeSettingsDiv"
        },

        template:
        {
            type: "handlebars",
            template: selectedRangeSettingsTemplate
        },

        onRender: function()
        {
            this.updatePasteAvailability();
        },

        onDeleteClicked: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteRangeConfirmed, this);
        },
        
        onDeleteRangeConfirmed: function()
        {
            this.selectedRangeCollection.deleteWeekItems();
            this.close();
        },
 
        onCopyClicked: function()
        {
            this.selectedRangeCollection.trigger("week:copy", this.selectedRangeCollection);
            this.updatePasteAvailability();
            this.close();
        },

        onCutClicked: function()
        {
            this.selectedRangeCollection.trigger("week:cut", this.selectedRangeCollection);
            this.updatePasteAvailability();
            this.close();
        },

        onShiftClicked: function(e)
        {
            this.close();
            this.selectedRangeCollection.trigger("range:shiftwizard");
        },

        updatePasteAvailability: function()
        {
            this.selectedRangeCollection.trigger("week:pasteMenu", this.selectedRangeCollection.models[0].id);
        },

        unselect: function(e)
        {
            // disabled until we discuss functionality with stakeholders
            //this.selectedRangeCollection.trigger("range:unselect", this.selectedRangeCollection);
        }
    });
});