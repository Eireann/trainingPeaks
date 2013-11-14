define(
[
    "backbone",
    "backbone.marionette",
    "TP"
],
function(Backbone, Marionette, TP)
{
    TP.Region.prototype.show = function(view)
    {
        if(this.currentView === view) return;

        this.ensureEl();
        view.render();

        this.close(function()
        {
            if (this.currentView && this.currentView !== view)
                return;

            this.currentView = view;

            this.open(view, function()
            {
                Backbone.Marionette.triggerMethod.call(view, "show");
                Backbone.Marionette.triggerMethod.call(this, "show", view);
                Backbone.Marionette.triggerMethod.call(this, "view:show", view);
            });
        });

    };

    TP.Region.prototype.close = function(cb)
    {
        var view = this.currentView;
        delete this.currentView;

        if (!view)
        {
            if (cb)
            {
                cb.call(this);
            }
            return;
        }

        var that = this;

        var closeView = function()
        {
            if (view.close)
                view.close();

            that.trigger("view:closed", view);

            if (cb)
                cb.call(that);
        };

        if (!view.fadeOut)
        {
            closeView.call(this);
            return;
        }
        else
            view.fadeOut(closeView);
    };

    TP.Region.prototype.open = function(view, callback)
    {
        var that = this;

        var postOpenView = function()
        {
            if (callback)
                callback.call(that);
        };

        if (!view.fadeIn)
        {
            this.$el.html(view.$el);
            postOpenView.call(this);
            return;
        }
        else
        {
            this.$el.html(view.$el.hide());
            view.fadeIn(postOpenView);
        }
    };
});
