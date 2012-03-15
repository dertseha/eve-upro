<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../ResultSet.php';

require_once realpath(dirname(__FILE__)) . '/MySqlHelper.php';

/**
 * A MySql specific result set
 */
class MySqlResultSet implements \upro\db\ResultSet
{
   /**
    * The resource handle
    * @var resource
    */
   private $handle;

   /**
    * Constructor
    * @param resource $handle of the result
    */
   public function __construct($handle)
   {
      $this->handle = $handle;
   }

   /** {@inheritDoc} */
   public function close()
   {
      if ($this->handle != null)
      {
         MySqlResultSet::closeResult($this->handle);
         $this->handle = null;
      }
   }

   /** {@inheritDoc} */
   public function read(\upro\db\TableRowReader $reader)
   {
      if ($this->handle != null)
      {
         $result = $this->fetchRow();
         while ($result != FALSE)
         {
            $reader->receive($result);
            $result = $this->fetchRow();
         }
      }
      else
      {
         throw new \upro\db\DatabaseException("ResultSet is closed", 0);
      }
   }

   /** {@inheritDoc} */
   public function getColumnsByName()
   {
      $result = array();
      $numberOfFields = $this->getNumberOfFields();

      for ($i = 0; $i < $numberOfFields; $i++)
      {
         $fieldName = $this->getFieldName($i);

         $result[$fieldName] = $i;
      }

      return $result;
   }

   /**
    * @return int number of fields in the result set
    */
   private function getNumberOfFields()
   {
      $param = array('resource' => $this->handle);
      $wrapper = function ($param)
      {
         return mysql_num_fields($param['resource']);
      };

      return MySqlHelper::executeThrowError($wrapper, $param);
   }

   /**
    * @param int $fieldIndex of the field to retrieve
    * @return string field name
    */
   private function getFieldName($fieldIndex)
   {
      $param = array('resource' => $this->handle, 'fieldIndex' => $fieldIndex);
      $wrapper = function ($param)
      {
         return mysql_field_name($param['resource'], $param['fieldIndex']);
      };

      return MySqlHelper::executeThrowError($wrapper, $param);
   }

   /**
    * Fetches the next row
    * @return array|FALSE the fetched row or FALSE if end reached
    */
   private function fetchRow()
   {
      $result = FALSE;

      try
      {
         $result = mysql_fetch_row($this->handle);
      }
      catch (\Exception $ex)
      {
         throw new \upro\db\DatabaseException($ex->__toString(), mysql_errno(), $ex);
      }

      return $result;
   }

   /**
    * Tries to close the given result; throws exception on error
    * @param resource $handle to close
    */
   public static function closeResult($handle)
   {
      $param = array('resource' => $handle);
      $wrapper = function ($param)
      {
         return mysql_free_result($param['resource']);
      };
      MySqlHelper::executeThrowError($wrapper, $param);
   }
}

}
