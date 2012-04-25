<?php
require_once realpath(dirname(__FILE__)) . '../../../../../src/php/web/StreamHtmlPageBuilder.php';
require_once realpath(dirname(__FILE__)) . '../../../../../src/php/web/DefaultWebAppContext.php';
require_once realpath(dirname(__FILE__)) . '../../../../../src/php/web/StandardSessionControl.php';
require_once realpath(dirname(__FILE__)) . '../../../../../src/php/web/SessionHijackPreventer.php';

function main()
{
   $basePath = realpath(dirname(__FILE__));
   $context = new \upro\web\DefaultWebAppContext($basePath);

   $session = new \upro\web\StandardSessionControl(\upro\web\StandardSessionControl::getDefaultStartStrategy());
   $valueStore = $session->getValueStore();
   $preventer = new \upro\web\SessionHijackPreventer($valueStore, $context->getRequestServerContext());
   $visitCount = 0;

   $sessionIsValid = $preventer->validate();
   if ($valueStore->has('visitCount'))
   {
      $visitCount = $valueStore->get('visitCount');
   }
   $visitCount++;
   $valueStore->set('visitCount', $visitCount);

   {
      $pageBuilder = new \upro\web\StreamHtmlPageBuilder($context->getOut());

      $pageBuilder->start();
      $pageBuilder->setTitle('upro - WebSession Test');
      $pageBuilder->enterBody();
      {
         $pageBuilder->addNode('div', array('id' => 'visitCount'), $visitCount);
         $pageBuilder->addNode('div', array('id' => 'sessionValid'), $sessionIsValid ? 'valid' : 'invalid');
         $pageBuilder->addNode('div', array('id' => 'clientId'), $preventer->getId());
      }
      $pageBuilder->finish();
   }
}

main();
