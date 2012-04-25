<?php
namespace upro\web
{

/**
 * A strategy for starting sessions
 */
interface SessionStartStrategy
{
   /**
    * Starts the session according to the strategy implementation
    */
   function start();
}

}
