define(
[
    "underscore",
    "jqueryOutside",
    "TP",
    "views/library/exerciseLibraryView",
    "views/library/mealLibraryView",
    "hbs!templates/views/library/libraryView"
],
function(_, jqueryOutside, TP, ExerciseLibraryView, MealLibraryView, libraryTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function(options)
        {
            this.views = {
                exerciseLibrary: new ExerciseLibraryView({
                    collection: options && options.collections && options.collections.exerciseLibrary ?
                        options.collections.exerciseLibrary : new TP.Collection()
                }),
                mealLibrary: new MealLibraryView()
            };

            this.activeLibraryName = null;

            $(window).on("resize", this.resizeContext);
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
            } else
            {
                if (this.isOpen())
                {
                    this.hideLibrary();
                } else
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
                    this.views[this.activeLibraryName].$el.hide(200);
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
            this.views[this.activeLibraryName].$el.show(300, function() { self.trigger("showLibrary"); });
            this.$el.parent().removeClass("closed").addClass("open");
            this.turnOnTab(this.activeLibraryName);
            this.resizeContext();

            this.hideOnClickOutside();
        },

        hideLibrary: function()
        {
            this.$el.off("clickoutside", this.hideLibrary);
            this.$el.parent().removeClass("open").addClass("closed");
            if (this.activeLibraryName)
            {
                var self = this;
                this.views[this.activeLibraryName].$el.hide(300, function() { self.trigger("hideLibrary"); });
                this.turnOffTab(this.activeLibraryName);
            }
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

        onRender: function()
        {
            for (var libraryName in this.views)
            {
                var library = this.views[libraryName];
                library.render();
                this.ui.activeLibraryContainer.append(library.$el);
                library.$el.hide();
            }
            this.resizeContext();
        },

        hideOnClickOutside: function()
        {
            _.bindAll(this, "hideLibrary");
            this.$el.on("clickoutside", this.hideLibrary);
        },

        onShow: function()
        {
            this.resizeContext();
        },

        resizeContext: function(event)
        {
            var headerHeight = $("#navigation").height();
            var windowHeight = $(window).height();
            var libraryHeight = windowHeight - headerHeight - 75 + 'px';
            this.$("#tabs").css({ height: libraryHeight });
            this.$("#activeLibraryContainer").css({ height: libraryHeight });
        }

    });
});