define(
[
    "TP",
    "utilities/htmlCleaner",
    "views/workout/ExerciseSetView",
    "hbs!templates/views/workout/exerciseItemView"
],
function (
    TP,
    HTMLCleaner,
    ExerciseSetView,
    exerciseItemView
)
{
    return TP.CompositeView.extend(
    {
        className: "workoutExercise",

        itemView: ExerciseSetView,

        itemViewContainer: ".exerciseSets",

        itemViewOptions: function(model, index)
        {
            return {
                index: index
            };
        },

        template:
        {
            type: "handlebars",
            template: exerciseItemView
        },

        initialize: function(options)
        {
            this.collection = new TP.Collection(options.model.get("sets"));
        },

        serializeData: function()
        {
            var data = this.model.toJSON();

            if (data.notes)
                data.notes = HTMLCleaner.clean(data.notes);

            return data;
        }
    });
});
