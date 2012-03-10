<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/AbstractHtmlResource.php';

class ReferencedJavaScriptResource extends AbstractHtmlResource
{
   /**
    * @var string source link
    */
   private $src;

   /**
    * Constructor
    * @param string $src the source link
    */
   function __construct($src)
   {
      $this->src = $src;
   }

   /** {@inheritDoc} */
   public function getType()
   {
      return RESOURCE_TYPE_JAVASCRIPT;
   }

   /** {@inheritDoc} */
   public function getTag()
   {
      return "script";
   }

   /** {@inheritDoc} */
   public function getAttributes()
   {
      $attributes = parent::getAttributes();

      return array_merge($attributes, array('type' => $this->getType(), 'charset' => "utf-8", 'src' => $this->src));
   }
}

}
