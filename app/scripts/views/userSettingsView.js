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
                observe: "FirstName",
                eventsOverride: [ "blur" ]
            },
            "#lastName":
            {
                observe: "LastName",
                eventsOverride: [ "blur" ]
            },
            "#userName":
            {
                observe: "Username",
                eventsOverride: [ "blur" ]
            },
            "#birthday":
            {
                observe: "Birthday",
                eventsOverride: [ "blur" ]
            },
            "#city":
            {
                observe: "City",
                eventsOverride: [ "blur" ]
            },
            "#state":
            {
                observe: "State",
                eventsOverride: [ "blur" ]
            },
            "#country":
            {
                observe: "Country",
                eventsOverride: [ "blur" ]
            },
            "select#units":
            {
                observe: "UnitsValue",
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
                height: 400,
                width: 600,
                modal: true,
                show:
                {
                    effect: "fade",
                    duration: 400
                },
                buttons:
                {
                    "Save": function()
                    {
                        self.saveSettings();
                        self.$el.dialog("close");
                        self.close();
                    },
                    "Cancel": function()
                    {
                        self.resetSettings();
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
            
        },
        
        resetSettings: function()
        {
            
        }
    });
});