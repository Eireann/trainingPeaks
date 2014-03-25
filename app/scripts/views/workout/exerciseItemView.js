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
                index: index,
                workoutTypeId: this.options.workoutTypeId
            };
        },

        template:
        {
            type: "handlebars",
            template: exerciseItemView
        },

        initialize: function(options)
        {
            this.collection = new TP.Collection(options.model.get("sets"), { model: TP.DeepModel });
        },

        serializeData: function()
        {
            var data = this.model.toJSON();

            if (data.notes)
            {
                if(data.notes.match(/<[^<>]+>/))
                {
                    data.notes = HTMLCleaner.clean(data.notes);
                }
                else
                {
                   data.notes = data.notes.replace(/\r\n|\r|\n/g,"<br>");
                }
            }

            return data;
        }
        
    });
});
