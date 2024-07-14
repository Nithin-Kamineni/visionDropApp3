import * as React from 'react';
import {useRef, useState, useCallback, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {StyleSheet, Text, View, Image, ScrollView} from 'react-native';
import type {PinchGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {
  PinchGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import type {
  CameraProps,
  CameraRuntimeError,
  PhotoFile,
  VideoFile,
} from 'react-native-vision-camera';
import {
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
  useLocationPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import {
  Camera,
  useCameraDevices,
  getCameraDevice,
} from 'react-native-vision-camera';
import {
  CONTENT_SPACING,
  CONTROL_BUTTON_SIZE,
  MAX_ZOOM_FACTOR,
  SAFE_AREA_PADDING,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from './Constants';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';

import {useSharedValue as sharedValueWorklet} from 'react-native-worklets-core';

import {useEffect} from 'react';

// import {StatusBarBlurBackground} from './StatusBarBlurBackground';
import {CaptureButton} from '../../components/CaptureButton';
import {SequenceButton} from '../../components/SequenceButton';

import {PressableOpacity} from 'react-native-pressable-opacity';

import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useIsFocused} from '@react-navigation/core';

// import {usePreferredCameraDevice} from '../../hooks/usePreferredCameraDevice';
import {useIsForeground} from '../../hooks/useIsForeground';

import {examplePlugin} from './frame-processors/ExamplePlugin';
import {exampleKotlinSwiftPlugin} from './frame-processors/ExampleKotlinSwiftPlugin';

import {microchipAdjustmentPlugin} from './frame-processors/MicrochipAdjustment';
import {microchipLedDetectionPlugin} from './frame-processors/MicrochipLedDetection';
import {microchipProcessExtractionPlugin} from './frame-processors/MicrochipProcessExtracton';

import {useSkiaFrameProcessor, DrawableFrame} from 'react-native-vision-camera';
import {Skia} from '@shopify/react-native-skia';

import {Modal, Portal, Button, PaperProvider} from 'react-native-paper';
import {resolveBuildTimeSx} from '@gluestack-style/react';
import {blue, green} from 'react-native-reanimated/lib/typescript/Colors';
import {Sequence} from './Sequence';

interface Result {
  example_array: (string | number | boolean)[];
  example_array_buffer: ArrayBuffer;
  example_str: string;
  example_bool: boolean;
  example_double: number;
  height: number;
  width: number;
  squaresFound: number;
  circleFound: boolean;
  maxCircle: any;
  squares: any;
}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;

const BulbRGBvaluesMap = {
  white: 'rgba(190, 190, 190, 0.7)',
  red: 'rgba(190, 10, 10, 0.7)',
  green: 'rgba(10, 190, 10, 0.7)',
  blue: 'rgba(10, 10, 190, 0.7)',
};

// type Props = NativeStackScreenProps<Routes, 'CameraPage'>
type Props = NativeStackScreenProps<any, 'CameraPage'>;

export default function CameraView({navigation}: Props): React.ReactElement {
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const zoom = useSharedValue(1);
  const isPressingButton = useSharedValue(false);
  const previewStatus = useSharedValue(false);
  const lastFrameTime = useSharedValue(Date.now());

  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const circlePoints = sharedValueWorklet<{x: number; y: number}[]>([
    // {x: 50, y: 2010}, //top left
    // {x: 50, y: 150}, //top right
    // {x: 3820, y: 2010}, //bottom left
    // {x: 3820, y: 150}, //bottom right
  ]);

  const SquarePoints = sharedValueWorklet<{x: number; y: number}[][]>([]);

  const StandardRGBPixels = sharedValueWorklet<
    | {red: number; green: number; blue: number}
    | {red: undefined; green: undefined; blue: undefined}
    | null
  >(null);

  const AdjustedImage = sharedValueWorklet<boolean>(false);
  const AdjustedStandardImageRGB = sharedValueWorklet<boolean>(false);

  const LedColor = sharedValueWorklet<'red' | 'green' | 'blue' | 'white'>(
    'white',
  );

  const [LedColorState, setLedColorState] = useState(LedColor.value);
  useEffect(() => {
    console.log(
      'change color ------------------------------------------------------------------------------------------',
      LedColor.value,
    );
    setLedColorState(LedColor.value);
  }, [LedColor]);

  //debug
  const imageRef = sharedValueWorklet<string[]>([
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79TTSm1s5J4LwWmYNCTDF49V32qdzOuuk8w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79TTSm1s5J4LwWmYNCTDF49V32qdzOuuk8w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ79TTSm1s5J4LwWmYNCTDF49V32qdzOuuk8w&s',
  ]);

  const isSequenceRunning = useRef(false);

  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    console.log(
      '1----------------------------------------------------------------------------------1',
    );
    setImages(imageRef.value);
  }, [imageRef]);

  useEffect(() => {
    if (isActive) {
      navigation
        .getParent()
        ?.setOptions({headerShown: false, tabBarStyle: {display: 'none'}});
    } else {
      navigation
        .getParent()
        ?.setOptions({headerShown: true, tabBarStyle: undefined});
    }

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      navigation
        .getParent()
        ?.setOptions({headerShown: true, tabBarStyle: undefined});
    });

    return unsubscribe;
  }, [isActive, navigation]);

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [enableNightMode, setEnableNightMode] = useState(false);

  // camera device settings
  //   const [preferredDevice] = usePreferredCameraDevice();

  const devices = useCameraDevices();
  const preferredDevice = getCameraDevice(devices, 'back');

  let device = useCameraDevice(cameraPosition);

  if (preferredDevice != null && preferredDevice.position === cameraPosition) {
    // override default device with the one selected by the user in settings
    device = preferredDevice;
  }

  const [targetFps, setTargetFps] = useState(30);

  const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;

  const format = useCameraFormat(device, [
    {fps: targetFps},
    {videoAspectRatio: screenAspectRatio},
    {videoResolution: 'max'},
    {photoAspectRatio: screenAspectRatio},
    {photoResolution: 'max'},
  ]);

  const fps = Math.min(format?.maxFps ?? 1, targetFps);

  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = format?.supportsPhotoHdr;

  const supports60Fps = useMemo(
    () => device?.formats.some(f => f.maxFps >= 60),
    [device?.formats],
  );
  const canToggleNightMode = device?.supportsLowLightBoost ?? false;

  //#region Animated Zoom
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  console.log('minZoom', minZoom);
  console.log('maxZoom', maxZoom);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Callbacks
  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error('error', error);
  }, []);
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);
  const onMediaCaptured = useCallback(
    (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      console.log(`Media captured! ${JSON.stringify(media)}`);
      // navigation.navigate('MediaPage', {
      //   path: media.path,
      //   type: type,
      // })

      // start-sequence
    },
    [navigation],
  );

  const stopSequence = async (onFinish: () => void) => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('Stoping sequence...');
      isSequenceRunning.current = false;
      onFinish();
      console.log('Stoped Sequence');
    } catch (e) {
      console.error('Failed to stop sequence!', e);
      // onFinish();
    }
  };

  const startSequence = async (onFinish: () => void) => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('Starting sequence...');
      const startTime = Date.now();
      const duration = 30000; // 30 seconds in milliseconds
      isSequenceRunning.current = true;

      const takePhotoAndTrackTime = async () => {
        if (!isSequenceRunning.current) {
          console.log('Sequence stopped!');
          onFinish();
          return;
        }

        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        // Print the elapsed time every 100 milliseconds
        if (elapsedTime % 100 < 50) {
          console.log(`Elapsed time: ${elapsedTime}ms`);
        }

        // Take a photo once at the beginning
        if (elapsedTime === 0) {
          if (camera.current == null) throw new Error('Camera ref is null!');

          const photo = await camera.current.takePhoto({
            flash: flash,
            enableShutterSound: true,
          });
          onMediaCaptured(photo, 'photo');
        }

        // Stop after 30 seconds
        if (elapsedTime < duration) {
          setTimeout(takePhotoAndTrackTime, 100);
        } else {
          console.log('Sequence completed!');
          isSequenceRunning.current = false;
          onFinish();
        }
      };

      // Start the process
      takePhotoAndTrackTime();
    } catch (e) {
      console.error('Failed to start sequence!', e);
      isSequenceRunning.current = false;
      onFinish();
    }
  };

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);
  //#endregion

  //#region Tap Gesture
  const onFocusTap = useCallback(
    ({nativeEvent: event}: GestureResponderEvent) => {
      console.log('before support focus');
      if (!device?.supportsFocus) return;
      console.log('after support focus');
      camera.current?.focus({
        x: event.locationX,
        y: event.locationY,
      });
      console.log('support focus done');
    },
    [device?.supportsFocus],
  );
  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // Reset zoom to it's default everytime the `device` changes.
    zoom.value = device?.neutralZoom ?? 1;
  }, [zoom, device]);
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    {startZoom?: number}
  >({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP,
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP,
      );
    },
  });
  //#endregion

  useEffect(() => {
    const f =
      format != null
        ? `(${format.photoWidth}x${format.photoHeight} photo / ${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
        : undefined;
    console.log(`Camera: ${device?.name} | Format: ${f}`);
  }, [device?.name, format, fps]);

  //   const frameProcessor = useFrameProcessor(frame => {
  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      frame.render();

      runAtTargetFps(1 / 10, () => {
        'worklet';
        //every 5 seconds

        // console.log(
        //   `${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`,
        // );
        const examplePluginStartTime = performance.now();
        examplePlugin(frame);
        const examplePluginEndTime = performance.now();
        console.log(
          `examplePlugin execution time: ${
            examplePluginEndTime - examplePluginStartTime
          } ms`,
        );

        const exampleKotlinSwiftPluginStartTime = performance.now();
        exampleKotlinSwiftPlugin(frame);
        const exampleKotlinSwiftPluginEndTime = performance.now();
        console.log(
          `exampleKotlinSwiftPlugin execution time: ${
            exampleKotlinSwiftPluginEndTime - exampleKotlinSwiftPluginStartTime
          } ms`,
        );

        //Adjustment
        const microchipAdjustmentPluginStartTime = performance.now();
        var result: any = microchipAdjustmentPlugin(frame);
        const microchipAdjustmentPluginEndTime = performance.now();
        console.log(
          `microchipAdjustmentPlugin execution time: ${
            microchipAdjustmentPluginEndTime -
            microchipAdjustmentPluginStartTime
          } ms`,
        );

        // Set paths of the images here
        const originalImgBase64 = `data:image/jpeg;base64,${result.originalImgBase64}`;
        const contoursImgBase64 = `data:image/jpeg;base64,${result.contoursImgBase64}`;
        const maskBase64 = `data:image/jpeg;base64,${result.maskBase64}`;
        const resultBase64 = `data:image/jpeg;base64,${result.resultBase64}`;

        imageRef.value = [
          originalImgBase64,
          contoursImgBase64,
          maskBase64,
          resultBase64,
        ];

        console.log(
          'redPixel=',
          result.standardRedPixels,
          'greenPixel=',
          result.standardGreenPixels,
          'bluePixel=',
          result.standardBluePixels,
        );

        if (result.circleFound && result.squares.length > 0) {
          AdjustedImage.value = true;
        } else {
          AdjustedImage.value = false;
        }

        if (result.circleFound && AdjustedStandardImageRGB.value === false) {
          StandardRGBPixels.value = {
            red: result.standardRedPixels,
            green: result.standardGreenPixels,
            blue: result.standardBluePixels,
          };
          AdjustedStandardImageRGB.value = true;
        }

        if (result.maxCircle?.contour) {
          console.log('circlePoints1', circlePoints.value.length);
          circlePoints.value = result.maxCircle.contour.map((point: any[]) => ({
            x: point[0],
            y: point[1],
          }));

          console.log('circlePoints1', circlePoints.value.length);
        } else {
          circlePoints.value = [];
        }

        if (result.squaresFound && result.squares) {
          // console.log('squares', result.squaresFound, result.squares);
          // console.log('SquarePoints1', SquarePoints.value.length);
          let squares = [];
          for (let i = 0; i < result.squares.length; i++) {
            squares.push(
              result.squares[i].approx.map((point: any[]) => ({
                x: point[0],
                y: point[1],
              })),
            );
          }
          SquarePoints.value = squares;
          // console.log(
          //   'SquarePoints1',
          //   SquarePoints.value.length,
          //   SquarePoints.value,
          // );
        } else {
          SquarePoints.value = [];
        }
      });
      // end of 30 sec

      runAtTargetFps(5, () => {
        'worklet';
        if (
          StandardRGBPixels !== null &&
          StandardRGBPixels.value?.red !== undefined &&
          StandardRGBPixels.value?.green !== undefined &&
          StandardRGBPixels.value?.blue !== undefined
        ) {
          const microchipLedDetectionPluginStartTime = performance.now();
          var result: any = microchipLedDetectionPlugin(
            frame,
            StandardRGBPixels.value,
          );

          console.log('result Led', result);
          LedColor.value = result['ledColor'];

          const microchipLedDetectionPluginEndTime = performance.now();
          console.log(
            `microchipLedDetectionPlugin execution time: ${
              microchipLedDetectionPluginEndTime -
              microchipLedDetectionPluginStartTime
            } ms`,
          );
        }
      });

      // // Create a paint object for drawing points
      // const paintCircle = Skia.Paint();
      // paintCircle.setColor(Skia.Color('red'));
      // paintCircle.setStrokeWidth(25);

      // for (let i = 0; i < circlePoints.value.length - 1; i++) {
      //   let x1 = circlePoints.value[i].x;
      //   let y1 = circlePoints.value[i].y;
      //   let x2 = circlePoints.value[i + 1].x;
      //   let y2 = circlePoints.value[i + 1].y;

      //   frame.drawLine(x1, y1, x2, y2, paintCircle);
      // }

      // const paintSquare = Skia.Paint();
      // paintSquare.setColor(Skia.Color('green'));
      // paintSquare.setStrokeWidth(25);

      // for (let i = 0; i < SquarePoints.value.length; i++) {
      //   for (let j = 0; j < SquarePoints.value[i].length; j++) {
      //     let j1 = j;
      //     let j2 = (j + 1) % 4;
      //     let x1 = SquarePoints.value[i][j1].x;
      //     let y1 = SquarePoints.value[i][j1].y;
      //     let x2 = SquarePoints.value[i][j2].x;
      //     let y2 = SquarePoints.value[i][j2].y;

      //     frame.drawLine(x1, y1, x2, y2, paintSquare);
      //   }
      // }
    },
    [
      imageRef,
      circlePoints,
      SquarePoints,
      StandardRGBPixels,
      AdjustedImage,
      AdjustedStandardImageRGB,
      LedColor,
    ],
  );

  const videoHdr = format?.supportsVideoHdr && enableHdr;
  const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr;

  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {
    backgroundColor: 'white',
    padding: 20,
    height: '50%', // Adjust this value as needed
    width: '80%', // Adjust this value as needed
    alignSelf: 'center',
    borderRadius: 10,
  };

  return (
    <>
      <View style={styles.container}>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            // contentContainerStyle={containerStyle}
          >
            <ScrollView>
              {imageRef.value.map((image, index) => (
                <Image
                  key={index}
                  // source={{ uri: `file://${image}` }}
                  source={{uri: `${image}`}}
                  style={{
                    width: '100%',
                    height: 300,
                    resizeMode: 'contain',
                    marginBottom: 10,
                  }}
                />
              ))}
            </ScrollView>
            <Button onPress={hideModal}>Close</Button>
          </Modal>
        </Portal>

        {device != null && (
          <PinchGestureHandler
            onGestureEvent={onPinchGesture}
            enabled={isActive}>
            <Reanimated.View
              // onTouchEnd={onFocusTap}
              style={StyleSheet.absoluteFill}>
              <ReanimatedCamera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                ref={camera}
                onInitialized={onInitialized}
                onError={onError}
                onStarted={() => console.log('Camera started!')}
                onStopped={() => console.log('Camera stopped!')}
                onPreviewStarted={() => {
                  previewStatus.value = true;
                  console.log('Preview started!');
                }}
                onPreviewStopped={() => {
                  previewStatus.value = false;
                  console.log('Preview stopped!');
                }}
                // preview={previewStatus}
                onOutputOrientationChanged={o =>
                  console.log(`Output orientation changed to ${o}!`)
                }
                onPreviewOrientationChanged={o =>
                  console.log(`Preview orientation changed to ${o}!`)
                }
                onUIRotationChanged={degrees =>
                  console.log(`UI Rotation changed: ${degrees}°`)
                }
                format={format}
                fps={fps}
                photoHdr={photoHdr}
                videoHdr={videoHdr}
                photoQualityBalance="quality"
                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                enableZoomGesture={false}
                animatedProps={cameraAnimatedProps}
                exposure={0}
                enableFpsGraph={true}
                outputOrientation="preview"
                photo={true}
                video={true}
                frameProcessor={frameProcessor}
                focusable={true}
              />
            </Reanimated.View>
          </PinchGestureHandler>
        )}

        {/* <CaptureButton
          style={styles.captureButton}
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          cameraZoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          flash={supportsFlash ? flash : 'off'}
          enabled={isCameraInitialized && isActive}
          setIsPressingButton={setIsPressingButton}
        /> */}

        <SequenceButton
          style={styles.sequenceButton}
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          cameraZoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          flash={supportsFlash ? flash : 'off'}
          enabled={isCameraInitialized && isActive}
          setIsPressingButton={setIsPressingButton}
          startSequence={startSequence}
          stopSequence={stopSequence}
        />

        {/* <StatusBarBlurBackground /> */}

        <PressableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'Categories'}],
            });
            navigation
              .getParent()
              ?.setOptions({headerShown: true, tabBarStyle: undefined});
          }}
          disabledOpacity={0.4}>
          <IonIcon name="arrow-back" color="white" size={24} />
        </PressableOpacity>

        <PressableOpacity
          style={styles.moreButton}
          onPress={() => {
            showModal();
          }}
          disabledOpacity={0.4}>
          <IonIcon name="albums-outline" color="white" size={24} />
        </PressableOpacity>

        <PressableOpacity
          style={[
            styles.bulbIcon,
            {backgroundColor: BulbRGBvaluesMap[LedColorState]},
          ]}>
          <IonIcon name="bulb" color="white" size={25} />
        </PressableOpacity>

        <View style={styles.rightButtonRow}>
          <PressableOpacity
            style={styles.button}
            onPress={onFlipCameraPressed}
            disabledOpacity={0.4}>
            <IonIcon name="camera-reverse" color="white" size={24} />
          </PressableOpacity>
          {supportsFlash && (
            <PressableOpacity
              style={styles.button}
              onPress={onFlashPressed}
              disabledOpacity={0.4}>
              <IonIcon
                name={flash === 'on' ? 'flash' : 'flash-off'}
                color="white"
                size={24}
              />
            </PressableOpacity>
          )}
          {supports60Fps && (
            <PressableOpacity
              style={styles.button}
              onPress={() => setTargetFps(t => (t === 30 ? 60 : 30))}>
              <Text style={styles.text}>{`${targetFps}\nFPS`}</Text>
            </PressableOpacity>
          )}
          {supportsHdr && (
            <PressableOpacity
              style={styles.button}
              onPress={() => setEnableHdr(h => !h)}>
              <MaterialIcon
                name={enableHdr ? 'hdr' : 'hdr-off'}
                color="white"
                size={24}
              />
            </PressableOpacity>
          )}
          {canToggleNightMode && (
            <PressableOpacity
              style={styles.button}
              onPress={() => setEnableNightMode(!enableNightMode)}
              disabledOpacity={0.4}>
              <IonIcon
                name={enableNightMode ? 'moon' : 'moon-outline'}
                color="white"
                size={24}
              />
            </PressableOpacity>
          )}
          {/* <PressableOpacity style={styles.button} onPress={() => navigation.navigate('Devices')}>
              <IonIcon name="settings-outline" color="white" size={24} />
            </PressableOpacity>
            <PressableOpacity style={styles.button} onPress={() => navigation.navigate('CodeScannerPage')}>
              <IonIcon name="qr-code-outline" color="white" size={24} />
            </PressableOpacity> */}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  sequenceButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop + 10,
    left: SAFE_AREA_PADDING.paddingLeft + 10,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop + 60,
    left: SAFE_AREA_PADDING.paddingLeft + 10,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulbIcon: {
    position: 'absolute',
    alignSelf: 'center',
    top: SAFE_AREA_PADDING.paddingTop + 10,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
