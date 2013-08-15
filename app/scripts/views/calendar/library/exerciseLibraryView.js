define(
[
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "backbone.marionette",
    "TP",
    "models/library/libraryExercise",
    "models/library/libraryExercisesCollection",
    "views/calendar/library/exerciseLibraryItemView",
    "views/calendar/library/exerciseLibraryAddItemView",
    "hbs!templates/views/calendar/library/exerciseLibraryView"
],
function(
    _,
    setImmediate,
    jqueryUiWidget,
    jquerySelectBox,
    Marionette,
    TP,
    LibraryExerciseModel,
    LibraryExercisesCollection,
    ExerciseLibraryItemView,
    ExerciseLibraryAddItemView,
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

            this.model = new TP.Model({ selected: this.libraries.getDefaultLibraryId(), libraries: this.libraries.toJSON() });
            this.collection = new LibraryExerciseViewAdapterCollection();

            this.listenTo(this.model, "change:selected", this._onLibrariesChanged, this);

            var self = this;
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
                if(self.selectedChild)
                    self.selectedChild.unSelect();
                self.selectedChild = childView;
            });
        },

        unSelect: function()
        {
            if(this.selectedChild)
                this.selectedChild.unSelect();
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
        },

        addToLibrary: function()
        {
            var view = new ExerciseLibraryAddItemView({});
            view.render();
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
