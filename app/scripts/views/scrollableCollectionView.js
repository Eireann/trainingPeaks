define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP)
{
    var ScrollableCollectionViewAdapterCollection = TP.Collection.extend({
        initialize: function(models, options)
        {
            this.sourceCollection = options.sourceCollection;
            this.maxSize = options.maxSize || 10;

            this._bindSourceCollectionEvents();

            this._setupCurrentRange(firstModel);
        },

        fetchPrevious: function(numberToFetch)
        {
            var sourceBeginIndex = this.sourceCollection.indexOf(this.at(0));
            // sourceBeginIndex is number of available models in source collection before our range
            // If that's less than numberToFetch, we only pull from the source collection
            // otherwise we pull as much as we can from the source collection before fetching more
            var numberToCopy = _.min([sourceBeginIndex, numberToFetch]);
            var models = this.sourceCollection.models.slice(sourceBeginIndex - numberToCopy, sourceBeginIndex);
            this.add(models, {at: 0});

            numberToFetch -= numberToCopy;
            if(numberToFetch > 0)
            {
                this.sourceCollection.fetchPrevious(numberToFetch);
            }
        },

        fetchNext: function(numberToFetch)
        {
            var sourceEndIndex = this.sourceCollection.indexOf(this.at(0)) + this.length;
            // If availableModels is less than numberToFetch, we only pull from the source collection
            // otherwise we pull as much as we can from the source collection before fetching more
            var availableModels = this.sourceCollection.length - sourceEndIndex;
            var numberToCopy = _.min([availableModels, numberToFetch]);
            var models = this.sourceCollection.models.slice(sourceEndIndex, sourceEndIndex + numberToCopy);
            this.add(models, {at: this.length});

            numberToFetch -= numberToCopy;
            if(numberToFetch > 0)
            {
                this.sourceCollection.fetchNext(numberToFetch);
            }
        },

        _bindSourceCollectionEvents: function()
        {
            this.listenTo(this.sourceCollection, 'add', _.bind(this._onSourceAdd, this));
            this.listenTo(this.sourceCollection, 'remove', _.bind(this._onSourceRemove, this));
        },

        _onSourceAdd: function(model, collection, options)
        {
            // QL: Performance feature: cache this indexOf search
            var sourceBeginIndex = this.sourceCollection.indexOf(this.at(0));
            var sourceModelIndex = this.sourceCollection.indexOf(model);
            var offset = sourceModelIndex - sourceBeginIndex;
            if (offset >= 0 && offset < this.maxSize)
            {
                var isPastHalfPoint = offset > (this.maxSize / 2);
                // figure out which half it's in

                // add it to the appropriate place
                var adjustedOptions = _.defaults({at: offset}, options);
                this.add(model, adjustedOptions);

                // bump either the beginning or end model off
                this._limitSize({dropFrom: isPastHalfPoint ? 'beginning' : 'end'});
            }
        },

        _onSourceRemove: function(model, collection, options)
        {
            var offset = this.indexOf(model);
            var isPastHalfPoint = offset > (this.maxSize / 2);

            this.remove(model);

            this._ensureSize({fetchFrom: isPastHalfPoint ? "end" : "beginning"})
        },

        _setupCurrentRange: function(firstModel)
        {
            var begin = this.sourceCollection.indexOf(firstModel);
            var currentModels = this.sourceCollection.models.slice(begin, begin + this.maxSize);
            this.set(currentModels);
        },

        _limitSize: function(options)
        {
            var numberToDrop = this.length - this.maxSize;
            if (numberToDrop <= 0) return;

            if (options.dropFrom === "beginning") 
            {
                this.remove(this.first(numberToDrop));
            } else
            {
                this.remove(this.last(numberToDrop));
            }
        },

        _ensureSize: function(options)
        {
            var numberToFetch = this.maxSize - this.length;
            if (numberToFetch <= 0) return;

            if (options.fetchFrom === "beginning")
            {
                this.fetchPrevious(numberToFetch);
            } else
            {
                this.fetchNext(numberToFetch);
            }
        }
    });

    var ScrollableCollectionView = TP.CollectionView.extend({
        constructor: function(options)
        {
            options.firstModel
            options.collection = new ScrollableCollectionViewAdapterCollection({sourceCollection: options.collection});

            TP.CollectionView.prototype.constructor.apply(this, arguments);

            this.scrollThreshold = options.scrollThreshold || 100;

            this.on('before:item:added itemview:before:resize', _.bind(this._stashScrollPosition, this));
            this.on('after:item:added itemview:after:resize', _.bind(this._applyScrollPosition, this));

            this.scrollAnchorCount = 0;
        },

        _stashScrollPosition: function()
        {
            this.scrollAnchorCount++;
            if(this.scrollAnchorCount > 1) return;

            this.scrollAnchor = _.chain(this.children.toArray())
            .map(function(child)
            {
                return {
                    view: child,
                    position: child.$el.position()
                };
            })
            .sortBy(function(item)
            {
                return item.position.top;
            })
            .find(function(item) {
                return item.position.top >= 0;
            })
            .value();
        },

        _applyScrollPosition: function()
        {
            this.scrollAnchorCount--;
            if(this.scrollAnchorCount > 0) return;
            if(!this.scrollAnchor) return;

            var newPosition = this.scrollAnchor.view.$el.position();
            var resizeOffset = newPosition.top - this.scrollAnchor.position.top;
            var newScrollTop = this.$el.scrollTop() + resizeOffset;
            this.$el.scrollTop(newScrollTop);
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var prevEl = collectionView.$el.children()[index]
            if(!prevEl) collectionView.$el.prepend(itemView.$el);
            else $(prevEl).before(itemView.$el);
        },

        onScroll: function()
        {
            // QL: Throttle fetchPrevious/fetchNext
            var scrollTop = this.$el.scrollTop();
            if(scrollTop < this.scrollThreshold) this.collection.fetchPrevious();
            else if(this.$el.height() - scrollTop < this.scrollThreshold) this.collection.fetchNext();
        }

    });

    ScrollableCollectionView.ScrollableCollectionViewAdapterCollection = ScrollableCollectionViewAdapterCollection;

    return ScrollableCollectionView;
});
