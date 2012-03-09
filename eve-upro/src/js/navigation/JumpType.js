/**
 * A jump type identifies how a system can be reached
 */
upro.nav.JumpType =
{
   /** Initial value - typically used for instances either not known or start systems */
   None: "None",

   // MedicalClone -- requires knowledge where it is. Would be awesome: Stranded in W-Space,
   //                 and the only solution your computer comes up with is: Kill yourself.
   // JumpClone -- requires knowledge where they are and from where a jump can be initiated (list of stations)

   /** A pair of jump gates permanently connecting two systems */
   JumpGate: "JumpGate",
   /** A transport system in the ship available for low-/nullsec destinations within range in NewEden */
   JumpDrive: "JumpDrive",
   /** A pair of built structures that act as jump gates between two systems */
   JumpBridge: "JumpBridge",
   /** A static wormhole permanently connects two systems, but the entries are moving. */
   StaticWormhole: "StaticWormhole",
   /** A dynamic wormhole connects two systems for a short period of time */
   DynamicWormhole: "DynamicWormhole"

   // TitanBridge -- technically correct, but not quite something you can plan with
};
