import type { Frame } from 'react-native-vision-camera'
import { VisionCameraProxy } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('microchip_led_detection', { foo: 'bar' })

export function microchipLedDetectionPlugin(frame: Frame, StandardRGBPixels: {red: number; green: number; blue: number;}): string[] {
  'worklet'

  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "microchip_led_detection"!')

    console.log("microchipLedDetectionPlugin", StandardRGBPixels)
  // return plugin.call(frame, standardFrame, {
  //   someString: 'hello!',
  //   someBoolean: true,
  //   someNumber: 42,
  //   someObject: { test: 0, second: 'test' },
  //   someArray: ['another test', 5],
  // }) as string[]

  return plugin.call(frame, {
    someString: 'hello!',
    someBoolean: true,
    someNumber: 42,
    someObject: { test: 0, second: 'test' },
    someArray: ['another test', 5],
    thresholdFactor: 1.2,
    redPixels: StandardRGBPixels.red,
    greenPixels: StandardRGBPixels.green,
    bluePixels: StandardRGBPixels.blue,
  }) as any
}