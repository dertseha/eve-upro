upro.ctrl.cmd.NotifiedCharacterListInSolarSystemChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);
      var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var notifyBody = notification.getBody();
      var highlightName = "CurLocation:" + notifyBody.solarSystem.getId();
      var finalList = [];

      highlightMediator.removeHighlights(new RegExp(highlightName));

      notifyBody.characterIdList.forEach(function(charId)
      {
         if (!sessionProxy.isForCharacter(charId) && locationTrackerProxy.isCharacterVisible(charId))
         {
            finalList.push(charId);
         }
      });

      if (finalList.length > 0)
      {
         var text = this.getTextForList(notifyBody.solarSystem, finalList);

         this.setCurLocationHighlight(highlightMediator, highlightName);
         highlightMediator.setHighlightSolarSystem(highlightName, notifyBody.solarSystem, text);
      }
   },

   setCurLocationHighlight: function(highlightMediator, highlightName)
   {
      var textOptions =
      {
         color: "#00FF00",
         height: 15,
         bracketSide: 4,
         bracketPadding: upro.hud.Button.Scale * -2,
         textAnchor: 'end'
      };
      var bracketOptions =
      {
         fillColor: "#00FF00",
         fillOpacity: 0.1,
         strokeColor: "#00FF00",
         strokeOpacity: 0.8,
         size: 4
      };

      highlightMediator.addHighlight(highlightName, textOptions, bracketOptions);
   },

   getTextForList: function(solarSystem, charIdList)
   {
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var text = solarSystem.name + " (" + charIdList.length + ")";

      if (charIdList.length == 1)
      {
         var body = bodyRegisterProxy.getBodyName("Character", charIdList[0]);

         text = solarSystem.name + " (" + body.getName() + ")";
      }

      return text;
   }
});
