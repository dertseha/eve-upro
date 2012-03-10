<?php
namespace upro\app
{

/**
 * An AppContext is the wrapper and interface to the outside world for an application.
 */
interface AppContext
{
   /**
    * @return \upro\io\PrintStream for writing to the standard output
    */
   function getOut();

   /**
    * Returns a file resource for given key.
    * @param string $key of the resource
    * @return \upro\app\FileResource the resource or null
    */
   function getFileResource($key);
}

}