define(
[
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "backbone.marionette",
    "TP",
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
    LibraryExercisesCollection,
    ExerciseLibraryItemView,
    ExerciseLibraryAddItemView,
    exerciseLibraryViewTemplate
    )
{
    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "exercises",

        getItemView: function(item)
        {
            if (item)
                return ExerciseLibraryItemView;
            else     
                return TP.ItemView;
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryViewTemplate
        },

        events:
        {
            "click button#add": "addToLibrary",
            "change #librarySelect": "onSelectLibrary",
            "keyup #search": "onSearch",
            "change #search": "onSearch"
        },

        ui:
        {
            search: "#search"
        },

        onRender: function()
        {
            var self = this;

            setImmediate(function()
            {
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

        initialize: function(options)
        {
            this.libraries = options && options.exerciseLibraries ? options.exerciseLibraries : new TP.Collection();
            this.libraries.on("reset", this.loadAllExercises, this);
            this.listenForSelection();
        },

        listenForSelection: function()
        {
            var view = this;
            this.libraries.each(function(library)
            {
                library.on("select", view.onItemSelect, view);
            });

            this.on("library:unselect", this.onUnSelect, this);
        },

        onItemSelect: function(model)
        {
            if (this.selectedItem && this.selectedItem !== model)
                this.selectedItem.trigger("unselect", this.selectedItem);

            this.trigger("select");
            this.selectedItem = model;
        },

        onUnSelect: function()
        {
            if (this.selectedItem)
            {
                this.selectedItem.trigger("unselect", this.selectedItem);
                this.selectedItem = null;
            }
        },

        loadAllExercises: function()
        {
            this.switchLibrary(this.libraries.models[0]);

            var view = this;
            this.libraries.each(function(library)
            {
                library.fetchExercises();
                library.on("select", view.onItemSelect, view);
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
            var data =
            {
                libraries: []
            };

            var self = this;
            this.libraries.each(function(library)
            {
                var libraryData = library.toJSON();
               
                if (library === self.activeLibrary)
                    libraryData.selected = true;

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
        },

        onSearch: function()
        {
            var searchText = this.ui.search.val().trim();
            this.collection = TP.utils.collections.search(
                                                          LibraryExercisesCollection,
                                                          this.activeLibrary.exercises,
                                                          searchText,
                                                          ["itemName"]
                                                          );
          this._renderChildren();
        }

    }, { activeLibrary: null });
});
