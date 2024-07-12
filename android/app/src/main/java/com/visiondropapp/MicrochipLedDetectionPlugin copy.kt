// package com.visiondropapp

// import android.util.Log
// import com.mrousavy.camera.frameprocessors.Frame
// import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
// import com.mrousavy.camera.frameprocessors.VisionCameraProxy

// import android.media.Image
// import org.opencv.core.*
// import org.opencv.imgproc.Imgproc

// import java.nio.ByteBuffer

// class MicrochipLedDetectionFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
//     init {
//         Log.d("MicrochipLedDetectionPlugin", "MicrochipLedDetectionFrameProcessorPlugin initialized with options: " + options?.toString())
//     }

//     private fun convertImageToMat(image: Image): Mat {
//         val planes = image.planes
//         val yBuffer: ByteBuffer = planes[0].buffer
//         val uBuffer: ByteBuffer = planes[1].buffer
//         val vBuffer: ByteBuffer = planes[2].buffer

//         val ySize = yBuffer.remaining()
//         val uSize = uBuffer.remaining()
//         val vSize = vBuffer.remaining()

//         val nv21 = ByteArray(ySize + uSize + vSize)

//         yBuffer.get(nv21, 0, ySize)
//         vBuffer.get(nv21, ySize, vSize)
//         uBuffer.get(nv21, ySize + vSize, uSize)

//         val yuvImage = Mat(image.height + image.height / 2, image.width, CvType.CV_8UC1)
//         yuvImage.put(0, 0, nv21)

//         val rgbImage = Mat()
//         Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21)

//         return rgbImage
//     }

//     override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
//         if (params == null) {
//             return null
//         }

//         val image = frame.image
//         Log.d(
//             "MicrochipLedDetectionPlugin",
//             image.width.toString() + " x " + image.height + " Image with format #" + image.format + ". Logging " + params.size + " parameters:"
//         )

//         for (key in params.keys) {
//             val value = params[key]
//             Log.d("MicrochipLedDetectionPlugin", "  -> " + if (value == null) "(null)" else value.toString() + " (" + value.javaClass.name + ")")
//         }

//         // Convert the image to a Mat
//         val testMat = convertImageToMat(image)

//         // Retrieve the required parameters from the params map
//         val thresholdFactor = (params["thresholdFactor"] as? Number)?.toDouble() ?: 1.2
//         val standardRedPixels = (params["redPixels"] as? Number)?.toInt() ?: 0
//         val standardGreenPixels = (params["greenPixels"] as? Number)?.toInt() ?: 0
//         val standardBluePixels = (params["bluePixels"] as? Number)?.toInt() ?: 0
        

//         val lowerGreen = Scalar(35.0, 100.0, 100.0)
//         val upperGreen = Scalar(85.0, 255.0, 255.0)

//         val lowerRed1 = Scalar(0.0, 100.0, 100.0)
//         val upperRed1 = Scalar(10.0, 255.0, 255.0)
//         val lowerRed2 = Scalar(160.0, 100.0, 100.0)
//         val upperRed2 = Scalar(180.0, 255.0, 255.0)

//         val lowerBlue = Scalar(100.0, 100.0, 100.0)
//         val upperBlue = Scalar(140.0, 255.0, 255.0)

//         val testGreenMask = Mat()
//         Core.inRange(testMat, lowerGreen, upperGreen, testGreenMask)
//         val testGreenPixels = Core.countNonZero(testGreenMask)

//         val greenLed = testGreenPixels > (standardGreenPixels * thresholdFactor)

//         val testRedMask1 = Mat()
//         val testRedMask2 = Mat()
//         Core.inRange(testMat, lowerRed1, upperRed1, testRedMask1)
//         Core.inRange(testMat, lowerRed2, upperRed2, testRedMask2)
//         val testRedMask = Mat()
//         Core.bitwise_or(testRedMask1, testRedMask2, testRedMask)
//         val testRedPixels = Core.countNonZero(testRedMask)

//         val redLed = testRedPixels > (standardRedPixels * thresholdFactor)
        
//         val testBlueMask = Mat()
//         Core.inRange(testMat, lowerBlue, upperBlue, testBlueMask)
//         val testBluePixels = Core.countNonZero(testBlueMask)

//         val blueLed = testBluePixels > (standardBluePixels * thresholdFactor)


//         return hashMapOf<String, Any>(
//             "redLed" to redLed,
//             "greenLed" to greenLed,
//             "blueLed" to blueLed
//         )
//     }
// }