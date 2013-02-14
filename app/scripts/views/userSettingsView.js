define(
[
    "TP",
    "jqueryui/dialog",
    "helpers/printUnitsValue",
    "hbs!templates/views/userSettings"
],
function (TP, jqueryuiDialog, printUnitsValue, userSettingsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: userSettingsTemplate
        },

        bindings:
        {
            "#firstName":
            {
                observe: "firstName",
                eventsOverride: ["blur"]
            },
            "#lastName":
            {
                observe: "lastName",
                eventsOverride: [ "blur" ]
            },
            "#userName":
            {
                observe: "userName",
                eventsOverride: [ "blur" ]
            },
            "#city":
            {
                observe: "city",
                eventsOverride: [ "blur" ]
            },
            "#state":
            {
                observe: "state",
                eventsOverride: [ "blur" ]
            },
            "#country":
            {
                observe: "country",
                eventsOverride: [ "blur" ]
            },
            "select#units":
            {
                observe: "unitsValue",
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ unitEnum: 0, name: "English" }, { unitEnum: 1, name: "Metric" }];
                    },
                    labelPath: "name",
                    valuePath: "unitEnum"
                }
            }
        },
        
        onBeforeRender: function()
        {
            var self = this;
            this.$el.dialog(
            {
                autoOpen: false,
                height: 700,
                width: 600,
                modal: true,
                resizable: false,
                overlay: { opacity: 0.5 },
                buttons:
                {
                    "Reset": function()
                    {
                        self.resetSettings();
                        self.$el.dialog("close");
                        self.close();
                    },
                    "Close": function()
                    {
                        self.saveSettings();
                        self.$el.dialog("close");
                        self.close();
                    }
                }
            });
        },
        
        onRender: function()
        {
            this.stickit();
            this.$el.dialog("open");
        },
        
        saveSettings: function()
        {
            this.model.save();
        },
        
        resetSettings: function()
        {
        }
    });
});