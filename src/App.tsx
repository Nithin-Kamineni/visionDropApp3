/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
  NavigationContainer,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {
  GluestackUIProvider,
  Text,
  Icon,
  AddIcon,
  createIcon,
} from '@gluestack-ui/themed';
import {config} from '@gluestack-ui/config';

import {PaperProvider} from 'react-native-paper';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Instructions from './Screens/Instructions/Instructions';
import CameraNavigation from './Screens/Camera';
import ReportsNavigation from './Screens/Reports/ReportsNavigation';

import {Platform} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Database} from '@nozbe/watermelondb';
import {mySchema} from './model/schema';
import {migrations} from './model/migrations';
import {Post, Comment} from './model/models';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations,
  dbName: 'myapp',
  jsi: Platform.OS === 'ios',
  onSetUpError: error => {
    console.log('database failed to load.............');
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Post,
    Comment, // ⬅️ You'll add Models to Watermelon here
  ],
});

const BottomTab = createBottomTabNavigator();

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <NavigationContainer>
      <GluestackUIProvider config={config}>
        <PaperProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <BottomTab.Navigator
              screenOptions={{
                headerStyle: {backgroundColor: '#3c0a6b'},
                headerTintColor: 'white',
              }}
              initialRouteName={'Instructions'}
              detachInactiveScreens={false}>
              <BottomTab.Screen
                name="Instructions"
                component={Instructions}
                options={{
                  tabBarIcon: ({color, size}) => (
                    // <Icon as={InformationCircleIcon} size="xl" color="black" />
                    <Ionicons
                      name="information-circle"
                      color={color}
                      size={size}
                    />
                  ),
                }}
              />
              <BottomTab.Screen
                name="CameraNavigation"
                // component={CameraNavigation}
                component={CameraNavigation}
                options={{
                  tabBarIcon: ({color, size}) => (
                    // <Icon as={CameraIcon} size="xl" color="black" />
                    <Ionicons name="camera" color={color} size={size} />
                  ),
                  title: 'Camera',
                }}
              />
              {/* <BottomTab.Screen
                name="Test"
                component={Instructions}
                options={{
                  tabBarIcon: ({color, size}) => (
                    <Icon as={TestTubeIcon} size="xl" color="black" />
                  ),
                }}
              /> */}
              <BottomTab.Screen
                name="Reports"
                component={ReportsNavigation}
                options={{
                  tabBarIcon: ({color, size}) => (
                    // <Icon as={ReportsIcon} size="xl" color="black" />
                    <MaterialCommunityIcons
                      name="test-tube"
                      color={color}
                      size={size}
                    />
                  ),
                  title: 'Reports Section',
                }}
              />
            </BottomTab.Navigator>
          </GestureHandlerRootView>
        </PaperProvider>
      </GluestackUIProvider>
    </NavigationContainer>
  );
}

// function App(): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <NavigationContainer>
//       <GluestackUIProvider config={config}>
//         <SafeAreaView style={backgroundStyle}>
//           <StatusBar
//             barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//             backgroundColor={backgroundStyle.backgroundColor}
//           />
//           <ScrollView
//             contentInsetAdjustmentBehavior="automatic"
//             style={backgroundStyle}>
//             <Header />
//             <View
//               style={{
//                 backgroundColor: isDarkMode ? Colors.black : Colors.white,
//               }}>
//               <Section title="Step One">
//                 Edit <Text style={styles.highlight}>App.tsx</Text> to change
//                 this screen and then come back to see your edits.
//               </Section>
//               <Section title="See Your Changes">
//                 <ReloadInstructions />
//               </Section>
//               <Section title="Debug">
//                 <DebugInstructions />
//               </Section>
//               <Section title="Learn More">
//                 Read the docs to discover what to do next:
//               </Section>
//               <LearnMoreLinks />
//             </View>
//           </ScrollView>
//         </SafeAreaView>
//       </GluestackUIProvider>
//     </NavigationContainer>
//   );
// }

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

// adb logcat | findstr "ExamplePlugin ExampleKotlinPlugin"

// npx react-native start

// npm start -- --reset-cache
