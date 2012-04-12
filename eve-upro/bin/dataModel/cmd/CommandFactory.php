<?php
namespace upro\dataModel\cmd
{
/**
 * A command factory
 */
interface CommandFactory
{
   /**
    * Requests to create a command for given name
    * @param string $name of the command to retrieve
    * @return \upro\dataModel\cmd\Command for given name
    */
	function getCommand($name);
}

}