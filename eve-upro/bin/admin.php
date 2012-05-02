<?php
require_once realpath(dirname(__FILE__)) . '/util/ConfigProvider.php';
require_once realpath(dirname(__FILE__)) . '/util/logging/LoggingSystem.php';
require_once realpath(dirname(__FILE__)) . '/web/DefaultWebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/product/AdminWebApplication.php';
require_once realpath(dirname(__FILE__)) . '/product/DefaultProductFactory.php';

function main()
{
   $basePath = realpath(dirname(__FILE__));
   $configProvider = \upro\util\ConfigProvider::load($basePath);

   \upro\util\logging\LoggingSystem::initialize($configProvider->getConfig());

   \upro\util\logging\LoggerProvider::getLogger(null)->info('Admin WebInterface requested');
   $context = new \upro\web\DefaultWebAppContext($basePath);
   $factory = new \upro\product\DefaultProductFactory($configProvider->getConfig());
   $app = new \upro\product\AdminWebApplication($context, $factory, $configProvider);

   try
   {
      $app->run();
   }
   catch (\Exception $ex)
   {
      \upro\util\logging\LoggerProvider::getLogger(null)->error('Uncaught Exception: %s', $ex);
      throw $ex;
   }
}

main();
