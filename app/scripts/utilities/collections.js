define(
[
    "underscore"
],
function(_)
{
    var CollectionUtils = {
        
        search: function(CollectionConstructor, sourceCollection, searchText, attributeNames)
        {
            searchText = searchText.trim();

            if(searchText)
            {
                var matchers = this.buildSearchMatchers(searchText);

                var filterModel = function(model)
                {
                    return _.any(attributeNames, function(attributeName)
                    {
                        var attr = model.get(attributeName);
                        return _.any(matchers, function(matcher)
                        {
                            return matcher.test(attr);
                        });
                    });
                };

                return new CollectionConstructor(sourceCollection.filter(filterModel));

            } else {
                return new CollectionConstructor(sourceCollection.models);
            }

        },

        buildSearchMatchers: function(searchText)
        {

            var matchers = [];

            // exact search
            matchers.push(new RegExp(searchText, "i"));

            // simple search, ignore special characters
            matchers.push(new RegExp(searchText.replace(/[^a-zA-Z0-9]+/g,".*"), "i"));

            // any word order
            matchers.push(new AnyWordOrderMatcher(searchText));

            return matchers;
        }

    };

    var AnyWordOrderMatcher = function(searchText)
    {
        this.patterns = [];
        _.each(searchText.split(/\b/), function(word)
        {
            word = word.trim();
            if(word && word.replace(/[^a-zA-Z0-9]/g,""))
            {
                this.patterns.push(new RegExp(word, "i"));
            }
        }, this);
    };

    AnyWordOrderMatcher.prototype.test = function(text)
    {
        return _.every(this.patterns, function(pattern)
        {
            try {
                return pattern.test(text);
            } catch(e)
            {
                return false;
            }
        });
    };

    return CollectionUtils;
}); 
