<?php
namespace upro\dataModel
{
/**
 * A group control offers modification methods for groups.
 * For now there are no query methods (such as hasMember) since these are only
 * relevant for permission checks, which should already have happened.
 */
interface GroupControl
{
   /**
    * Destroys the group.
    */
   function destroyGroup();

   /**
    * Adds a member with the given ID. The given member will receive an update on all interest the group has.
    * If the given user is already member of the group, nothing will happen.
    * @param string $userId user UUID
    */
   function addMember($userId);

   /**
    * Removes a member with the given ID. If the user is not member of the group, nothing will happen.
    * @param string $userId user UUID
    */
   function removeMember($userId);

   /**
    * Adds interest about a DataEntry with the given ID. If the given entry is already registered, nothing will happen.
    * @param \upro\dataModel\DataEntryId $contextId the context ID to add interest for
    */
   function addInterest(\upro\dataModel\DataEntryId $contextId);

   /**
    * Adds control over a DataEntry with the given ID. If the given entry is already controlled, nothing will happen.
    * @param \upro\dataModel\DataEntryId $contextId the context ID to receive control over
    */
   function addControl(\upro\dataModel\DataEntryId $contextId);

   /**
    * Removes interest about a DataEntry with given ID. Any ownership will also be removed.
    * If the given entry was not part of the groups interest, nothing will happen.
    * @param \upro\dataModel\DataEntryId $contextId the ID of the entry to remove
    */
   function removeInterest(\upro\dataModel\DataEntryId $contextId);
}

}