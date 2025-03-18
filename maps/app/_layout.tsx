import { Stack } from 'expo-router'; // Импортируем Stack
import { MarkerProvider } from '../context/MarkerContext'; // Импортируем MarkerProvider

export default function RootLayout() {
    
  return (
    <MarkerProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Карта' }} />
        <Stack.Screen name="marker/[id]" options={{ title: 'Детали маркера' }} />
      </Stack>
    </MarkerProvider>
  );
}
