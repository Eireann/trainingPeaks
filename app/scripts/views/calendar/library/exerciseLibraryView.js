define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "backbone.marionette",
    "jqueryui/droppable",
    "TP",
    "framework/notYetImplemented",
    "models/workoutModel",
    "models/library/libraryExercise",
    "models/library/libraryExercisesCollection",
    "views/calendar/library/exerciseLibraryItemView",
    "views/calendar/library/exerciseLibraryAddItemView",
    "views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryConfirmationView",
    "hbs!templates/views/calendar/library/exerciseLibraryView"
],
function(
    $,
    _,
    setImmediate,
    jqueryUiWidget,
    Marionette,
    droppable,
    TP,
    notYetImplemented,
    WorkoutModel,
    LibraryExerciseModel,
    LibraryExercisesCollection,
    ExerciseLibraryItemView,
    ExerciseLibraryAddItemView,
    SaveToLibraryConfirmationView,
    exerciseLibraryViewTemplate
    )
{
    var LibraryExerciseViewAdapterCollection = TP.Collection.extend(
    {
        model: LibraryExerciseModel,
        comparator: function(model)
        {
            var itemName = model.get("itemName");
            return _.isString(itemName) ? itemName.trim().toLowerCase() : itemName;
        }
    });

    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "exercises",

        template:
        {
            type: "handlebars",
            template: exerciseLibraryViewTemplate
        },

        events:
        {
            "click button#add": notYetImplemented, // "addToLibrary",
            "click .settingsBtn": notYetImplemented,
            "change #librarySelect": "onSelectLibrary",
            "keyup #search": "_updateCollection",
            "change #search": "_updateCollection"
        },

        ui:
        {
            search: "#search",
            exercisesContainer: "div.exercisesContainer"
        },

        collectionEvents:
        {
            "destroy": "onWaitStop"
        },

        itemViewContainer: "div.exercisesContainer",

        getItemView: function(item)
        {
            if (item)
                return ExerciseLibraryItemView;
            else
                return TP.ItemView;
        },

        initialize: function(options)
        {
            this.libraries = options && options.exerciseLibraries ? options.exerciseLibraries : new TP.Collection();

            var self = this;
            this.libraries.each(function(library)
            {
                self.listenTo(library.exercises, "reset", self._onLibrariesChanged, self);
            });

            this.model = new TP.Model({ selected: this.libraries.getDefaultLibraryId(), libraries: this.libraries.toJSON() });
            this.collection = new LibraryExerciseViewAdapterCollection();

            this.listenTo(this.model, "change:selected", this._onLibrariesChanged, this);

            this.$el.addClass("waiting");

            $.when.apply($, this._loadAllExercises(), this).done(function()
            {
                self.$el.removeClass("waiting");
                self._onLibrariesChanged();
            });
        },

        onRender: function()
        {
            this.$("#librarySelect").val(this.model.get("selected"));
            this.$el.droppable({drop: _.bind(this.onWorkoutDropped, this), hoverClass: 'myHoverClass'});
        },

        addToLibrary: function()
        {
            var view = new ExerciseLibraryAddItemView({});
            view.render();
        },
        onWorkoutDropped: function(event, ui)
        {
            var workout = ui.draggable.data("handler");

            if(workout instanceof WorkoutModel)
            {
                this.saveToLibraryConfirmationView = new SaveToLibraryConfirmationView({ model: workout, libraries: this.libraries, selectedLibraryId: this.model.get('selected'), shouldShowConfirmation: false });
                this.saveToLibraryConfirmationView.render();
            }
        },
        _onLibrariesChanged: function(options)
        {
            this._updateCollection();
        },

        _loadAllExercises: function()
        {
            var deferreds = [];
            this.libraries.each(function(library)
            {
                deferreds.push(library.fetchExercises());
            });
            return deferreds;
        },

        onSelectLibrary: function()
        {
            var selectedLibraryId = Number(this.$("#librarySelect").val());
            this.model.set("selected", selectedLibraryId);
        },

        _updateCollection: function()
        {
            var selectedLibrary = this.libraries.get(this.model.get("selected"));
            var wrapperCollection = new TP.Collection(selectedLibrary.exercises.models);

            var searchText = this.ui.search.val ? this.ui.search.val().trim() : "";
            this.collection.reset(TP.utils.collections.search(LibraryExerciseViewAdapterCollection, wrapperCollection, searchText, ["itemName"]).models);
        }

    }, { activeLibrary: null });
});
