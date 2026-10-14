import { router, type Href } from 'expo-router';

// Screens can be opened directly (deep link, web refresh) with nothing to go back to.
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
