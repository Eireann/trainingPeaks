define(
[
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/weekSummary/calendarWeekSummarySettings",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(TP, UserConfirmationView, calendarWeekSummarySettings, deleteConfirmationTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "weekSummarySettings",

        events:
        {
            "click #calendarWeekSummarySettingsDeleteLabel": "onDeleteClicked",
            "click #calendarWeekSummarySettingsCutLabel": "onCutClicked",
            "click #calendarWeekSummarySettingsCopyLabel": "onCopyClicked",
            "click #calendarWeekSummarySettingsPasteLabel": "onPasteClicked",
            "click #calendarWeekSummarySettingsShiftLabel": "onShiftClicked"
        },

        hideSettings: function(e)
        {
            this.close();
        },

        initialize: function(options)
        {
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "summarySettingsDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarWeekSummarySettings
        },

        onRender: function()
        {
            if (TP.utils.datetime.isThisWeek(this.model.get("date")))
            {
                this.$el.find(".hoverBox").addClass("thisWeek");
            }
        },

        onDeleteClicked: function(e)
        {
            this.hideSettings(e);
            
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", this.onDeleteDayConfirmed);
        },
        
        onDeleteDayConfirmed: function()
        {
            theMarsApp.selectionManager.execute("delete");
        },

        onCopyClicked: function(e)
        {
            theMarsApp.selectionManager.copySelectionToClipboard();
            this.hideSettings(e);
        },

        onCutClicked: function(e)
        {
            theMarsApp.selectionManager.cutSelectionToClipboard();
            this.hideSettings(e);
        },

        onPasteClicked: function(e)
        {
            theMarsApp.selectionManager.pasteClipboardToSelection();
            this.hideSettings(e);
        },

        onShiftClicked: function (e)
        {
            this.hideSettings(e);
            theMarsApp.selectionManager.execute("shift");
        }

    });
});
