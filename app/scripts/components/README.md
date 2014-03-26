** Mars Web App Components **

The components in this folder are reuseable pieces that can be included in the trainingpeaks cms or other external site

** To Build **

From mars root folder, run `grunt build_components`

** To Preview **

Build the components, and then open the previewer html files via your local web server:
http://app.local.trainingpeaks.com/build/components/publicFileViewer.html

** To Deploy **

Build, and then use the appropriate html file in the componentPreviewer as a guide. 

For example, the public file viewer component requires publicFileViewer.js and publicFileViewer.css, 
which will be built in the app/scripts/components/componentPreviewer/build folder,
plus a token id and a few lines of javascript in the host page