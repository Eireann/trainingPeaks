﻿define(
[
    "underscore",
    "TP",
    "views/calendarWeekView",
    "hbs!templates/views/customCalendar"
],
function(_, TP, CalendarWeekView, customCalendarTemplate)
{
    return TP.ItemView.extend(
    {
        $weeksContainer: null,
        
        children: [],
        
        template:
        {
            type: "handlebars",
            template: customCalendarTemplate
        },

        ui:
        {
            "weeksContainer": "#weeksContainer"
        },

        modelEvents:
        {
            "change": "render"
        },

        collectionEvents:
        {
            "add": "onAddWeek",
            "reset": "render"
        },

        onAddWeek: function (model)
        {
            var weekCollection = model.get("week");
            this.addWeek({ model: model, collection: weekCollection, append: arguments[2].append });
        },

        addWeek: function(options)
        {
            var weekView = new CalendarWeekView({ collection: options.collection, model: options.model });
            weekView.on("itemview:itemMoved", this.onItemMoved, this);
            
            if (options.append)
                this.ui.weeksContainer.append(weekView.render().el);
            else
            {
                this.ui.weeksContainer.prepend(weekView.render().el);
                this.ui.weeksContainer.scrollTop(this.ui.weeksContainer.scrollTop() + weekView.$el.height());
            }

            // display waiting indicator, then once controller loads the models they will turn off via sync event
            weekView.onWaitStart();

            this.children.push(weekView);
        },

        onRender: function()
        {
            if (!this.collection)
                throw "CalendarView needs a Collection!";

            _.bindAll(this, "onScroll");
            this.ui.weeksContainer.scroll(_.debounce(this.onScroll, 30));

            var numWeeks = this.collection.length;
            var i = 0;

            for (; i < numWeeks; i++)
            {
                var weekModel = this.collection.at(i);
                this.addWeek({ model: weekModel, collection: weekModel.get("week"), append: true });
            }

        },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.scrollToToday();
        },
        
        onScroll: function()
        {
            window.theMarsApp.logger.debug("onScroll ...");
            var howMuchIHave = this.ui.weeksContainer[0].scrollHeight;
            var howMuchIsVisible = this.ui.weeksContainer.height();
            var hidden = howMuchIHave - howMuchIsVisible;
            var scrollDownThresholdInPx = 150;
            var scrollUpThresholdInPx = 100;

            if (this.ui.weeksContainer.scrollTop() <= scrollUpThresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if (this.ui.weeksContainer.scrollTop() >= (hidden - scrollDownThresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            return;
        },

        scrollToToday: function()
        {
            var lastWeekOffset = this.$('.today').parent().prev().offset().top;
            var weeksContainerOffset = this.ui.weeksContainer.offset().top;
            this.ui.weeksContainer.scrollTop(lastWeekOffset - weeksContainerOffset);
        },

        onItemMoved: function(itemView, options)
        {
            this.trigger("itemMoved", options);
        }
    });
});