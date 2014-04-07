define(
[
    "jquery",
    "underscore",
    "TP",
    "framework/notYetImplemented"
],
function($, _, TP, notYetImplemented)
{
    return TP.Layout.extend(
    {
        widthClosed: 40,
        widthOpen: 310,
        activeLibraryName: null,

        regions:
        {
            "activeLibraryRegion": "#activeLibraryContainer"
        },

        events:
        {
            "click #tabs > div": "_onTabClick"
        },

        initialize: function(options)
        {
            _.bindAll(this, "_resizeContainerHeight");
            $(window).on("resize.libraryContainer", this._resizeContainerHeight);

            this.views = {};
            this.buildViewOptions = options;
            this.activeLibraryName = null;
            this.on("library:unselect", this.onUnSelect, this);

            this.on("render", this._resizeContainerHeight, this);
            this.on("show", this._resizeContainerHeight, this);
        },

        _onTabClick: function(e)
        {
            this._toggleLibrary(e.target.id);
        },

        _renderLibraryView: function(libraryName)
        {
            // Create & Render library contents
            this.currentLibraryView = this.buildView(libraryName, this.buildViewOptions);
            this.listenTo(this.currentLibraryView, "select", _.bind(this.onSelect, this));
            this.activeLibraryRegion.show(this.currentLibraryView);

            // Open the library container itself
            this.$el.parent().removeClass("closed").addClass("open");
            this.animate({ width: this.widthOpen });
            this._turnOnTab(libraryName);
            this._resizeContainerHeight();

            // Reset scroll to top
            this.$(".scrollable").scrollTop(0);
        },

        _closeLibrary: function()
        {
            this.$el.parent().removeClass("open").addClass("closed");
            this.animate({ width: this.widthClosed });

            if (this.activeLibraryName)
                this._turnOffTab(this.activeLibraryName);
        },

        _toggleLibrary: function(newLibraryName)
        {
            if(!this.viewConstructors.hasOwnProperty(newLibraryName))
            {
                notYetImplemented();
                return;
            }

            if(this._isOpen())
            {
                if(this.activeLibraryName === newLibraryName)
                    this._closeLibrary();
                else
                {
                    this._turnOffTab(this.activeLibraryName);
                    this.activeLibraryName = newLibraryName;
                    this._renderLibraryView(newLibraryName);
                }
            }
            else
            {
                this.activeLibraryName = newLibraryName;
                this._renderLibraryView(newLibraryName);                
            }
        },

        _turnOffTab: function(tabName)
        {
            this.$("#tabs #" + tabName).removeClass("active");
        },

        _turnOnTab: function(tabName)
        {
            this.$("#tabs #" + tabName).addClass("active");
        },

        _isOpen: function()
        {
            return this.$el.parent().hasClass("open");
        },

        animate: function(cssAttributes)
        {
            // allow the calendar or other listeners to hook into our animation
            var duration = 300;
            this.trigger("animate", cssAttributes, duration);

            // run the animation
            this.$el.closest("#libraryContainer").animate(cssAttributes, { duration: duration });
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.ui.activeLibraryContainer.addClass('waiting');
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.ui.activeLibraryContainer.removeClass('waiting');
        },

        _resizeContainerHeight: function(event)
        {
            var headerHeight = $("#navigation").height();
            var windowHeight = $(window).height();
            var libraryHeight = windowHeight - headerHeight - 75 + 'px';

            if (this.$el)
                this.$el.height(libraryHeight);

            this.$("#tabs").css({ height: libraryHeight });
            this.$("#activeLibraryContainer").css({ height: libraryHeight });
        },

        onSelect: function()
        {
            this.trigger("library:select");
        },

        clearSelection: function()
        {
            if(this.currentLibraryView)
                this.currentLibraryView.unSelect();
        }
    });
});
