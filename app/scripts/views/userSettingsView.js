define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/userSettings"
],
function (TP, jqueryuiDialog, userSettingsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: userSettingsTemplate
        },

        ui:
        {
        },
        
        events:
        {
        },

        modelEvents:
        {
            "change": "render"
        },
        
        onBeforeRender: function()
        {
            var self = this;
            $(this.el).dialog(
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
                        $(this).dialog("close");
                    },
                    "Cancel": function()
                    {
                        self.resetSettings();
                        $(this).dialog("close");
                    }
                }
            });
        },
        
        onRender: function()
        {
            $(this.el).dialog("open");
        },
        
        saveSettings: function()
        {
            
        },
        
        resetSettings: function()
        {
            
        }
    });
});