define([],
    function()
{

    return {

        loadFonts: function()
        {
            WebFontConfig = {
                custom:
                {
                    families: ['HelveticaNeueW01-45Ligh', 'HelveticaNeueW01-55Roma', 'HelveticaNeueW01-56It', 'HelveticaNeueW01-75Bold']
                }
            };

            if(typeof WebFont !== 'undefined')
            {
                WebFont.load(WebFontConfig);
            }
        }
        
    };

});
