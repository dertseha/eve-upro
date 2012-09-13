/**
 * Helper methods for UI layout
 */
upro.view.UiHelper =
{
   /**
    * creates a view for a label
    * 
    * @param left coordinate
    * @param top coordinate
    * @param width coordinate
    * @param height coordinate
    * @param text to display
    * @returns a view object
    */
   getLabelView: function(left, top, width, height, text)
   {
      var frame = [ left, top, width, height ].join(' ');
      var view =
      {
         view: 'Box',
         rect: frame,
         anchors: 'left top',
         childViews: [
         {
            view: 'Label',
            rect: '0 0 ' + width + ' ' + height,
            anchors: 'left top right bottom',
            style:
            {
               "text-align": "right"
            },
            text: text
         } ]
      };

      return view;
   }
};
