import { router, type Href } from 'expo-router';

/**
 * Go back to the previous screen, or to `fallback` if there isn't one.
 * Screens can be opened directly (deep link, web refresh) with nothing to go back to.
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
