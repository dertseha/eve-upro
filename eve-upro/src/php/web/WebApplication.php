<?php
namespace upro\web
{

/**
 * A WebApplication runs based on a WebAppContext
 */
interface WebApplication
{
   /**
    * Runs the application
    * @param \upro\web\WebAppContext $context
    */
   function run(\upro\web\WebAppContext $context);
}

}
