import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionScreen() {
  return (
    <LinearGradient
      colors={['#081B3A', '#030914', '#050E1F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 110, alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-royal-100 text-xl font-bold">Collection</Text>
          <Text className="text-white/60 text-sm mt-2 text-center">Unlocked badges, cards, and artifacts coming soon.</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
