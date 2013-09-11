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
        	this.position = options.position;
        	this.dataPromise = options.dataPromise;
        	this.dataPromise.done(_.bind(this.render, this));        	
        },

        onRender: function()
        {
        	this.$el.find('.hoverBox').addClass('leftarrow');
        	this.top(this.position.y - 33);
        	this.left(this.position.x + 20);

        	this.ensureInView();

            // hide hover modal
            $('#flotTip').hide();
        },

        ensureInView: function()
        {

            // make sure we're fully on the screen
            var windowBottom = $(window).height() - 10;
            var myBottom = this.$el.position().top + this.$el.height();

            if(myBottom > windowBottom)
            {
                var arrowOffset = (myBottom - windowBottom) + 40;
                this.top(windowBottom - this.$el.height());
                this.$(".arrow").css("top", arrowOffset + "px");
            }
        },

        serializeData: function()
        {
        	return {
        		workouts: this.collection.toJSON(),
        		date: this.collection.startDate.format("MM-DD-YYYY")
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

