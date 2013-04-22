define(
[
    "underscore"
],
function(_)
{
    function wrapTemplate(context, innerTemplateFunction, outerTemplateFunction, contextKey)
    {
        var innerHtml = innerTemplateFunction(context);
        var outerContext = _.clone(context, true);
        outerContext[contextKey] = innerHtml;
        return outerTemplateFunction(outerContext);
    }

    return wrapTemplate;
});