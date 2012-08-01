
upro.model.proxies.InfoTypeFactoryProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.InfoTypeFactoryProxy.NAME, upro.data.InfoTypeFactory.Instance);
   },

   onRegister: function()
   {
      this.registerFactories();
   },

   registerFactories: function()
   {
      var factory = this.getData();

      factory.register(upro.model.UserSession.TYPE, this.createUserSession.bind(this));
      factory.register(upro.model.UserSettings.TYPE, this.createUserSettings.bind(this));
      factory.register(upro.model.UserIgnoredSolarSystem.TYPE, this.createUserIgnoredSolarSystem.bind(this));
      factory.register(upro.model.UserRoutingRule.TYPE, this.createUserRoutingRule.bind(this));
   },

   createInfoAndProxy: function(infoId, dataStore, infoConstructor, proxyConstructor)
   {
      var info = new infoConstructor(infoId);
      var proxy = new proxyConstructor(info, dataStore);

      this.facade().registerProxy(proxy);

      return info;
   },

   createUserSession: function(infoId, dataStore)
   {
      return this.createInfoAndProxy(infoId, dataStore, upro.model.UserSession, upro.model.proxies.UserSessionProxy);
   },

   createUserSettings: function(infoId, dataStore)
   {
      return this.createInfoAndProxy(infoId, dataStore, upro.model.UserSettings, upro.model.proxies.UserSettingsProxy);
   },

   createUserIgnoredSolarSystem: function(infoId, dataStore)
   {
      return new upro.model.UserIgnoredSolarSystem(infoId);
   },

   createUserRoutingRule: function(infoId, dataStore)
   {
      return new upro.model.UserRoutingRule(infoId);
   }

});

upro.model.proxies.InfoTypeFactoryProxy.NAME = "InfoTypeFactory";
