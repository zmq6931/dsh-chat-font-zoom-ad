/**
 * Host half of the chat font zoom bundle.
 *
 * The requested capability lives entirely in the browser: the Client module
 * changes the `text` font-size role through the Client `theme` service. This
 * row only carries the bundle into the profile so `dsh-client-modules` loads
 * the Client half; it registers nothing model-facing.
 */
export function apply() {}
