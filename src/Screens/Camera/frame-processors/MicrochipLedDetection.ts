import type { Frame } from 'react-native-vision-camera'
import { VisionCameraProxy } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('microchip_led_detection', { foo: 'bar' })

export function microchipLedDetectionPlugin(frame: Frame): string[] {
  'worklet'

  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "microchip_led_detection"!')

  return plugin.call(frame, {
    someString: 'hello!',
    someBoolean: true,
    someNumber: 42,
    someObject: { test: 0, second: 'test' },
    someArray: ['another test', 5],
  }) as string[]
}