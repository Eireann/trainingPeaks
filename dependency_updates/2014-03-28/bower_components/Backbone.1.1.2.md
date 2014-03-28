Change Log

1.1.2 — Feb. 20, 2014 — Diff — Docs 
Backbone no longer tries to require jQuery in Node/CommonJS environments, for better compatibility with folks using Browserify. If you'd like to have Backbone use jQuery from Node, assign it like so: Backbone.$ = require('jquery');  
Bugfix for route parameters with newlines in them.  

1.1.1 — Feb. 13, 2014 — Diff — Docs  
Backbone now registers itself for AMD (Require.js), Bower and Component, as well as being a CommonJS module and a regular (Java)Script. Whew.  
Added an execute hook to the Router, which allows you to hook in and custom-parse route arguments, like query strings, for example.  
Performance fine-tuning for Backbone Events.  
Better matching for Unicode in routes, in old browsers.  

1.1.0 — Oct. 10, 2013 — Diff — Docs  
Made the return values of Collection's set, add, remove, and reset more useful. Instead of returning this, they now return the changed (added, removed or updated) model or list of models.  
Backbone Views no longer automatically attach options passed to the constructor as this.options and Backbone Models no longer attach url and urlRoot options, but you can do it yourself if you prefer.  
All "invalid" events now pass consistent arguments. First the model in question, then the error object, then options.  
You are no longer permitted to change the id of your model during parse. Use idAttribute instead.  
On the other hand, parse is now an excellent place to extract and vivify incoming nested JSON into associated submodels.  
Many tweaks, optimizations and bugfixes relating to Backbone 1.0, including URL overrides, mutation of options, bulk ordering, trailing slashes, edge-case listener leaks, nested model parsing...  

1.0.0 — March 20, 2013 — Diff — Docs  
Renamed Collection's "update" to set, for parallelism with the similar model.set(), and contrast with reset. It's now the default updating mechanism after a fetch. If you'd like to continue using "reset", pass {reset: true}.  
Your route handlers will now receive their URL parameters pre-decoded.  
Added listenToOnce as the analogue of once.  
Added the findWhere method to Collections, similar to where.  
Added the keys, values, pairs, invert, pick, and omit Underscore.js methods to Backbone Models.  
The routes in a Router's route map may now be function literals, instead of references to methods, if you like.  
url and urlRoot properties may now be passed as options when instantiating a new Model.  