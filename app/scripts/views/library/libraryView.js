define(
[
    "underscore",
    "TP",
    "views/library/exerciseLibraryView",
    "views/library/mealLibraryView",
    "hbs!templates/views/library/libraryView"
],
function(_, TP, ExerciseLibraryView, MealLibraryView, libraryTemplate)
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

        isOpen: function()
        {
            return this.$el.parent().hasClass("open");
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

        hideLibrary: function(afterHide)
        {
            if (this.isOpen())
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
            } else
            {
                this.turnOffTab(this.activeLibrary.libraryName);
                if (typeof afterHide === 'function')
                {
                    afterHide();
                }
            }
        },

        toggleLibrary: function()
        {
            if (this.isOpen())
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