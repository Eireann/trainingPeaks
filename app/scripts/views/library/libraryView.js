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
        widthClosed: 40,
        widthOpen: 310,

        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function(options)
        {
            this.views =
            {
                exerciseLibrary: new ExerciseLibraryView(
                {
                    exerciseLibraries: options && options.collections && options.collections.exerciseLibraries ?
                        options.collections.exerciseLibraries : new TP.Collection()
                }),
                mealLibrary: new MealLibraryView()
            };

            this.setupDragListeners();


            this.activeLibraryName = null;

            $(window).on("resize", this.resizeContainerHeight);
        },

        setupDragListeners: function()
        {
            this.views.exerciseLibrary.on("itemview:dragItem", this.onDragItem, this);
            this.views.mealLibrary.on("itemview:dragItem", this.onDragItem, this);
        },

        onDragItem: function(itemView, dragPosition)
        {
            this.trigger("dragItem", itemView, dragPosition);
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
            //this.$el.off("clickoutside", this.hideLibrary);
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

        onRender: function()
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

        onShow: function()
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
        }

    });
});