<?php
namespace upro\web
{

/**
 * An interface for providing context values from the server for the current request
 */
interface RequestServerContext
{
   /**
    * @return string the remote address
    */
   function getRemoteAddress();

   /**
    * @return string the agent identification from the user. Might be empty.
    */
   function getUserAgent();

   /**
    * @return boolean true if the request is a POST request
    */
   function isRequestPost();

   /**
    * @return boolean true if the request is a GET request
    */
   function isRequestGet();
}

}
