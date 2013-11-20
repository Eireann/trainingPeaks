define(
[
    "underscore",
    "TP"
],
function(
   _,
   TP
)
{
    var FilteredSubCollection = TP.Collection.extend(
    {
        initialize: function(models, options)
        {
            if(!options.sourceCollection)
            {
                throw new Error("FilteredSubCollection requires a sourceCollection");
            }

            if(!options.filterFunction)
            {
                throw new Error("FilteredSubCollection requires a filterFunction");
            }

            this._sourceCollection = options.sourceCollection;
            this._filterFunction = options.filterFunction;
            this.comparator = this._sourceCollection.comparator;
            this.model = this._sourceCollection.model;
            this.modelOptions = this._sourceCollection.modelOptions;

            this.add(this._sourceCollection.models);

            this.listenTo(this, "add", _.bind(this._addToSource, this));
            this.listenTo(this, "remove", _.bind(this._removeFromSource, this));
            this.listenTo(this._sourceCollection, "add", _.bind(this._addToSelf, this));
            this.listenTo(this._sourceCollection, "remove", _.bind(this._removeFromSelf, this));
        },

        add: function(model, options)
        {
            var models = _.isArray(model) ? model : [model];
            var filteredModels = _.filter(models, this._filterFunction);
            return FilteredSubCollection.__super__.add.call(this, filteredModels, options);
        },

        _addToSource: function(model)
        {
            this._sourceCollection.add(model);
        },

        _removeFromSource: function(model)
        {
            this._sourceCollection.remove(model);
        },

        _addToSelf: function(model)
        {
            this.add(model);
        },

        _removeFromSelf: function(model)
        {
            this.remove(model);
        }
    });

    return FilteredSubCollection;
});
