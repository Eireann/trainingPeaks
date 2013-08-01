define(
[
    "underscore",
    "TP",
    "views/calendar/library/trainingPlanItemView",
    "models/library/trainingPlanCollection",
    "hbs!templates/views/calendar/library/trainingPlanLibraryView"
],
function(
    _,
    TP,
    TrainingPlanItemView,
    TrainingPlanCollection,
    trainingPlanLibraryViewTemplate)
{
    var TrainingPlanLibraryView = {
        
        className: "trainingPlanLibrary",
        searchText: null,

        template:
        {
            type: "handlebars",
            template: trainingPlanLibraryViewTemplate
        },

        events: {
            "keyup #search": "onSearch",
            "change #search": "onSearch"
        },

        ui: {
            search: "#search"
        },

        collectionEvents: {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop",
            "refresh": "render",
            "destroy": "onWaitStop",
            "select": "onSelectItem",
            "unselect": "unSelectItem"
        },

        initialize: function()
        {
            this.on("library:unselect", this.unSelectItem, this);
            this.sourceCollection = this.collection;
            this.model = new TP.Model({wwwRoot: theMarsApp.wwwRoot })
        },

        getItemView: function(item)
        {
            if (item)
            {
                return TrainingPlanItemView;
            } else
            {
                return TP.ItemView;
            }
        },

        onSelectItem: function(model)
        {
            if (this.selectedItem && this.selectedItem !== model)
            {
                this.unSelectItem();
            }

            this.selectedItem = model;
            this.trigger("select");
        },

        unSelectItem: function()
        {
            if (this.selectedItem)
            {
                var previouslySelectedItem = this.selectedItem;
                this.selectedItem = null;
                previouslySelectedItem.trigger("unselect", previouslySelectedItem);
            }
        },

        filterModel: function(model)
        {
            return this.searchRegExp.test(model.get("title"));
        },

        onSearch: function()
        {
            var searchText = this.ui.search.val().trim();

            if(searchText)
            {
                var matchers = this.buildSearchMatchers(searchText);

                var filterModel = function(model)
                {
                    var title = model.get("title");
                    return _.any(matchers, function(matcher)
                    {
                        return matcher.test(title);
                    });
                };

                this.collection = new TrainingPlanCollection(this.sourceCollection.filter(filterModel));

            } else {
                this.collection = this.sourceCollection;
            }

            this._renderChildren();
        },

        buildSearchMatchers: function(searchText)
        {

            var matchers = [];

            // exact search
            matchers.push(new RegExp(searchText, "i"));

            // simple search, ignore special characters
            matchers.push(new RegExp(searchText.replace(/[^a-zA-Z0-9]+/g,".*"), "i"));

            // any word order
            matchers.push(new AnyWordOrderMatcher(searchText));

            return matchers;
        }

    };

    var AnyWordOrderMatcher = function(searchText)
    {
        this.patterns = [];
        _.each(searchText.split(/\b/), function(word)
        {
            word = word.trim();
            if(word && word.replace(/[^a-zA-Z0-9]/g,""))
            {
                this.patterns.push(new RegExp(word, "i"));
            }
        }, this);
    };

    AnyWordOrderMatcher.prototype.test = function(title)
    {
        return _.every(this.patterns, function(pattern)
        {
            try {
                return pattern.test(title);
            } catch(e)
            {
                return false;
            }
        });
    };

    return TP.CompositeView.extend(TrainingPlanLibraryView);
});