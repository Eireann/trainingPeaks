define(
[
    "shared/patches/wrapForRollbar"
], 
function(wrappedForRollbar)
{
    return wrappedForRollbar.setImmediate;
});
