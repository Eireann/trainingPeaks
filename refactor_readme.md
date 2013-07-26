# Copy/paste
Remove event chain that propogates copy/cut events through the model->collection->calendarCollectionCopyPaste.
Instead, move logic out of the individual collections and into the clipboard controller. Call handler directly instead of going through event chain.
Example: dayModel.trigger("day:select"); -> this.model.on("day:select", this.select, this); -> this.$el.addClass("selected");

# Infinite Scroll
CalendarCollection is communicating options to its views when a model is .add()ed to the collection. A lot of collection code manages this (should it prepend? append?), but the view can infer this information from the model's place in the collection.
InfiniteScrollCollectionView should manage all scrolling for a given collection. It knows how to request data when a user scrolls offscreen and tell the collection to render a given subset of data. 

# Questions
Why are classes extended at the end of the file, instead of at the beginning?
Make sure standard class file names (views, models) have the appropriate view/model suffix.