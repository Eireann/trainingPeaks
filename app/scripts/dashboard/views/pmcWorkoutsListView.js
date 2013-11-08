define(
[
	"underscore",
	"TP",
	"views/quickView/workoutQuickView",
	"shared/views/tomahawkView",
	"models/workoutModel",
	"hbs!templates/views/dashboard/pmcWorkoutsList"
],
function(
	_,
	TP,
	WorkoutQuickView,
	TomahawkView,
	WorkoutModel,
	pmcWorkoutsListTemplate
)
{
	var PmcWorkoutsListView = TP.ItemView.extend({

		className: "pmcWorkoutsList",

		template:
		{
			type: "handlebars",
			template: pmcWorkoutsListTemplate
		},

		initialize: function(options)
		{
			this.listenTo(this.model.itemsCollection, "add change remove", _.bind(this.render, this));
		},

		onRender: function()
		{
			$('#flotTip').hide();
		},
		
		serializeData: function()
		{
			var workouts =  _.filter(this.model.items(), function(item) { return item instanceof WorkoutModel; });

			return {
				workouts: _.map(workouts, function(workout) { return workout.toJSON(); }),
				date: this.model.id
			};
		},

		events:
		{
			'click .workout': 'showWorkoutQV'
		},

		showWorkoutQV: function(e)
		{
			e.preventDefault();
			var workoutId = $(e.currentTarget).data('workout-id');
			var model = this.model.getItem(WorkoutModel, workoutId);
			new WorkoutQuickView({ model: model }).render();
			this.close();
			return false;
		}
	});

	TomahawkView.wrap(PmcWorkoutsListView, { style: "list" });

	return PmcWorkoutsListView;
});

