/**
 * The templates namespace contains the language specific texts
 * Templates are identified using a tag, based on the IETF language tag system
 * See: http://en.wikipedia.org/wiki/IETF_language_tag
 *
 * Templates can be specified in two ways:
 * a) language generic ones, these are registered with the basic code
 *    e.g.: upro.res.text.templates["en"] = { ... }
 *    These templates must have ALL text entries filled.
 * b) specific ones that are based on a generic language, using one sub-tag:
 *    e.g.: upro.res.text.templates["en-US"] = { ... }
 *    These templates may provide less than needed and only overwrite any specifics
 *
 * A template is a map of string/string values. The "en" template is the primary
 * one and also contains comments on what the text is about. The key is of course
 * not seen by the user and the same across all templates.
 */
upro.res.text.templates = {};
