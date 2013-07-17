define(
[
    "underscore",
    "TP"
],
function (_, TP)
{
    var infiniteScroll =
   {
       scrollDownThresholdInPx: 150,
       scrollUpThresholdInPx: 100,

       initializeScrolling: function ()
       {
           _.bindAll(this, "checkCurrentScrollPosition");
           this.trigger("initializeScrolling");
           this.throttledCheckForPosition = _.throttle(this.checkCurrentScrollPosition, 100);

           this.on("render", this.setupScrollingOnRender, this);
       },

       setupScrollingOnRender: function ()
       {
           _.bindAll(this, "onScrollStop");
           this.scrollableContainer = this.$(".scrollable");
           var debouncedScrollStop = _.debounce(this.onScrollStop, 300);
           this.scrollableContainer.on("scroll", debouncedScrollStop);

           this.on("close", function ()
           {
               this.scrollableContainer.off("scroll", debouncedScrollStop);
               this.scrollableContainer.off("scroll", this.onScroll);
           }, this);

           _.bindAll(this, "onScroll");
           this.scrollableContainer.on("scroll", this.onScroll);

           this.checkCurrentScrollPosition();
       },

       checkCurrentScrollPosition: function ()
       {
           this.trigger("updateScrollPosition", this.getCurrentVisibleElement());
       },

       getCurrentVisibleElement: function ()
       {
           if (!document.elementFromPoint)
               return null;

           if (typeof this.scrollableContainer.offset === "undefined")
           {
               return;
           }

           var uiOffset = this.scrollableContainer.offset();
           var $currentElement = $(document.elementFromPoint(uiOffset.left + 10, uiOffset.top + 10));
           return $currentElement;
       },

       onScroll: function ()
       {

           var hidden = this.getHiddenHeight();
           var scrollTop = this.getScrollTop();

           if (scrollTop <= this.scrollUpThresholdInPx)
           {
               // Within the threshold at the TOP. Add row & request data.
               this.trigger("prepend");
           }
           else if (scrollTop >= (hidden - this.scrollDownThresholdInPx))
           {
               // Within the threshold at the BOTTOM. Add row & request data.
               this.trigger("append");
           }

           this.throttledCheckForPosition();
           this.trigger("scroll");

           return;
       },

       onScrollStop: function()
       {
           this.trigger("scroll:stop");
       },

       getScrollTop: function ()
       {
           return this.scrollableContainer.scrollTop();
       },

       getHiddenHeight: function ()
       {
           var howMuchIHave = this.scrollableContainer[0].scrollHeight;
           var howMuchIsVisible = this.scrollableContainer.height();
           var hidden = howMuchIHave - howMuchIsVisible;
           return hidden;
       }
   };
    return infiniteScroll;
});