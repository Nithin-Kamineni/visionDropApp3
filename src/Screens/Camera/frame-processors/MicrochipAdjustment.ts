import type { Frame } from 'react-native-vision-camera'
import { VisionCameraProxy } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('microchip_adjustment', { foo: 'bar' })

interface Result {
  // example_array: (string | number | boolean)[]
  // example_array_buffer: ArrayBuffer
  // example_str: string
  // example_bool: boolean
  // example_double: number
  height: number
  width: number
  squaresFound: number
  circleFound: boolean
  maxCircle: any
  squares: any
  contoursImgBase64: any
  maskBase64: any
  resultBase64: any
}

export function microchipAdjustmentPlugin(frame: Frame): Result {
  'worklet'

  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "microchip_adjustment"!')

  return plugin.call(frame, {
    someString: 'hello!',
    someBoolean: true,
    someNumber: 42,
    someObject: { test: 0, second: 'test' },
    someArray: ['another test', 5],
    squaresFound: 92,
  }) as unknown as any
}