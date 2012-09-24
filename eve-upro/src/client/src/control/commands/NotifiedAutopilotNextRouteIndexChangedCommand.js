upro.ctrl.cmd.NotifiedAutopilotNextRouteIndexChangedCommand = Class.create(SimpleCommand,
      {
         execute: function(notification)
         {
            var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
            var igbMediator = this.facade().retrieveMediator(upro.view.mediators.InGameBrowserMediator.NAME);
            var autopilotPanelMediator = this.facade().retrieveMediator(
                  upro.view.mediators.AutopilotRoutePanelMediator.NAME);
            var route = autopilotProxy.getRoute();
            var nextRouteIndex = autopilotProxy.getNextRouteIndex();

            igbMediator.setAutopilotNextRouteIndex(route, nextRouteIndex);
            autopilotPanelMediator.setNextRouteIndex(nextRouteIndex);
         }
      });
