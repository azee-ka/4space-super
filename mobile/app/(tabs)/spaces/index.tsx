import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/styles/theme';

export default function SpacesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <View style={styles.iconWrap}>
            <Ionicons name="apps-outline" size={56} color={theme.colors.textPrimary} />
          </View>
          <Text style={styles.emptyTitle}>No Spaces Yet</Text>
          <Text style={styles.emptyDescription}>
            Create or join a space to collaborate with your team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.base,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});
