import type { Frame } from 'react-native-vision-camera'
import { VisionCameraProxy } from 'react-native-vision-camera'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('microchip_process_extraction', { foo: 'bar' })

export function microchipProcessExtractionPlugin(frame: Frame): string[] {
  'worklet'

  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "microchip_process_extraction"!')

  return plugin.call(frame, {
    someString: 'hello!',
    someBoolean: true,
    someNumber: 42,
    someObject: { test: 0, second: 'test' },
    someArray: ['another test', 5],
  }) as string[]
}