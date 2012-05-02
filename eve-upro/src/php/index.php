<?php
require_once realpath(dirname(__FILE__)) . '/web/DefaultWebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/product/MainWebApplication.php';

function main()
{
   $basePath = realpath(dirname(__FILE__));
   $context = new \upro\web\DefaultWebAppContext($basePath);
   $app = new \upro\product\MainWebApplication($context);

   $app->run();
}

main();
