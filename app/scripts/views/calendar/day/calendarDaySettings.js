define(
[
    "underscore",
    "moment",
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "utilities/printing/printUtility",
    "hbs!templates/views/calendar/day/calendarDaySettings",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(_, moment, TP, setImmediate, jqueryOutside, UserConfirmationView, printUtility, calendarDaySettingsTemplate, deleteConfirmationView)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "calendarDaySettings",
        
        events:
        {
            "click #calendarDaySettingsAddLabel": "onAddClicked",
            "click #calendarDaySettingsDeleteLabel": "onDeleteClicked",
            "click #calendarDaySettingsCutLabel": "onCutClicked",
            "click #calendarDaySettingsCopyLabel": "onCopyClicked",
            "click #calendarDaySettingsPasteLabel": "onPasteClicked",
            "click #calendarDaySettingsShiftLabel": "onShiftClicked",
            "click #calendarDaySettingsPrintLabel": "onPrintClicked"
        },
        
        onAddClicked: function(e)
        {
            this.trigger("add", e);
            this.hideSettings(e);
        },

        hideSettings: function(e)
        {
            if (!this.closed)
                this.close();
        },

        initialize: function(options)
        {
            options = options || {};
            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;
            _.bindAll(this, "hideSettings");
        },

        attributes: function()
        {
            return {
                "id": "daySettingsDiv"
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarDaySettingsTemplate
        },

        onRender: function()
        {
            this.on("close", this.hideSettings, this);

            // highlight the day
            if (TP.utils.datetime.isThisWeek(this.model.id))
            {
                this.$el.find(".hoverBox").addClass("thisWeek");
            }
        },

        onDeleteClicked: function(e)
        {
            this.hideSettings(e);

            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationView });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", _.bind(this.onDeleteDayConfirmed, this));
        },
        
        onDeleteDayConfirmed: function()
        {
            this.selectionManager.execute("delete");
        },

        onCopyClicked: function(e)
        {
            this.selectionManager.copySelectionToClipboard();
            this.hideSettings(e);
        },
        
        onCutClicked: function(e)
        {
            this.selectionManager.cutSelectionToClipboard();
            this.hideSettings(e);
        },

        onPasteClicked: function(e)
        {
            this.selectionManager.pasteClipboardToSelection();
            this.hideSettings(e);
        },

        onShiftClicked: function(e)
        {
            this.selectionManager.execute("shift");
            this.hideSettings(e);
        },
        
        onPrintClicked: function(e)
        {
            var personId = theMarsApp.user.getCurrentAthleteId();
            var date = moment(this.model.get("date"));
            printUtility.printDay(personId, date);
        }

    });
});
