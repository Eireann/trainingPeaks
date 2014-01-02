define(
[
    "jquery",
    "underscore",
    "jqueryui/draggable",
    "jqueryui/resizable",
    "packery",
    "TP"
],
function(
    $,
    _,
    jqueryDraggable,
    jqueryResizable,
    packery,
    TP
    )
{

    var PackeryCollectionView = TP.CollectionView.extend(
    {
        className: "packeryCollection",

        initialize: function(options)
        {
            this.options = _.merge(options,
            {
                packery:
                {
                    rowHeight: 390,
                    columnWidth: 390,
                    gutter: 10
                },
                resizable: { enabled: false },
                droppable: { enabled: false, scope: "packery" },
                draggable: { scope: "packery-items" }
            }, _.defaults);

            PackeryCollectionView.__super__.initialize.apply(this, arguments);

            this.tmp = {}; // Placeholder for view being dragged

            this.on("show", _.bind(this._setupPackery, this, options));
            this.on("collection:before:close", this._beforeClose, this);
            this._setupDroppable(options);

            _.bindAll(this, "_moveDraggableForPackery");
        },

        layout: function()
        {
            if(this.packery && !this.isClosing)
            {
                this.children.call("trigger", "pod:resize");
                this.$el.packery("layout");
                this._updatePackerySort();
            }
        },

        enablePackeryResize: function()
        {
            this.$el.packery("bindResize");
        },

        disablePackeryResize: function()
        {
            this.$el.packery("unbindResize");
        },

        _setupPackery: function(options)
        {
            if(options.packery.rowHeight instanceof Element)
            {
                this.$el.after(options.packery.rowHeight);
            }

            if(options.packery.columnWidth instanceof Element)
            {
                this.$el.after(options.packery.columnWidth);
            }

            this.children.call("trigger", "pod:resize");
            this.packery = this.$el.packery(options.packery).data("packery");

            this.packery.on("dragItemPositioned", _.bind(this._updatePackerySort, this));
            this.children.each(function(itemView)
            {
                this._setupPackeryItem(itemView, this);
            }, this);
        },

        _setupDroppable: function()
        {
            if(this.options.droppable.enabled)
            {
                this.$el.droppable({
                    scope: this.options.droppable.scope,
                    over: _.bind(this._addDraggableToPackery, this),
                    out:  _.bind(this._removeDraggableFromPackery, this),
                    drop: _.bind(this._dropDraggableIntoPackery, this)
                });
            }
        },

        _updatePackerySort: function()
        {
            _.each(this.packery.getItemElements(), function(itemEl, index)
            {
                var $item = $(itemEl);
                var view = $item.data("view"); // Can we get this without working the view on the el
                if(view && view.model)
                {
                    view.model.set("index", index); // silent is not necessary anymore
                }
            });
            this.trigger("reorder");
        },

        // Overrides CollectionView
        appendHtml: function(collectionView, itemView, index)
        {
            itemView.$el.data("view", itemView);
            collectionView.$el.append(itemView.el);
            itemView.trigger("pod:resize");

            if (!this.packery) return;

            if (index >= 0)
            {
                this.packery.appended(itemView.$el);
                this._setupPackeryItem(itemView, collectionView);
            }
            else
            {
                this.packery.addItems(itemView.$el);
            }
        },

        // Overrides CollectionView
        addChildView: function(item, colleciton, options)
        {
            if(this.tmp.view && this.tmp.view.model === item) return;

            this.addingTemporary = options && options.temporary;
            return PackeryCollectionView.__super__.addChildView.apply(this, arguments);
        },

        // Overrides CollectionView
        closeChildren: function()
        {
            this.packery = null;
            PackeryCollectionView.__super__.closeChildren.apply(this, arguments);
        },

        // Overrides CollectionView
        removeChildView: function(view)
        {
            if(this.packery)
            {
                this.packery.remove(view.el);
            }
            PackeryCollectionView.__super__.removeChildView.apply(this, arguments);
            if(this.packery)
            {
                this.layout();
            }
            return this;
        },

        _setupResizable: function(view)
        {
            var self = this;
            view.$el.resizable(
            {
                resize: function(event, ui)
                {
                    var x = self.options.packery.columnWidth;
                    var y = self.options.packery.rowHeight;

                    var width = _.isNumber(x) ? x : $(x).width();
                    var height = _.isNumber(y) ? y : $(y).height();

                    var cols = Math.round((ui.size.width + self.options.packery.gutter) / (width + self.options.packery.gutter));
                    var rows = Math.round((ui.size.height + self.options.packery.gutter) / (height + self.options.packery.gutter));

                    ui.element.data(
                    {
                        "rows": rows,
                        "cols": cols
                    });

                    ui.element.data("view").trigger("pod:resize");
                    self.$el.packery('fit', ui.element[0]);
                },

                stop: function(event, ui)
                {
                    ui.element.data("view").trigger("pod:resize:stop");
                }
            });
        },

        _setupPackeryItem: function(itemView, collectionView)
        {
            var self = this;

            itemView.$el.draggable(this.options.draggable);
            collectionView.packery.bindUIDraggableEvents(itemView.$el);

            if(this.options.resizable.enabled)
            {
                collectionView._setupResizable(itemView);
            }
        },

        _moveDraggableForPackery: function(event, ui)
        {
            this.tmp.view.$el.offset(ui.offset);
            var position = this.tmp.view.$el.position();
            this.packery.itemDragMove(
                this.tmp.view.el,
                position.left + this.$el.scrollLeft(),
                position.top + this.$el.scrollTop()
            );
        },

        _addDraggableToPackery: function(event, ui) {
            if (this.tmp.view) return; // Just in case draggable gets confused

            this.tmp.draggable = ui.draggable;
            this.tmp.model = new this.collection.model(ui.draggable.data("model").attributes, this.collection.modelOptions);
            this.addChildView(this.tmp.model, this.collection, {temporary: true});
            this.tmp.view = this.children.last();
            this.tmp.view.$el.addClass("ui-draggable-dragging");

            this.tmp.view.$el.css("position", "absolute");

            ui.helper.css("visibility", "hidden");

            this.packery.itemDragStart(this.tmp.view.el);
            this._moveDraggableForPackery(event, ui);
            ui.draggable.on("drag", this._moveDraggableForPackery);
        },

        _removeDraggableFromPackery: function(event, ui) {
            if (this.tmp.draggable !== ui.draggable) return;

            ui.helper.css("visibility", "visibile");

            this.removeChildView(this.tmp.view);

            this.packery.itemDragEnd(this.tmp.view.el);
            ui.draggable.off("drag", this._moveDraggableForPackery);

            this.tmp.view = undefined;
        },

        _dropDraggableIntoPackery: function(event, ui) {
            if (this.tmp.draggable !== ui.draggable) return;

            this.packery.itemDragEnd(this.tmp.view.el);
            ui.draggable.off("drag", this._moveDraggableForPackery);

            this.collection.add(this.tmp.view.model);
            this._updatePackerySort();

            this.tmp.view.$el.removeClass("ui-draggable-dragging"); // TODO: Is this OK or too coupled?
            this._setupPackeryItem(this.tmp.view, this);
            this.tmp = {};
        },

        _beforeClose: function()
        {
            this.isClosing = true;
        }
    });

    return PackeryCollectionView;
});

