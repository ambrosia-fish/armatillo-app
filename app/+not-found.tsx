import { Link, Stack } from 'expo-router';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { Text, View } from '@/app/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontWeight: 'bold' as '700',
  } as TextStyle,
  link: {
    marginTop: 15,
    paddingVertical: 15,
  } as ViewStyle,
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  } as TextStyle,
});
