define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "hbs!templates/views/calendar/day/calendarDaySettings",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(TP, setImmediate, jqueryOutside, UserConfirmationView, calendarDaySettingsTemplate, deleteConfirmationView)
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
            "click #calendarDaySettingsShiftLabel": "onShiftClicked"
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
            _.bindAll(this, "hideSettings");

            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
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

            this.updatePasteAvailability();
        },

        onDeleteClicked: function(e)
        {
            this.hideSettings(e);

            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationView });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteDayConfirmed, this);
        },
        
        onDeleteDayConfirmed: function()
        {
            this.model.deleteDayItems();
        },

        onCopyClicked: function(e)
        {
            this.model.trigger("day:copy", this.model);
            this.updatePasteAvailability();
            this.hideSettings(e);
        },
        
        onCutClicked: function(e)
        {
            this.model.trigger("day:cut", this.model);
            this.updatePasteAvailability();
            this.hideSettings(e);
        },

        onPasteClicked: function(e)
        {
            this.model.trigger("day:paste", this.model.id);
            this.hideSettings(e);
        },

        onShiftClicked: function (e)
        {
            this.hideSettings(e);
            this.model.trigger("day:shiftwizard");
        },

        updatePasteAvailability: function()
        {
            this.model.trigger("day:pasteMenu", this.model.id);
        }

    });
});