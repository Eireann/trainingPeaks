﻿define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
    )
{

    return TP.ItemView.extend(
    {

        widthClosed: 40,
        widthOpen: 310,
        activeLibraryName: null,

        initialize: function(options)
        {
            this.initWindowResize();
            this.buildViews(options);
            this.listenToViewEvents();
            this.activeLibraryName = null;
            this.on("library:unselect", this.onUnSelect, this);

            this.on("render", this.renderLibrariesOnRender, this);
            this.on("show", this.resizeOnShow, this);
        },

        initWindowResize: function()
        {
            _.bindAll(this, "resizeContainerHeight");
            $(window).on("resize", this.resizeContainerHeight);
        },

        buildViews: function(options)
        {
            this.views = {};
        },

        listenToViewEvents: function()
        {
            _.each(_.keys(this.views), function(viewName)
            {
                this.views[viewName].on("select", this.onSelect, this);
            }, this);
        },

        ui:
        {
            "activeLibraryContainer": "#activeLibraryContainer"
        },

        events:
        {
            "click #tabs > div": "onTabClick"
        },

        onTabClick: function(e)
        {
            this.toggleLibrary(e.target.id);
        },

        toggleLibrary: function(newLibraryName)
        {
            if (newLibraryName !== this.activeLibraryName)
            {
                this.switchLibrary(newLibraryName);
            }
            else
            {
                if (this.isOpen())
                {
                    this.hideLibrary();
                }
                else
                {
                    this.showLibrary();
                }
            }
        },

        switchLibrary: function(newLibraryName)
        {
            if (newLibraryName && this.views.hasOwnProperty(newLibraryName))
            {
                if (this.activeLibraryName && newLibraryName !== this.activeLibraryName)
                {
                    this.views[this.activeLibraryName].$el.hide();
                    this.turnOffTab(this.activeLibraryName);
                }
                this.activeLibraryName = newLibraryName;
                this.showLibrary();
            }
        },

        turnOffTab: function(tabName)
        {
            this.$("#tabs #" + tabName).removeClass("active");
        },

        turnOnTab: function(tabName)
        {
            this.$("#tabs #" + tabName).addClass("active");
        },

        isOpen: function()
        {
            return this.$el.parent().hasClass("open");
        },

        showLibrary: function()
        {
            for (var libraryName in this.views)
            {
                if (libraryName !== this.activeLibraryName)
                {
                    this.views[libraryName].$el.hide();
                }
            }

            var self = this;
            this.views[this.activeLibraryName].$el.show();

            this.$el.parent().removeClass("closed").addClass("open");
            this.animate({ width: this.widthOpen });
            this.turnOnTab(this.activeLibraryName);
            this.resizeContainerHeight();

        },

        hideLibrary: function()
        {
            if (!this.isOpen())
                return;

            this.$el.parent().removeClass("open").addClass("closed");
            this.animate({ width: this.widthClosed });
            if (this.activeLibraryName)
            {
                var self = this;
                this.views[this.activeLibraryName].$el.hide(200);
                this.turnOffTab(this.activeLibraryName);
            }
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

        renderLibrariesOnRender: function()
        {
            for (var libraryName in this.views)
            {
                var library = this.views[libraryName];
                library.render();
                this.ui.activeLibraryContainer.append(library.$el);
                library.$el.hide();
            }
            this.resizeContainerHeight();
        },

        resizeOnShow: function()
        {
            this.resizeContainerHeight();
        },

        resizeContainerHeight: function(event)
        {
            var headerHeight = $("#navigation").height();
            var windowHeight = $(window).height();
            var libraryHeight = windowHeight - headerHeight - 75 + 'px';
            if (this.$el)
            {
                this.$el.height(libraryHeight);
            }
            this.$("#tabs").css({ height: libraryHeight });
            this.$("#activeLibraryContainer").css({ height: libraryHeight });
        },

        onSelect: function()
        {
            this.trigger("library:select");
        },

        onUnSelect: function()
        {
            for (var libraryName in this.views)
            {
                var library = this.views[libraryName];
                library.trigger("library:unselect");
            }
        }

    });
});