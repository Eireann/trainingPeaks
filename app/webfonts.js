define([],
    function()
{

    return {

        loadFonts: function()
        {
            if(typeof WebFont !== 'undefined')
            {
                WebFont.load({
                    custom:
                    {
                        families: ['HelveticaNeueW01-45Ligh', 'HelveticaNeueW01-55Roma', 'HelveticaNeueW01-56It', 'HelveticaNeueW01-75Bold']
                    }
                });
            }
        }
        
    };

});
