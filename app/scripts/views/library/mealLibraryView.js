﻿define(
[
    "underscore",
    "TP",
    "hbs!templates/views/library/mealLibraryView"
],
function(_, TP, mealLibraryViewTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: mealLibraryViewTemplate
        }

    });
});