import { Stack } from 'expo-router';
import { MarkerProvider } from '../context/MarkerContext';
import { DatabaseProvider } from '../context/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <MarkerProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Карта' }} />
          <Stack.Screen name="marker/[id]" options={{ title: 'Детали маркера' }} />
        </Stack>
      </MarkerProvider>
    </DatabaseProvider>
  );
}