define(
[
    "underscore",
    "jqueryOutside",
    "TP",
    "views/pageContainer/libraryContainerView",
    "views/calendar/library/exerciseLibraryView",
    "views/calendar/library/trainingPlanLibraryView",
    "hbs!templates/views/calendar/library/libraryView"
],
function(
    _,
    jqueryOutside,
    TP,
    LibraryContainerView,
    ExerciseLibraryView,
    TrainingPlanLibraryView,
    libraryTemplate)
{
    return LibraryContainerView.extend(
    {
        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, options);
        },

        viewConstructors:
        {
            "exerciseLibrary": ExerciseLibraryView,
            "plansLibrary": TrainingPlanLibraryView
        },

        buildView: function(requestedView, options)
        {
            var customOptions = {};

            switch(requestedView)
            {
                case "exerciseLibrary":
                {
                    customOptions = 
                    {
                        exerciseLibraries: options && options.collections && options.collections.exerciseLibraries ? options.collections.exerciseLibraries : new TP.Collection()
                    };
                }
                break;
                case "plansLibrary":
                {
                    customOptions =
                    {
                        collection: options && options.collections && options.collections.trainingPlans ? options.collections.trainingPlans : new TP.Collection()
                    };
                }
                break;
            }

            return new this.viewConstructors[requestedView](customOptions);
        }
    });
});
