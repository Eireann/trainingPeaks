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
            this.minSize = options.minSize || 8;
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
            this.trigger("before:changes"); // Warn that lots of changes are coming
            model = model || this.sourceCollection.at(Math.floor(this.sourceCollection.length / 2));
            if(!model) return;

            this.reset(model);
            this.fetchNext(Math.ceil(this.minSize / 2));
            this._ensureSize({fetchFrom: "beginning"});
            this.trigger("after:changes"); // Notify that batch changes are finished
        },

        _bindSourceCollectionEvents: function()
        {
            this.listenTo(this.sourceCollection, 'add', _.bind(this._onSourceAdd, this));
            this.listenTo(this.sourceCollection, 'remove', _.bind(this._onSourceRemove, this));
            this.listenTo(this.sourceCollection, 'reset', function()
            {
                this.reset();
            });

            this.listenTo(this.sourceCollection, 'all', function(eventName)
            {
                if(_.contains(['add', 'remove', 'reset'], eventName)) return;

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

    var ScrollableCollectionView = TP.CompositeView.extend({
        template: _.template('<div class="js-wrap"></div>'),

        ui:
        {
            $wrap: ".js-wrap"
        },

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


            this.$el.css('position', 'relative'); // QL: add this to the stylesheet once this view has a common CSS base

            this.scrollAnchorCount = 0;

            this.snapToChild = _.debounce(this.snapToChild, 1000);

            this.on('render', function()
            {
                this.wrapMargin = 0;
                this.$el.on('scroll', function(event)
                {


                    if(self.scrollAnimationDeferred && self.scrollAnimationDeferred.state() === "pending") return;

                    clearTimeout(self.scrollingTimeout);

                    // QL: Throttle fetchPrevious/fetchNext
                    var scrollTop = self.$el.scrollTop();
                    var scrollBottom = scrollTop + self.$el.height();
                    var scrollHeight = self.$el.prop('scrollHeight');

                    if(scrollTop < self.scrollThreshold) {
                        self._fetchMore('top');
                    }
                    else if(scrollHeight - scrollBottom < self.scrollThreshold) {
                        self._fetchMore('bottom');
                    }

                    self.snapToChild();

                    if (options.onScrollEnd) {
                        self.scrollingTimeout = setTimeout(function() {
                            options.onScrollEnd();
                        }, 400);
                    }
                });
            });

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
            clearTimeout(this.scrollStopTimeout);
            if(!view) {
                this.collection.centerOnModel(model);
                view = this.children.findByModel(model);
                duration = 0;
            }
            var scrollTop = view.$el.position().top + this.$el.scrollTop();
            this._animateScroll(scrollTop, duration);
            this.scrollAnchor = {
                view: view,
                position: {top: 0}
            };
        },

        getCurrentModel: function()
        {
            return this._closestChildToTop().view.model;
        },

        getVisibleModels: function()
        {
            var height = this.$el.height();
            var models = this.children.select(function(view)
            {
                var position = view.$el.position();
                position.bottom = position.top + view.$el.height();
                var isTopVisibleAtBottom = position.top >= 0 && position.top <= height;
                var isBottomVisibleAtTop = position.bottom >= 0 && position.bottom <= height;
                var isMiddleVisible = position.top <= 0 && position.bottom >= height;
                return isTopVisibleAtBottom || isBottomVisibleAtTop || isMiddleVisible;
            }).map(function(view)
            {
                view.model.view = view;
                return view.model;
            });

            return models;
        },

        _animateScroll: function(scrollTop, duration) {
            var self = this;
            var scrollDelta = Math.abs(scrollTop - this.$el.scrollTop());
            if(scrollDelta <= 1) return;

            this.scrollAnimationDeferred = new $.Deferred();
            this.$el.animate({scrollTop: scrollTop}, duration || 0, function() {
                self.scrollAnimationDeferred.resolve();
                self.$el.trigger('scroll');
            });
        },

        _stashScrollPosition: function()
        {
            this.scrollAnchorCount++;
            if(this.scrollAnchorCount > 1) return;

            this.scrollAnchor = this._closestChildToTop();
        },

        _closestChildToTop: function() {
            return _.chain(this.children.toArray())
            .map(function(child)
            {
                return {
                    view: child,
                    position: child.$el.position()
                };
            })
            .sortBy(function(item)
            {
                return Math.abs(item.position.top);
            })
            .first()
            .value();
        },

        _applyScrollPosition: function()
        {
            this.scrollAnchorCount--;
            if(this.scrollAnchorCount > 0) return;
            if(!this.scrollAnchor) return;

            var self = this;
            var newPosition = this.scrollAnchor.view.$el.position();
            var resizeOffset = newPosition.top - this.scrollAnchor.position.top;

            var animationPromise = this.$el.promise();
            if(animationPromise.state() !== "pending") {
                var newScrollTop = self.$el.scrollTop() + resizeOffset;
                self.$el.scrollTop(newScrollTop);
            } else
            {
                this.wrapMargin += resizeOffset;
                this.ui.$wrap.css("margin-top", (-this.wrapMargin) + 'px');
                this.$el.promise().done(function()
                {
                    if(self.wrapMaring === 0) return;
                    var newScrollTop = self.$el.scrollTop() + self.wrapMargin;
                    self.ui.$wrap.css("margin-top", '0px');
                    self.$el.scrollTop(newScrollTop);
                    self.wrapMargin = 0;
                });
            }
        },

        lockScrollPosition: function()
        {
            this._stashScrollPosition();
        },

        unlockScrollPosition: function()
        {
            this._applyScrollPosition();
        },

        resetScrollPosition: function()
        {
            this._applyScrollPosition();
            this.scrollAnchorCount++;
        },

        removeChildView: function(view)
        {
            var self = this;

            var $dragging = view.$el.find('.dragging, .ui-draggable-draging');
            if($dragging.length > 0)
            {
                $dragging.on("dragstop", function(event, ui) { self.removeChildView(view); });
            } else {
                this.triggerMethod("before:item:removed", view);
                TP.CollectionView.prototype.removeChildView.apply(this, arguments);
                this.triggerMethod("after:item:removed", view);
            }
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var prevEl = collectionView.ui.$wrap.children()[index];
            if(!prevEl) collectionView.ui.$wrap.append(itemView.$el);
            else $(prevEl).before(itemView.$el);
        },

        snapToChild: function()
        {
            if (this.$el.is(':animated')) {
                return;
            }
            clearTimeout(this.scrollStopTimeout);
            var closestChild = this._closestChildToTop();
            var offset = Math.abs(closestChild.position.top);
            if (offset < 100)
            {
                this.scrollToModel(closestChild.view.model, 500);
            }
        },

        _fetchMore: function(edge)
        {
            var self = this;
            var callback = function() {
                self._stashScrollPosition();
                if(edge === "top")
                {
                    self.collection.fetchPrevious(self.batchSize);
                } else {
                    self.collection.fetchNext(self.batchSize);
                }

                self._applyScrollPosition();
            };

            if (this.scrollAnimationDeferred) {
                this.scrollAnimationDeferred.done(callback);
            } else {
                callback();
            }

        }
    });

    ScrollableCollectionView.ScrollableCollectionViewAdapterCollection = ScrollableCollectionViewAdapterCollection;

    return ScrollableCollectionView;
});
