<?php
require_once realpath(dirname(__FILE__)) . '/../util/ConfigProvider.php';
require_once realpath(dirname(__FILE__)) . '/../util/logging/LoggingSystem.php';
require_once realpath(dirname(__FILE__)) . '/DefaultProductFactory.php';
require_once realpath(dirname(__FILE__)) . '/ProductAdminControl.php';

function showUsage()
{
   echo "Upro admin console application\n";
   echo "Commands:\n";
   echo "\n";
   echo "--help                        Display of usage\n";
   echo "--updateDatabaseSchema        Update the database schema\n";
   echo "--createDataModel (modelName) Create a new data model with given name\n";
}

function main($arguments)
{
   $argumentCount = count($arguments);
   $basePath = dirname(realpath(dirname(__FILE__)));
   $configProvider = \upro\util\ConfigProvider::load($basePath);

   \upro\util\logging\LoggingSystem::initialize($configProvider->getConfig());
   \upro\util\logging\LoggerProvider::getLogger(null)->info('Admin Console requested');

   $factory = new \upro\product\DefaultProductFactory($configProvider->getConfig());
   $control = new \upro\product\ProductAdminControl($factory);
   $isUpToDate = $control->isDatabaseUpToDate();

   if ($argumentCount > 0)
   {
      $action = $arguments[0];

      if (($action === '--help') || ($action === '/?'))
      {
         showUsage();
      }
      else if ($action === '--updateDatabaseSchema')
      {
         $control->updateDatabaseSchema();
      }
      else if (($action === '--createDataModel') && ($argumentCount > 1))
      {
         $control->createDataModel($arguments[1]);
      }
   }

   echo "\n";
   echo 'Database - is up to date: ' . ($isUpToDate ? "Yes" : "No") . "\n";
}

main(array_slice($argv, 1));
