﻿define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/workoutQuickView"

],
function(TP, dialog, workoutQuickView)
{
    "use strict";

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: workoutQuickView
        },

        ui:
        {
        },
        
        events:
        {
        },

        onBeforeRender: function ()
        {
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 600
            });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
        }

    });
});