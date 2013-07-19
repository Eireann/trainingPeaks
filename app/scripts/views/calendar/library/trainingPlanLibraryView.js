define(
[
    "underscore",
    "TP",
    "hbs!templates/views/calendar/library/trainingPlanLibraryView"
],
function(
    _,
    TP,
    trainingPlanLibraryViewTemplate)
{
    var TrainingPlanLibraryView = {

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        }

    };

    return TP.ItemView.extend(TrainingPlanLibraryView);
});