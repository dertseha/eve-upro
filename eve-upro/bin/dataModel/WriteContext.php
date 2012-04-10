<?php
namespace upro\dataModel
{
/**
 * A write context is for controlling write access to the data model.
 */
interface WriteContext
{
   /**
    * Starts the context for future write requests
    * @return \upro\dataModel\WriteAccess the access to use for writes
    */
   function start();

   /**
    * Stops the context and flushes (commits) any pending transmission
    */
   function stop();

   /**
    * Cancels all transmissions
    */
   function cancel();
}

}