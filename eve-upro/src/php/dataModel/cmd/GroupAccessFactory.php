<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/CommandDataAccess.php';
require_once realpath(dirname(__FILE__)) . '/../GroupAccess.php';

/**
 * An access factory based on CommandDataAccess
 */
interface GroupAccessFactory
{
   /**
    * @return \upro\dataModel\GroupAccess the requested access
    */
   function getGroupAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess);
}

}