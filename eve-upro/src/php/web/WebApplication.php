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
    */
   function run();
}

}
