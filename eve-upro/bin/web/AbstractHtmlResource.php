<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/HtmlResource.php';

/**
 * An abstract HTML resource implements the addToPage() method as a template,
 * referring to getter methods for the parameters.
 */
abstract class AbstractHtmlResource implements HtmlResource
{
   /** {@inheritDoc} */
   public function addToPage($builder)
   {
      $builder->addNode($this->getTag(), $this->getAttributes(), $this->getBody());
   }

   /**
    * @return the tag to be used
    */
   public abstract function getTag();

   /**
    * @return attributes to set. Defaults to an empty array.
    */
   public function getAttributes()
   {
      return array();
   }

   /**
    * @return the body. Defaults to empty string.
    */
   public function getBody()
   {
      return "";
   }
}

}
