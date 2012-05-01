<?php
require_once realpath(dirname(__FILE__)) . '/web/DefaultWebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/app/MainWebApplication.php';

function main()
{
   $basePath = realpath(dirname(__FILE__));
   $context = new \upro\web\DefaultWebAppContext($basePath);
   $app = new \upro\app\MainWebApplication($context);

   $app->run();
}

main();
