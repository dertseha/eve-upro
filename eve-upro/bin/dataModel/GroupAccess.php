<?php
namespace upro\dataModel
{
/**
 * An access interface for group control
 */
interface GroupAccess
{
   /**
    * Returns a group control for an existing group
    * @param string $groupId the UUID of the group
    * @return \upro\dataModel\GroupControl the control to the given group or null if not found
    */
   function getGroupControl($groupId);

   /**
    * Requests to create a group
    * @param string $groupId the UUID of the group
    * @param string $groupType group type identification
    * @return \upro\dataModel\GroupControl the control to the created group
    */
   function createGroup($groupId, $groupType);
}

}