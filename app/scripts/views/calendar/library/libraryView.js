define(
[
    "underscore",
    "jqueryOutside",
    "TP",
    "views/pageContainer/libraryContainerView",
    "views/calendar/library/exerciseLibraryView",
    "views/calendar/library/mealLibraryView",
    "hbs!templates/views/calendar/library/libraryView"
],
function(
    _,
    jqueryOutside,
    TP,
    LibraryContainerView,
    ExerciseLibraryView,
    MealLibraryView,
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

        buildViews: function(options)
        {
            this.views =
            {
                exerciseLibrary: new ExerciseLibraryView(
                {
                    exerciseLibraries: options && options.collections && options.collections.exerciseLibraries ?
                        options.collections.exerciseLibraries : new TP.Collection()
                }),
                mealLibrary: new MealLibraryView()
            };

        }

    });
});