define(
[
    "underscore",
    "backbone.marionette",
    "TP",
    "views/library/exerciseLibraryItemView",
    "views/library/exerciseLibraryAddItemView",
    "hbs!templates/views/library/exerciseLibraryView"
],
function(_, Marionette, TP, ExerciseLibraryItemView, ExerciseLibraryAddItemView, exerciseLibraryViewTemplate)
{
    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "exercises",

        getItemView: function(item)
        {
            if (item)
            {
                return ExerciseLibraryItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryViewTemplate
        },

        events:
        {
            "click button#add": "addToLibrary",
            "change #librarySelect": "onSelectLibrary"
        },

        addToLibrary: function()
        {
            var view = new ExerciseLibraryAddItemView({});
            view.render();
        },

        initialize: function(options)
        {
            this.libraries = options && options.exerciseLibraries ? options.exerciseLibraries : new TP.Collection();
            this.libraries.once('reset', this.loadAllExercises, this);
        },

        loadAllExercises: function()
        {

            this.switchLibrary(this.libraries.models[0]);

            this.libraries.each(function(library)
            {
                library.fetchExercises();
            });

        },

        switchLibrary: function(library)
        {
            this.activeLibrary = library;
            this.collection = library.exercises;
            Marionette.bindEntityEvents(this, this.collection, Marionette.getOption(this, "collectionEvents"));
            this.collection.on('reset', this.render, this);
            this.render();
        },

        serializeData: function()
        {
            var data = {
                libraries: []
            };

            var self = this;
            this.libraries.each(function(library)
            {
                var libraryData = library.toJSON();
                if (library === self.activeLibrary)
                {
                    libraryData.selected = true;
                }
                data.libraries.push(libraryData);
            });

            return data;
        },

        onSelectLibrary: function()
        {
            var selectedLibraryId = Number(this.$("#librarySelect").val());
            var self = this;
            this.libraries.each(function(library)
            {
                if (library.id === selectedLibraryId)
                {
                    self.switchLibrary(library);
                }
            });
        }

    }, { activeLibrary: null });


});