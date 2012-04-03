<?php
namespace upro\db\schema
{

/**
 * Defining a column
 */
interface ColumnDefinition
{
   /**
    * @return string the name of the column
    */
   function getColumnName();

   /**
    * @return \upro\db\schema\DataType the type of the column
    */
   function getDataType();

   /**
    * @return boolean true if the column is nullable
    */
   function isNullable();

   /**
    * @return mixed the default value of the column
    */
   function getDefaultValue();
}

}