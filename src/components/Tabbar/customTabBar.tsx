import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CustomTabBar() {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Ionicons name="refresh-outline" />
    </View>
  );
}
