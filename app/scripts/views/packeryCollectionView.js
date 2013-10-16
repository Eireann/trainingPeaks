define(
[
    "underscore",
    "jqueryui/draggable",
    "jqueryui/resizable",
    "packery",
    "TP"
],
function(
    _,
    jqueryDraggable,
    jqueryResizable,
    packery,
    TP
    )
{

    // because packery doesn't work with node
    if(!$.fn.packery)
    {
        return TP.CollectionView.extend({
            layout: function() { return; },
            enablePackeryResize: function() { return; },
            disablePackeryResize: function() { return; }
        });
    }

    var PackeryCollectionView = TP.CollectionView.extend({
        className: "packeryCollection",

        initialize: function(options)
        {

            _.defaults(options, {
                packery:
                {
                    rowHeight: 410,
                    columnWidth: 410,
                    gutter: 10
                }
            });

            this.resizable = options.resizable;
            this.packeryOptions = options.packery;

            PackeryCollectionView.__super__.initialize.apply(this, arguments);

            this.tmp = {}; // Placeholder for view being dragged

            this.on("show", _.bind(this._setupPackery, this, options));
            this._setupDroppable(options);

            _.bindAll(this, "_moveDraggableForPackery");
        },

        layout: function()
        {
            if(this.packery)
            {
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
            this.packery = this.$el.packery(options.packery).data("packery");

            if(options.packery.rowHeight instanceof Element)
            {
                this.$el.after(options.packery.rowHeight);
            }

            if(options.packery.columnWidth instanceof Element)
            {
                this.$el.after(options.packery.columnWidth);
            }

            this.packery.on("dragItemPositioned", _.bind(this._updatePackerySort, this));
            this.children.each(function(itemView)
            {
                this._setupPackeryItem(itemView, this);
            }, this);
        },

        _setupDroppable: function()
        {
            this.$el.droppable({
                over: _.bind(this._addDraggableToPackery, this),
                out:  _.bind(this._removeDraggableFromPackery, this),
                drop: _.bind(this._dropDraggableIntoPackery, this)
            });
        },

        _updatePackerySort: function()
        {
            _.each(this.packery.getItemElements(), function(itemEl, index)
            {
                var $item = $(itemEl);
                var view = $item.data("view"); // Can we get this without working the view on the el
                view.model.set("index", index, { silent: true }); // TODO: Should store this differently?
            });
            this.trigger("reorder");
        },

        // Overrides CollectionView
        appendHtml: function(collectionView, itemView, index)
        {
            itemView.$el.data("view", itemView);
            collectionView.$el.append(itemView.el);

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
            view.$el.resizable({
                start: function(event, ui)
                {
                    var x = self.packeryOptions.columnWidth;
                    var y = self.packeryOptions.rowHeight;

                    var width = _.isNumber(x) ? x : $(x).width();
                    var height = _.isNumber(y) ? y : $(y).height();

                    view.$el.resizable("option", {
                        grid: [ width + self.packeryOptions.gutter, height + self.packeryOptions.gutter ],
                        minWidth: width,
                        minHeight: height * 2,
                        maxWidth: self.$el.width(),
                        maxHeight: self.$el.height()
                    });
                },

                resize: function(event, ui)
                {
                    self.$el.packery('fit', ui.element[0]);
                    ui.element.data("view").trigger("controller:resize");
                },

                stop: function(event, ui)
                {
                    var x = self.packeryOptions.columnWidth;
                    var y = self.packeryOptions.rowHeight;

                    var width = _.isNumber(x) ? x : $(x).width();
                    var height = _.isNumber(y) ? y : $(y).height();

                    var cols = Math.round((ui.element.width() + self.packeryOptions.gutter) / (width + self.packeryOptions.gutter));
                    var rows = Math.round((ui.element.height() + self.packeryOptions.gutter) / (height + self.packeryOptions.gutter));

                    ui.element.css({
                        width: "",
                        height: ""
                    });

                    ui.element.attr(
                    {
                        "data-rows": rows,
                        "data-cols": cols
                    });

                    self.$el.packery('fit', ui.element[0]);
                    ui.element.data("view").trigger("controller:resize");
                }
            });
        },

        _setupPackeryItem: function(itemView, collectionView)
        {
            var self = this;

            itemView.$el.draggable({ scope: "packery" });
            collectionView.packery.bindUIDraggableEvents(itemView.$el);

            if(this.resizable)
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
            if(ui.draggable.hasClass("chartTile")) // TODO: Make generic
            {
                if (this.tmp.view) return; // Just in case draggable gets confused

                this.tmp.draggable = ui.draggable;
                this.tmp.model = new this.collection.model(ui.draggable.data("model").attributes, this.collection.modelOptions);
                this.addChildView(this.tmp.model, this.collection, {temporary: true});
                this.tmp.view = this.children.last();
                this.tmp.view.$el.addClass("hover");

                this.tmp.view.$el.css("position", "absolute");

                ui.helper.css("visibility", "hidden");

                this.packery.itemDragStart(this.tmp.view.el);
                this._moveDraggableForPackery(event, ui);
                ui.draggable.on("drag", this._moveDraggableForPackery);
            }
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

            this.tmp.view.$el.removeClass("hover"); // TODO: Is this OK or too coupled?
            this._setupPackeryItem(this.tmp.view, this);
            this.tmp = {};
        }
    });

    return PackeryCollectionView;
});

