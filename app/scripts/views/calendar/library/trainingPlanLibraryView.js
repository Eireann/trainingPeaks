define(
[
    "underscore",
    "TP",
    "views/calendar/library/trainingPlanItemView",
    "hbs!templates/views/calendar/library/trainingPlanLibraryView"
],
function(
    _,
    TP,
    TrainingPlanItemView,
    trainingPlanLibraryViewTemplate)
{
    var TrainingPlanLibraryView = {
        
        className: "trainingPlanLibrary",

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        },

        getItemView: function(item)
        {
            if (item)
            {
                return TrainingPlanItemView;
            } else
            {
                return TP.ItemView;
            }
        }

    };

    return TP.CompositeView.extend(TrainingPlanLibraryView);
});