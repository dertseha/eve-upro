<?php
namespace upro\web
{

/**
 * A HtmlPageBuilder creates a HTML page.
 * Depending on the implementation, some methods might not be allowed to be called out of sequence or more than once.
 */
interface HtmlPageBuilder
{
   /**
    * Sets the title of the page.
    * @param unknown_type $title
    */
   function setTitle($title);

   /**
    * further additions affect the body (if possible)
    */
   function enterBody();

   /**
    * Adds a node with given data to the page
    * @param string $tag
    * @param map $attributes
    * @param string $body
    */
   function addNode($tag, $attributes, $body);
}

}
