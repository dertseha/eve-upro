upro.view.UiTheme = Class
      .create(
      {

         initialize: function()
         {
            this.theme = uki.extend({}, uki.theme.Base,
            {
               backgrounds: this.getBackgrounds(),
               templates: this.getTemplates(),
               styles: this.getStyles()

            });
         },

         registerTheme: function()
         {
            uki.theme.register(this.theme);
         },

         getBackgroundCss: function(opacity)
         {
            return upro.view.UiTheme.getBackgroundCss(opacity);
         },

         getBackgrounds: function()
         {
            var defaultCss = "position:absolute;z-index:100;-moz-user-focus:none;font-family:Arial,Helvetica,sans-serif;color:'#FFFFFF';";
            var self = this;
            var block =
            {
               'simpleFrame': function()
               {
                  return new uki.background.CssBox(defaultCss
                        + 'border-width:2px;border-style:solid;padding:2px;border-color:' + self.getBackgroundCss(7));
               },
               'box': function()
               {
                  return new uki.background.CssBox(defaultCss + 'border:2px solid #704010;background:'
                        + self.getBackgroundCss(7));
               },
               // basic button
               'button-normal': function()
               {
                  return new uki.background.CssBox(defaultCss + 'border:2px solid #704010;background:'
                        + self.getBackgroundCss(7));
               },
               'button-hover': function()
               {
                  return new uki.background.CssBox(defaultCss + 'border:2px solid #704010;background:'
                        + self.getBackgroundCss(8));
               },
               'button-down': function()
               {
                  return new uki.background.CssBox(defaultCss + 'border:2px solid #704010;background:'
                        + self.getBackgroundCss(9));
               },
               list: function(rowHeight)
               {
                  return new uki.background.Rows(rowHeight, self.getBackgroundCss(9) + ' ' + self.getBackgroundCss(8));
               },
               'table-header': function()
               {
                  return new uki.background.CssBox(defaultCss + 'border-bottom:2px solid #704010;background:'
                        + self.getBackgroundCss(9));
               }
            };

            return block;
         },

         getTemplates: function()
         {
            var block = {};

            return block;
         },

         getStyles: function()
         {
            var block =
            {
               base: function()
               {
                  return 'font-family:Arial,Helvetica,sans-serif;color:#FFFFFF;';
               },
               'label': function()
               {
                  return 'font-size:12px;';
               },
               'button': function()
               {
                  return 'color:#FFFFFF;text-align:center;font-weight:bold;text-shadow:0 1px 0 rgba(255,255,255,0.1);';
               }
            };

            return block;
         }

      });

upro.view.UiTheme.getBackgroundCss = function(opacity)
{
   return '#423f22;'
         + ((uki.browser.cssFilter() && uki.image.needAlphaFix) ? 'filter:Alpha(opacity=' + opacity + '0);'
               : 'opacity:0.' + opacity + ';');
};
