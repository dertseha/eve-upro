<?php
namespace upro\db\sql
{

/**
 * An SqlDictionary provides lookup functions for various elements of a query.
 * The dictionary might be specific to a DataSource
 */
interface SqlDictionary
{
   /**
    * @return string placeholder string (?)
    */
   function getPlaceholder();

   /**
    * @return string SELECT string
    */
   function getSelect();

   /**
    * @return string INSERT string
    */
   function getInsert();

   /**
    * @return string UPDATE string
    */
   function getUpdate();

   /**
    * @return string DELETE string
    */
   function getDelete();

   /**
    * @return string SET string
    */
   function getSet();

   /**
    * @return string VALUES string
    */
   function getValues();

   /**
    * @return string 'all' string (*)
    */
   function getAll();

   /**
    * @return string FROM string
    */
   function getFrom();

   /**
    * @return string WHERE string
    */
   function getWhere();

   /**
    * @return string AND string
    */
   function getAnd();

   /**
    * @return string OR string
    */
   function getOr();

   /**
    * @return string NOT string
    */
   function getNot();

   /**
    * @return string equals string
    */
   function getEquals();

   /**
    * @return string greater string
    */
   function getGreater();

   /**
    * @return string smaller string
    */
   function getSmaller();

   /**
    * @return string ORDER BY string
    */
   function getOrderBy();

   /**
    * @return string ASC string
    */
   function getAscending();

   /**
    * @return string DESC string
    */
   function getDescending();

   /**
    * @return string IS NULL string
    */
   function getIsNull();

   /**
    * @return string AS string
    */
   function getAs();
}

}
