define(
[
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "backbone.marionette",
    "jqueryui/droppable",
    "TP",
    "models/library/libraryExercise",
    "models/library/libraryExercisesCollection",
    "views/calendar/library/exerciseLibraryItemView",
    "views/calendar/library/exerciseLibraryAddItemView",
    "views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryConfirmationView",
    "hbs!templates/views/calendar/library/exerciseLibraryView"
],
function(
    _,
    setImmediate,
    jqueryUiWidget,
    jquerySelectBox,
    Marionette,
    droppable,
    TP,
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
            "click button#add": "addToLibrary",
            "change #librarySelect": "onSelectLibrary",
            "keyup #search": "_updateCollection",
            "change #search": "_updateCollection"
        },

        ui:
        {
            search: "#search",
            exercisesContainer: "div.exercisesContainer"
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

            this.selectedChild = null;
            this.on("itemview:selected", function(childView)
            {
                self.trigger("select");
                if(self.selectedChild && self.selectedChild !== childView)
                    self.selectedChild.unSelect();
                self.selectedChild = childView;
            });
        },

        unSelect: function()
        {
            if(this.selectedChild)
                this.selectedChild.unSelect();
            this.selectedChild = null;
        },

        onRender: function()
        {
            var self = this;

            setImmediate(function()
            {
                self.$("#librarySelect").val(self.model.get("selected"));

                self.$("#librarySelect").selectBoxIt(
                {
                    dynamicPositioning: false
                });
            });
            this.$el.droppable({drop: _.bind(this.onWorkoutDropped, this), hoverClass: 'myHoverClass'});
            
        },

        addToLibrary: function()
        {
            var view = new ExerciseLibraryAddItemView({});
            view.render();
        },
        onWorkoutDropped: function(event, ui)
        {
            if (!ui.draggable.data('workoutid'))
            {
                return;
            }
            var workoutid = ui.draggable.data('workoutid');
            var workoutModel = theMarsApp.controllers.calendarController.weeksCollection.workoutsCollection.get(workoutid);
            this.saveToLibraryConfirmationView = new SaveToLibraryConfirmationView({ model: workoutModel, libraries: this.libraries, selectedLibraryId: this.model.get('selected'), shouldShowConfirmation: false });
            this.saveToLibraryConfirmationView.render();

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
