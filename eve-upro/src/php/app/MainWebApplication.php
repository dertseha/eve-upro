<?php
namespace upro\app
{
require_once realpath(dirname(__FILE__)) . '/../web/WebApplication.php';
require_once realpath(dirname(__FILE__)) . '/../web/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/../web/StreamHtmlPageBuilder.php';
require_once realpath(dirname(__FILE__)) . '/../web/InlineScriptResource.php';
require_once realpath(dirname(__FILE__)) . '/../web/ReferencedJavaScriptResource.php';

/**
 * The main upro application
 */
class MainWebApplication implements \upro\web\WebApplication
{
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function run(\upro\web\WebAppContext $context)
   {
      $pageBuilder = new \upro\web\StreamHtmlPageBuilder($context->getOut());

      $pageBuilder->start();
      $pageBuilder->setTitle("upro");
      // add stylesheet
      \upro\web\InlineScriptResource::getForCascadingStyleSheet($context->getFileResource('res/upro.css')->getContent())->addToPage($pageBuilder);
      // enter body to have the stylesheet take effect immediately
      $pageBuilder->enterBody();
      $pageBuilder->addNode('canvas', array('id' => 'scene'), '');
      $pageBuilder->addNode('div', array('id' => 'hud'), '');

      // add dependent libraries
      $this->addJavaScriptReferences($context, $pageBuilder,
            array('lib/glMatrix.min.js', 'lib/prototype.js', 'lib/puremvc-multicore-prototypejs-1.0-min.js',
                  'lib/raphael.min.js', 'lib/scale.raphael.js'));
      // add upro JS
      $this->addJavaScriptReferences($context, $pageBuilder, array('upro-1.0.js'));
      // add universe data
      $this->addJavaScriptReferences($context, $pageBuilder,
            array('res/eve/kRegionData.js', 'res/eve/kConstellationData.js', 'res/eve/kSolarSystemData.js', 'res/eve/kSolarSystemJumpData.js',
                  'res/eve/wRegionData.js', 'res/eve/wConstellationData.js', 'res/eve/wSolarSystemData.js', 'res/eve/wSolarSystemJumpData.js'));
      // add shader
      \upro\web\InlineScriptResource::getForVertexShader('basic-vertex-shader',
            $context->getFileResource('res/shader/basicVertexShader.c')->getContent())->addToPage($pageBuilder);
      \upro\web\InlineScriptResource::getForFragmentShader('basic-fragment-shader',
            $context->getFileResource('res/shader/basicFragmentShader.c')->getContent())->addToPage($pageBuilder);
      \upro\web\InlineScriptResource::getForVertexShader('system-vertex-shader',
            $context->getFileResource('res/shader/solarSystemVertexShader.c')->getContent())->addToPage($pageBuilder);
      \upro\web\InlineScriptResource::getForFragmentShader('system-fragment-shader',
            $context->getFileResource('res/shader/solarSystemFragmentShader.c')->getContent())->addToPage($pageBuilder);
      // add main code
      \upro\web\InlineScriptResource::getForJavaScript('document.observe("dom:loaded", function() ' .
            '{ var theApp = new upro.app.ApplicationFacade(); theApp.start(); });')->addToPage($pageBuilder);

      $pageBuilder->finish();
   }

   /**
    * Adds JavaScript references for a list of .js files
    * @param \upro\web\WebAppContext $context to query resources from
    * @param \upro\web\HtmlPageBuilder $pageBuilder to add them to
    * @param array $sources to add
    */
   private function addJavaScriptReferences(\upro\web\WebAppContext $context, \upro\web\HtmlPageBuilder $pageBuilder, $sources)
   {
      foreach ($sources as $source)
      {
         $res = new \upro\web\ReferencedJavaScriptResource($context->getFileResource($source)->getPath());

         $res->addToPage($pageBuilder);
      }
   }
}

}
