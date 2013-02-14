define(
[
    "underscore",
    "TP",
    "views/library/workoutLibraryView",
    "views/library/mealLibraryView",
    "hbs!templates/views/library/libraryView"
],
function(_, TP, WorkoutLibraryView, MealLibraryView, libraryTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function()
        {
            this.views = {
                workoutLibrary: new WorkoutLibraryView(),
                mealLibrary: new MealLibraryView()
            };

            this.activeLibrary = null;
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
            var libraryName = e.target.id;
            if (libraryName)
            {
                this.switchLibrary(libraryName);
            }
        },

        switchLibrary: function(libraryName)
        {

            this.onWaitStart();

            var newLibrary = this.views.hasOwnProperty(libraryName) ? this.views[libraryName] : this.activeLibrary;
            if (newLibrary !== this.activeLibrary)
            {

                // setup the new library
                var view = this;
                var showNewLibrary = function()
                {
                    view.activeLibrary = newLibrary;
                    view.renderActiveLibrary();
                    view.showLibrary();
                    view.onWaitStop();
                };

                // detach the old library if needed
                if (this.activeLibrary)
                {
                    this.activeLibrary.close();
                    this.hideLibrary(showNewLibrary);
                } else
                {
                    showNewLibrary();
                }


            } else
            {
                this.toggleLibrary();
                this.onWaitStop();
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

        showLibrary: function()
        {
            if (!this.isOpen())
            {
                this.ui.activeLibraryContainer.fadeIn(600);
                this.$el.parent().removeClass("closed").addClass("open");
            }
            this.turnOnTab(this.activeLibrary.libraryName);
        },

        isOpen: function()
        {
            return this.$el.parent().hasClass("open");
        },

        hideLibrary: function(afterHide)
        {
            if (this.$el.parent().hasClass("open"))
            {
                var container = this.$el.parent();
                var view = this;
                var callbackAfterHide = function()
                {
                    view.turnOffTab(view.activeLibrary.libraryName);
                    container.removeClass("open").addClass("closed");
                    if (typeof afterHide === 'function')
                    {
                        afterHide();
                    }
                };
                this.ui.activeLibraryContainer.fadeOut(300, callbackAfterHide);
            } else if (typeof afterHide === 'function')
            {

                this.turnOffTab(this.activeLibrary.libraryName);
                afterHide();
            }
        },

        toggleLibrary: function()
        {
            if (this.$el.parent().hasClass("open"))
            {
                this.hideLibrary();
            } else
            {
                this.showLibrary();
            }
        },

        renderActiveLibrary: function()
        {
            this.ui.activeLibraryContainer.html("");

            // reattach events that may have been removed on close ...
            this.activeLibrary.delegateEvents();
            this.activeLibrary.render();

            this.ui.activeLibraryContainer.append(this.activeLibrary.$el);
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
        }

    });
});