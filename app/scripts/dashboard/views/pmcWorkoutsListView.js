define(
[
    "underscore",
    "TP",
    "views/quickView/workoutQuickView",
    "hbs!templates/views/dashboard/pmcWorkoutsList"
],
function(
    _,
    TP,
    WorkoutQuickView,
    pmcWorkoutsListTemplate
    )
{
    var PmcWorkoutsList = TP.ItemView.extend({

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "pmcWorkoutsList",

        template:
        {
            type: "handlebars",
            template: pmcWorkoutsListTemplate
        },

        initialize: function(options)
        {
        	this.dataPromise = options.dataPromise;
        	this.dataPromise.done(_.bind(this.render, this));
        },

        onRender: function()
        {
        	this.$el.find('.hoverBox').addClass('leftarrow');
        },

        alignArrowTo: function(top)
        {

            // make sure we're fully on the screen
            var windowBottom = $(window).height() - 10;
            this.top(top - 25);
            var myBottom = this.$el.offset().top + this.$el.height();

            if(myBottom > windowBottom)
            {
                var arrowOffset = (myBottom - windowBottom) + 30;
                this.top(windowBottom - this.$el.height());
                this.$(".arrow").css("top", arrowOffset + "px");
            }
        },

        serializeData: function()
        {
        	console.log({workouts: this.collection.toJSON()});
        	return {
        		workouts: this.collection.toJSON()
        	};
        },

        events:
        {
        	'click a': 'showWorkoutQV'
        },

        showWorkoutQV: function(e)
        {
        	e.preventDefault();
        	var workoutId = $(e.target).data('id');
        	var model = this.collection.get(workoutId);
        	new WorkoutQuickView({ model: model }).render();
        	return false;
        },
    });

    return PmcWorkoutsList;
});

