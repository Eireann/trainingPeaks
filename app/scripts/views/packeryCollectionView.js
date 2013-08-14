define(
[
    "underscore",
    "jqueryui/draggable",
    "packery",
    "TP"
],
function(
    _,
    jqueryDraggable,
    packery,
    TP
    )
{

    // because packery doesn't work with node
    if(!$.fn.packery)
    {
        return TP.CollectionView;
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

            PackeryCollectionView.__super__.initialize.apply(this, arguments);

            this.tmp = {}; // Placeholder for view being dragged

            this._setupPackery(options);
            this._setupDroppable(options);

            _.bindAll(this, "_moveDraggableForPackery");
        },

        _setupPackery: function(options)
        {
            this.packery = this.$el.packery(options.packery).data("packery");

            this.packery.on("dragItemPositioned", _.bind(this._updatePackerySort, this));
            this.on("show", function()
            {
                this.$el.packery("layout");
            });
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

            if(index >= 0)
            {
                this.packery.appended(itemView.$el);
                this._setupPackeryDraggable(itemView, collectionView);
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
        removeChildView: function(view)
        {
            this.packery.remove(view.el);
            return PackeryCollectionView.__super__.removeChildView.apply(this, arguments);
        },

        _setupPackeryDraggable: function(itemView, collectionView)
        {
            itemView.$el.draggable();
            collectionView.packery.bindUIDraggableEvents(itemView.$el);
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
                this.tmp.model = ui.draggable.data("model");
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
            this._setupPackeryDraggable(this.tmp.view, this);
            this.tmp = {};
        }
    });

    return PackeryCollectionView;
});

