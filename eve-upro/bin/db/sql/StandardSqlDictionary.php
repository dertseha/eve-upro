<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlDictionary.php';

/**
 * A standard SQL dictionary
 */
class StandardSqlDictionary implements \upro\db\sql\SqlDictionary
{
   /**
    * Default Constructor
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function getPlaceholder()
   {
      return '?';
   }

   /** {@inheritDoc} */
   public function getSelect()
   {
      return 'SELECT';
   }

   /** {@inheritDoc} */
   public function getInsert()
   {
      return 'INSERT INTO';
   }

   /** {@inheritDoc} */
   public function getUpdate()
   {
      return 'UPDATE';
   }

   /** {@inheritDoc} */
   public function getDelete()
   {
      return 'DELETE FROM';
   }

   /** {@inheritDoc} */
   public function getSet()
   {
      return 'SET';
   }

   /** {@inheritDoc} */
   public function getValues()
   {
      return 'VALUES';
   }

   /** {@inheritDoc} */
   public function getAll()
   {
      return '*';
   }

   /** {@inheritDoc} */
   public function getFrom()
   {
      return 'FROM';
   }

   /** {@inheritDoc} */
   public function getWhere()
   {
      return ' WHERE ';
   }

   /** {@inheritDoc} */
   public function getAnd()
   {
      return ' AND ';
   }

   /** {@inheritDoc} */
   public function getOr()
   {
      return ' OR ';
   }

   /** {@inheritDoc} */
   public function getNot()
   {
      return 'NOT ';
   }

   /** {@inheritDoc} */
   public function getEquals()
   {
      return ' = ';
   }

   /** {@inheritDoc} */
   public function getGreater()
   {
      return ' > ';
   }

   /** {@inheritDoc} */
   public function getSmaller()
   {
      return ' < ';
   }

   /** {@inheritDoc} */
   public function getOrderBy()
   {
      return ' ORDER BY ';
   }

   /** {@inheritDoc} */
   public function getAscending()
   {
      return 'ASC';
   }

   /** {@inheritDoc} */
   public function getDescending()
   {
      return 'DESC';
   }
}

}
