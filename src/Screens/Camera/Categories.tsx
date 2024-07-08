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

import {
  Slider,
  NativeBaseProvider,
  Badge,
  Box,
  Center,
} from '@gluestack-ui/themed-native-base';

import CategoryGridTile from '../../components/CategoryGridTile';

class Category {
  id: string;
  title: string;
  color: string;
  imageUrl: string;
  constructor(id: string, title: string, color: string, imageUrl: string) {
    this.id = id;
    this.title = title;
    this.color = color;
    this.imageUrl = imageUrl;
  }
}

export const CATEGORIES = [
  new Category(
    'c1',
    'Auto',
    '#DEDBD1',
    'https://cdn-icons-png.flaticon.com/512/2226/2226124.png',
  ),
  new Category(
    'c2',
    'Microchip 1',
    '#DECD9D',
    'https://cdn-icons-png.flaticon.com/512/8382/8382828.png',
  ),
  new Category(
    'c3',
    'Microchip 2',
    '#DECD9D',
    'https://cdn-icons-png.flaticon.com/512/8382/8382828.png',
  ),
  new Category(
    'c4',
    'Microchip 3',
    '#DEDBD1',
    'https://cdn-icons-png.flaticon.com/512/2226/2226124.png',
  ),
];

export default function Categories({navigation}: any) {
  function renderCategoryItem(itemData: {
    item: {title: any; color: any; imageUrl: any};
  }) {
    return (
      <CategoryGridTile
        title={itemData.item.title}
        color={itemData.item.color}
        imageUrl={itemData.item.imageUrl}
        OnPress={() => {
          navigation.navigate('CameraPage');
        }}
      />
    );
  }

  return (
    <>
      <NativeBaseProvider>
        <View style={{flex: 1}}>
          <FlatList
            data={CATEGORIES}
            keyExtractor={item => item.id}
            renderItem={renderCategoryItem}
            numColumns={2}
          />
        </View>
      </NativeBaseProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  camera: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  svgOverlay: {
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
    zIndex: 3, // Ensure it appears on top
  },
  touchButtons: {
    zIndex: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  circleMesh: {
    width: 150,
    height: 150,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  squareMesh: {
    width: 35,
    height: 35,
    borderWidth: 2,
    borderColor: 'purple',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  topLeftSquare: {
    top: 210,
    left: -60,
  },
  bottomLeftSquare: {
    bottom: 210,
    left: -60,
  },
  bottomRightSquare: {
    bottom: 210,
    right: -60,
  },
  timerTextBelowButton: {
    color: '#fff',
    fontSize: 18,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 45,
    left: '50%',
    transform: [{translateX: -35}],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff4242',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer1: {
    position: 'absolute',
    bottom: 130,
    left: '50%',
    transform: [{translateX: -35}],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton1: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    position: 'absolute',
    bottom: 55,
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(230, 220, 243, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    marginBottom: 20,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  buttonCorrect: {
    backgroundColor: 'green',
  },
  buttonIncorrect: {
    backgroundColor: 'red',
  },
  buttonEscape: {
    backgroundColor: 'grey',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  textStyle1: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10, // or use marginLeft on the bulb itself
  },
  bulbStyle: {
    marginLeft: 10, // Space between the badge and the bulb
  },
  sliderContainer: {
    marginBottom: 95, // Adjust this value to move the slider upwards or downwards
  },
});
