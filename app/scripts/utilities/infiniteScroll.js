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
          return;
           // _.bindAll(this, "onScrollStop");
           // this.scrollableContainer = this.$(".scrollable");
           // var debouncedScrollStop = _.debounce(this.onScrollStop, 300);
           // this.scrollableContainer.on("scroll", debouncedScrollStop);

           // this.on("close", function ()
           // {
           //     this.scrollableContainer.off("scroll", debouncedScrollStop);
           //     this.scrollableContainer.off("scroll", this.onScroll);
           // }, this);

           // _.bindAll(this, "onScroll");
           // this.scrollableContainer.on("scroll", this.onScroll);

           // this.checkCurrentScrollPosition();
       },

       checkCurrentScrollPosition: function()
       {
           this.trigger("scroll:updatePosition", this.getCurrentVisibleElement());
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

       getHiddenHeightAboveScrollArea: function()
       {
           return this.scrollableContainer.scrollTop();
       },

       getHiddenHeightBelowScrollArea: function()
       {
           var hiddenAboveScrollArea = this.getHiddenHeightAboveScrollArea();
           var totalVisibleHeight = this.scrollableContainer.height();
           var totalContentHeight = this.scrollableContainer[0].scrollHeight;
           return totalContentHeight - (hiddenAboveScrollArea + totalVisibleHeight);
       },

       onScroll: function ()
       {

           var hiddenAboveScrollArea = this.getHiddenHeightAboveScrollArea();
           var hiddenBelowScrollArea = this.getHiddenHeightBelowScrollArea();


           if (hiddenAboveScrollArea <= this.scrollUpThresholdInPx)
           {
               // Within the threshold at the TOP. Add row & request data.
               this.trigger("scroll:top");
           }
           else if (hiddenBelowScrollArea <= this.scrollDownThresholdInPx)
           {
               // Within the threshold at the BOTTOM. Add row & request data.
               this.trigger("scroll:bottom");
           }

           this.throttledCheckForPosition();
           this.trigger("scroll");

           return;
       },

       onScrollStop: function()
       {
           this.trigger("scroll:stop");
       },

       scrollToElement: function(element, snapToSelector, animationTimeout, callback)
       {
          return;

            // var $element = $(element);
            // if (snapToSelector)
            // {
            //     if(!$element.is(snapToSelector))
            //     {
            //         $element = $element.closest(snapToSelector);
            //     }

            //     if(!$element.is(snapToSelector))
            //     {
            //         return;
            //     }
            // }


            // var requestedElementOffsetFromContainer = $element.position().top;
            // var scrollToOffset = Math.round(this.scrollableContainer.scrollTop() + requestedElementOffsetFromContainer - this.scrollableContainer.position().top);


            // if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer < 300)
            // {
            //     animationTimeout = 500;
            // }
            // else if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer > 1500)
            // {
            //     animationTimeout = 2000;
            // }

            // var self = this;

            // if (animationTimeout)
            // {
            //     this.scrollableContainer.animate(
            //         {
            //             scrollTop: scrollToOffset
            //         }, animationTimeout, function() { self.checkCurrentScrollPosition(); if (callback) { callback(); } });
            // } else
            // {
            //     this.scrollableContainer.scrollTop(scrollToOffset);
            //     this.checkCurrentScrollPosition();
            //     if(callback)
            //     {
            //         callback();
            //     }
            // }
       }

   };
    return infiniteScroll;
});
