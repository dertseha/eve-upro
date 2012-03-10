<?php
namespace upro\app
{

/**
 * A file resource is an abstract accessor to a file
 */
interface FileResource
{
   /**
    * Returns the path to the file resource
    * @return string path
    */
   function getPath();

   /**
    * Returns the content of the file in string form
    * @return string form of content
    */
   function getContent();
}

}
