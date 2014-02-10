define(
[
    "handlebars",
    "utilities/multilineEllipsis"
],
function(Handlebars, multilineEllipsis)
{
    Handlebars.registerHelper("multilineEllipsis", multilineEllipsis);
    return multilineEllipsis;
});