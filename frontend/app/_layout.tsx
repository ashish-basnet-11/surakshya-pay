import { Stack } from 'expo-router';
import {useFonts} from 'expo-font';

export default function RootLayout() {
  const [ fontLoaded ] = useFonts({
    "Gilroy-Regular": require("../assets/fonts/Gilroy-Regular.ttf")
  });

  if (!fontLoaded) {
    return null;
  }

  return (
    
    <Stack  initialRouteName="(auth)">
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
