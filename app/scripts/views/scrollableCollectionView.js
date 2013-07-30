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
            this.sourceCollection = options.collection;
            this.maxSize = options.minSize || 8;
            this.maxSize = options.maxSize || 25;

            this._bindSourceCollectionEvents();

            // QL: Rename firstModel to ?
            this.centerOnModel(options.firstModel);
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

            var numberToPrepare = numberToFetch - numberToCopy;
            if(numberToPrepare > 0)
            {
                var newModels = this.sourceCollection.preparePrevious(numberToPrepare);
                this.add(newModels, {at: 0});
            }

            this._limitSize({dropFrom: "end"});
        },

        fetchNext: function(numberToFetch)
        {
            var sourceEndIndex = this.sourceCollection.indexOf(this.last()) + 1;
            // If availableModels is less than numberToFetch, we only pull from the source collection
            // otherwise we pull as much as we can from the source collection before fetching more
            var availableModels = this.sourceCollection.length - sourceEndIndex;
            var numberToCopy = _.min([availableModels, numberToFetch]);
            var models = this.sourceCollection.models.slice(sourceEndIndex, sourceEndIndex + numberToCopy);
            this.add(models, {at: this.length});

            var numberToPrepare = numberToFetch - numberToCopy;
            if(numberToPrepare > 0)
            {
                // prepareNext(): collection must immediately instantiate desired number of models, then fetch() each model
                // collection must immediately return these new models, after adding them to its collection
                var newModels = this.sourceCollection.prepareNext(numberToPrepare);
                this.add(newModels, {at: this.length});
            }

            this._limitSize({dropFrom: "beginning"});
        },

        centerOnModel: function(model)
        {
            this.reset(model);
            this.fetchNext(Math.ceil(this.minSize / 2));
            this._ensureSize({fetchFrom: "beginning"});
        },

        _bindSourceCollectionEvents: function()
        {
            this.listenTo(this.sourceCollection, 'add', _.bind(this._onSourceAdd, this));
            this.listenTo(this.sourceCollection, 'remove', _.bind(this._onSourceRemove, this));

            this.listenTo(this.sourceCollection, 'all', function(eventName)
            {
                if(_.contains(['add', 'remove'], eventName)) return;

                this.trigger.apply(this, arguments);
            });
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

            this._ensureSize({fetchFrom: isPastHalfPoint ? "end" : "beginning"});
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
            var numberToFetch = this.minSize - this.length;
            if (numberToFetch <= 0) return;

            if (options.fetchFrom === "beginning")
            {
                this.fetchPrevious(numberToFetch);
            } else
            {
                this.fetchNext(numberToFetch);
            }

            if (options.calledRecursively) return;

            // If there are none to grab from either side, try filling our collection from the opposite end
            this._ensureSize({
                fetchFrom: options.fetchFrom === "beginning" ? "end" : "beginning",
                calledRecursively: true
            });
        }
    });

    var ScrollableCollectionView = TP.CollectionView.extend({
        constructor: function(options)
        {
            var self = this;
            options.firstModel = options.firstModel || options.collection.at(Math.floor(options.collection.length / 2));

            options.collection = new ScrollableCollectionViewAdapterCollection(null, options);

            TP.CollectionView.prototype.constructor.apply(this, arguments);

            this.scrollThreshold = options.scrollThreshold || 1000;
            if (options.batchSize > this.collection.maxSize) options.batchSize = null;
            this.batchSize = Math.ceil(options.batchSize || this.collection.maxSize / 4);
            this.batchSize = 1;

            this.on('before:item:added before:item:removed itemview:before:render itemview:before:resize', _.bind(this._stashScrollPosition, this));
            this.on('after:item:added after:item:removed itemview:render itemview:after:resize', _.bind(this._applyScrollPosition, this));

            this.listenTo(this.collection, 'before:changes', _.bind(this._stashScrollPosition, this));
            this.listenTo(this.collection, 'after:changes', _.bind(this._applyScrollPosition, this));

            this.$el.on('scroll', _.bind(this.onScroll, this));
            this.$el.css('position', 'relative'); // QL: add this to the stylesheet once this view has a common CSS base

            this.scrollAnchorCount = 0;

            this.on('show', function()
            {
                setTimeout(function() {
                    self.scrollToModel(options.firstModel, 0);
                },0);
                
            });
        },

        scrollToModel: function(model, duration)
        {
            var view = this.children.findByModel(model);
            if(!view) {
                this.collection.centerOnModel(model);
                view = this.children.findByModel(model);
            }
            this.$el.scrollTop(view.$el.position().top + view.$el.scrollTop());
            this.scrollAnchor = {
                view: view,
                position: {top: 0}
            };
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

        removeChildView: function(view)
        {
            this.triggerMethod("before:item:removed", view);
            TP.CollectionView.prototype.removeChildView.apply(this, arguments);
            this.triggerMethod("after:item:removed", view);
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var prevEl = collectionView.$el.children()[index];
            if(!prevEl) collectionView.$el.append(itemView.$el);
            else $(prevEl).before(itemView.$el);
        },

        onScroll: function()
        {
            // QL: Throttle fetchPrevious/fetchNext
            var scrollTop = this.$el.scrollTop();
            var scrollBottom = scrollTop + this.$el.height();
            var scrollHeight = this.$el.prop('scrollHeight');
           
            if(scrollTop < this.scrollThreshold) this._fetchMore('top');
            else if(scrollHeight - scrollBottom < this.scrollThreshold) this._fetchMore('bottom');
        },

        _fetchMore: function(edge)
        {
            this._stashScrollPosition();
            if(edge === "top") this.collection.fetchPrevious(this.batchSize);
            else this.collection.fetchNext(this.batchSize);
            this._applyScrollPosition();
        }
    });

    ScrollableCollectionView.ScrollableCollectionViewAdapterCollection = ScrollableCollectionViewAdapterCollection;

    return ScrollableCollectionView;
});
