<?php
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/DefaultWebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/AuthenticationSystemApplication.php';

require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/StandardSessionControl.php';
require_once realpath(dirname(__FILE__)) . '/../../../src/php/web/SessionHijackPreventer.php';

function main()
{
   $basePath = realpath(dirname(__FILE__));
   $context = new \upro\web\DefaultWebAppContext($basePath);
   $session = $context->getSessionControl();
   $sessionStore = $session->getValueStore();
   $preventer = new \upro\web\SessionHijackPreventer($sessionStore, $context->getRequestServerContext());

   if ($preventer->validate())
   {
      $app = new AuthenticationSystemApplication($context);

      $app->run();
   }
}

main();
