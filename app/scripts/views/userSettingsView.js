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
            /*
            "#athleteType":
            {
                observe: "athleteType",
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "Run", value: 0 }, { label: "Tri", value: 1 }]
                    },
                    labelPath: "label",
                    valuePath: "value"
                }
            },*/
            "#city":
            {
                observe: "city",
                eventsOverride: [ "blur" ]
            },
            "#state":
            {
                observe: "state", 
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "Colorado", value: 0 }, { label: "New York", value: 1 }]
                    },
                    labelPath: "label",
                    valuePath: "value"
                } 
            },
            "#country":
            {
                observe: "country",
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "USA", value: 0 }, { label: "Italy", value: 1 }]
                    },
                    labelPath: "label",
                    valuePath: "value"
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