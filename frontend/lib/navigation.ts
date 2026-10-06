import { Href, useRouter } from "expo-router";

type Router = ReturnType<typeof useRouter>;

/** Back if there is history (normal in-app navigation), otherwise to a sensible parent (deep link / web refresh). */
export function goBack(router: Router, fallback: Href = "/") {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
