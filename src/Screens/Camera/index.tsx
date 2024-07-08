import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {Alert, Modal, Pressable, Image} from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Slider,
  NativeBaseProvider,
  Badge,
  Box,
  Center,
} from '@gluestack-ui/themed-native-base';
import Svg, {Circle, Rect, Path} from 'react-native-svg';
import {Camera} from 'react-native-vision-camera';
import Categories from './Categories';
import CameraPage from './Camera';
import Permissions from './Permissions';

// import RTNMyPicker from 'rtn-my-picker/js/NativeMyPicker';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

export default function CameraNavigation({navigation}: any) {
  let cameraPermission = 'not-determined';
  if (Camera) {
    console.log(
      '------------------------------------------------------------------------------------------------',
    );
    console.log('camera', Camera);
    cameraPermission = Camera.getCameraPermissionStatus();
  }
  if (cameraPermission === 'granted') {
    const devices = Camera.getAvailableCameraDevices();
    console.log('devices', devices);
  }

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission}`);

  const showPermissionsPage = cameraPermission !== 'granted';

  return (
    <Stack.Navigator
      initialRouteName={showPermissionsPage ? 'Permissions' : 'Categories'}>
      <Stack.Screen name="Categories" component={Categories} />
      <Stack.Screen name="Permissions" component={Permissions} />
      <Stack.Screen
        name="CameraPage"
        component={CameraPage}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
