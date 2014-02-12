define(
[
    "underscore"
],
function(
    _
)
{
    var summaryViewWorkoutStructure =
    {
        events: {
            "click .workoutStructureToggle": "toggleWorkoutStructure"
        },

        initializeWorkoutStructure: function()
        {
            this.on("render", this.onRenderWorkoutStructure, this);
        },

        onRenderWorkoutStructure: function()
        {
        },

        toggleWorkoutStructure: function(event)
        {
            event.preventDefault();

            var workoutStructureContainer = this.$('#workoutStructureContainer');

            if (workoutStructureContainer.hasClass('open'))
            {
                workoutStructureContainer.removeClass('open');
                
                this.$('.workoutStructure').fadeOut(
                    'slow',
                    _.bind(
                        function()
                        {
                            this.$('#workoutStructureContainer').stop().animate(
                                {
                                    height: auto,
                                    width: "50%",
                                    left: "50%",
                                    opacity: 0.0
                                },
                                2000
                            );
                        },
                        this
                    )
                );
            }
            else
            {
                workoutStructureContainer.addClass('open');

                this.$('#workoutStructureContainer').stop().animate(
                    {
                        height: auto,
                        width: "50%",
                        left: "100%",
                        opacity: 1.0
                    },
                    2000,
                    _.bind(
                        function()
                        {
                            this.$('.workoutStructure').fadeIn('slow');
                        },
                        this
                    )
                );
            }
        }
    };

    return summaryViewWorkoutStructure;
});
