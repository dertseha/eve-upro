<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/AbstractHtmlResource.php';

/**
 * An inline script resource is a <script> resource that is provided inline in the HTML page
 */
class InlineScriptResource extends AbstractHtmlResource
{
   /**
    * @var string type
    */
   private $type;

   /**
    * @var string body
    */
   private $body;

   /**
    * Constructor
    * @param string $type type
    * @param string $body body
    */
   function __construct($type, $body, $attributes = array())
   {
      $this->type = $type;
      $this->body = $body;
      $this->attributes = array_merge(array(), $attributes);
   }

   /** {@inheritDoc} */
   public function getType()
   {
      return $this->type;
   }

   /** {@inheritDoc} */
   public function getTag()
   {
      $tag = "script";

      if ($this->getType() == RESOURCE_TYPE_CSS)
      {
         $tag = "style";
      }

      return $tag;
   }

   /** {@inheritDoc} */
   public function getAttributes()
   {
      $attributes = parent::getAttributes();

      return array_merge($attributes, $this->attributes, array('type' => $this->getType()));
   }

   /** {@inheritDoc} */
   function getBody()
   {
      return $this->body;
   }

   /**
    * Returns an InlineScriptResource for a CSS script
    * @param $body to use
    * @return \upro\web\InlineScriptResource
    */
   public static function getForCascadingStyleSheet($body)
   {
      return new InlineScriptResource(RESOURCE_TYPE_CSS, $body);
   }

   /**
    * Returns an InlineScriptResource for a JavaScript
    * @param $body to use
    * @return \upro\web\InlineScriptResource
    */
   public static function getForJavaScript($body)
   {
      return new InlineScriptResource(RESOURCE_TYPE_JAVASCRIPT, $body);
   }

   /**
    * Returns an InlineScriptResource for a vertex shader
    * @param $id to use
    * @param $body to use
    * @return \upro\web\InlineScriptResource
    */
   public static function getForVertexShader($id, $body)
   {
      return new InlineScriptResource(RESOURCE_TYPE_VERTEXSHADER, $body, array('id' => $id, 'charset' => 'utf-8'));
   }

   /**
    * Returns an InlineScriptResource for a fragment shader
    * @param $id to use
    * @param $body to use
    * @return \upro\web\InlineScriptResource
    */
   public static function getForFragmentShader($id, $body)
   {
      return new InlineScriptResource(RESOURCE_TYPE_FRAGMENTSHADER, $body, array('id' => $id, 'charset' => 'utf-8'));
   }
}

}
