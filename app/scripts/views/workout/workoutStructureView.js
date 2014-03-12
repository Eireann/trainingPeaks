define(
[
    "underscore",
    "TP",
    "views/workout/ExerciseItemView",
    "hbs!templates/views/workout/workoutStructureView"
],
function (
    _,
    TP,
    ExerciseItemView,
    workoutStructureView
)
{
    return TP.CompositeView.extend(
    {
        className: "workoutStructureContainer",

        itemView: ExerciseItemView,

        itemViewContainer: ".workoutStructure",

        template:
        {
            type: "handlebars",
            template: workoutStructureView
        },

        initialize: function(options)
        {
            this.model = new TP.Model(options.workoutStructure);

            this.collection = new TP.Collection(this.model.get("exercises"));
        }
    });
});
