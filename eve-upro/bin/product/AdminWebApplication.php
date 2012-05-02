<?php
namespace upro\product
{
require_once realpath(dirname(__FILE__)) . '/../web/WebApplication.php';
require_once realpath(dirname(__FILE__)) . '/../web/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/../web/StreamHtmlPageBuilder.php';
require_once realpath(dirname(__FILE__)) . '/../web/InlineScriptResource.php';
require_once realpath(dirname(__FILE__)) . '/ProductFactory.php';
require_once realpath(dirname(__FILE__)) . '/ProductAdminControl.php';

/**
 * The admin web application
 */
class AdminWebApplication implements \upro\web\WebApplication
{
   /**
    * The context this application runs in
    * @var \upro\web\WebAppContext
    */
   private $context;

   /**
    * The product factory to provide the necessary stuff
    * @var \upro\product\ProductFactory
    */
   private $factory;

   /**
    * The control for the admin tasks
    * @var \upro\product\AdminControl
    */
   private $control;

   /**
    * Provider of configuration
    * @var \upro\util\ConfigProvider
    */
   private $configProvider;

   /**
    * Array of messages
    * @var array
    */
   private $messages = array();

   /**
    * Constructor
    * @param \upro\web\WebAppContext $context the context this application runs in
    * @param \upro\product\ProductFactory $factory the product factory to provide the necessary stuff
    * @param \upro\util\ConfigProvider $configProvider configuration provider
    */
   function __construct(\upro\web\WebAppContext $context, \upro\product\ProductFactory $factory,
         \upro\util\ConfigProvider $configProvider)
   {
      $this->context = $context;
      $this->factory = $factory;
      $this->configProvider = $configProvider;
   }

   /** {@inheritDoc} */
   public function run()
   {
      $requestData = $this->context->getRequestData();

      $this->control = new \upro\product\ProductAdminControl($this->factory);

      if ($requestData->has('action'))
      {
         // overwrite the database password with the given value from the form
         $this->configProvider->getConfig()->set('database.userPassword', $requestData->get('dbPassword'));

         if ($requestData->get('action') === 'updateSchema')
         {
            $this->control->updateDatabaseSchema();
            $this->messages[] = "Schema updated";
         }
         else if ($requestData->get('action') === 'createDataModel')
         {
            $name = $requestData->get('dataModelName');

            $this->control->createDataModel($name);
            $this->messages[] = "Data model [" . $name . "] created";
         }
      }

      $this->showPage();
   }

   /**
    * Shows the page
    */
   private function showPage()
   {
      $isUpToDate = $this->control->isDatabaseUpToDate();
      $pageBuilder = new \upro\web\StreamHtmlPageBuilder($this->context->getOut());

      $pageBuilder->start();
      $pageBuilder->setTitle("upro - Admin Interface");
      \upro\web\InlineScriptResource::getForCascadingStyleSheet(
            $this->context->getFileResource('res/admin.css')->getContent())->addToPage($pageBuilder);
      $pageBuilder->enterBody();

      $pageBuilder->addNode('section', array('id' => 'messages'), $this->getHtmlMessages());
      $pageBuilder->addNode('section', array('id' => 'databaseControl'), $this->getHtmlDatabaseControl($isUpToDate));
      if ($isUpToDate)
      {
         $pageBuilder->addNode('section', array('id' => 'modelControl'), $this->getHtmlDataModelControl());

      }

      $pageBuilder->finish();
   }

   /**
    * @return string HTML text containing any messages from the executed action
    */
   private function getHtmlMessages()
   {
      $messages = '';

      foreach ($this->messages as $message)
      {
         $messages .= '<article id=message">' . $message . '</article>';
      }

      return $messages;
   }

   /**
    * @param boolean $isUpToDate whether the database is currently up to date
    * @return string HTML text containing the database control form
    */
   private function getHtmlDatabaseControl($isUpToDate)
   {
      $form = '<form action="" method="post">';
      $form .= '<h2>Database (' . ($isUpToDate ? 'is ' : 'NOT ') . 'up to date)</h2>';
      $form .= "\n" . '<input type="hidden" name="action" value="updateSchema" />';
      if (!$isUpToDate)
      {
         $form .= "\n" . '<label for="dbPassword">Password</label>';
         $form .= "\n" . '<input type="text" name="dbPassword" placeholder="Database password" />';
         $form .= "\n" . '<input type="submit" name="submit" value="Update" />';
      }
      $form .= '</form>';

      return $form;
   }

   /**
    * @return string HTML text containing the data model control form
    */
   private function getHtmlDataModelControl()
   {
      $form = '<form action="" method="post">';
      $form .= '<h2>Data Model - Create New</h2>';
      $form .= "\n" . '<input type="hidden" name="action" value="createDataModel" />';
      $form .= "\n" . '<label for="dbPassword">Password</label>';
      $form .= "\n" . '<input type="text" name="dbPassword" placeholder="Database password" />';
      $form .= "\n" . '<label for="dataModelName">Name</label>';
      $form .= "\n" . '<input type="text" name="dataModelName" placeholder="name" />';
      $form .= "\n" . '<input type="submit" name="submit" value="Create" />';
      $form .= '</form>';

      return $form;
   }
}

}
