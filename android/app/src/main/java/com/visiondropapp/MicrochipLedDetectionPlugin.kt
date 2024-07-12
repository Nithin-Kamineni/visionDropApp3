package com.visiondropapp

import android.util.Log
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

import android.media.Image
import org.opencv.core.*
import org.opencv.imgproc.Imgproc

import java.nio.ByteBuffer

class MicrochipLedDetectionFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
    init {
        Log.d("MicrochipLedDetectionPlugin", "MicrochipLedDetectionFrameProcessorPlugin initialized with options: " + options?.toString())
    }

    private fun convertImageToMat(image: Image): Mat {
        val planes = image.planes
        val yBuffer: ByteBuffer = planes[0].buffer
        val uBuffer: ByteBuffer = planes[1].buffer
        val vBuffer: ByteBuffer = planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        val yuvImage = Mat(image.height + image.height / 2, image.width, CvType.CV_8UC1)
        yuvImage.put(0, 0, nv21)

        val rgbImage = Mat()
        Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21)

        yuvImage.release()

        return rgbImage
    }

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
        if (params == null) {
            return null
        }

        val image = frame.image
        Log.d(
            "MicrochipLedDetectionPlugin",
            image.width.toString() + " x " + image.height + " Image with format #" + image.format + ". Logging " + params.size + " parameters:"
        )

        for (key in params.keys) {
            val value = params[key]
            Log.d("MicrochipLedDetectionPlugin", "  -> " + if (value == null) "(null)" else value.toString() + " (" + value.javaClass.name + ")")
        }

        // Convert the image to a Mat
        val testMat = convertImageToMat(image)

        // Retrieve the required parameters from the params map
        val thresholdFactor = (params["thresholdFactor"] as? Number)?.toDouble() ?: 1.2
        val standardRedPixels = (params["redPixels"] as? Number)?.toInt() ?: 0
        val standardGreenPixels = (params["greenPixels"] as? Number)?.toInt() ?: 0
        val standardBluePixels = (params["bluePixels"] as? Number)?.toInt() ?: 0

        // Pre-allocate masks
        val testGreenMask = Mat()
        val testRedMask = Mat()
        val testBlueMask = Mat()

        // Define color ranges
        val lowerGreen = Scalar(35.0, 100.0, 100.0)
        val upperGreen = Scalar(85.0, 255.0, 255.0)
        val lowerRed = Scalar(0.0, 100.0, 100.0)
        val upperRed = Scalar(10.0, 255.0, 255.0)
        val lowerBlue = Scalar(100.0, 100.0, 100.0)
        val upperBlue = Scalar(140.0, 255.0, 255.0)

        Core.inRange(testMat, lowerGreen, upperGreen, testGreenMask)
        val testGreenPixels = Core.countNonZero(testGreenMask)
        val greenLed = testGreenPixels > (standardGreenPixels * thresholdFactor)

        Core.inRange(testMat, lowerRed, upperRed, testRedMask)
        val testRedPixels = Core.countNonZero(testRedMask)
        val redLed = testRedPixels > (standardRedPixels * thresholdFactor)
        
        Core.inRange(testMat, lowerBlue, upperBlue, testBlueMask)
        val testBluePixels = Core.countNonZero(testBlueMask)
        val blueLed = testBluePixels > (standardBluePixels * thresholdFactor)

        // Release masks
        testGreenMask.release()
        testRedMask.release()
        testBlueMask.release()

        // return hashMapOf<String, Any>(
        //     "redLed" to redLed,
        //     "greenLed" to greenLed,
        //     "blueLed" to blueLed
        // )
        
        var ledColor = "white"
        if(redLed==true){
            ledColor="red"
        }
        else if(greenLed==true){
            ledColor="green"
        }
        else if(blueLed==true){
            ledColor="blue"
        }

        return hashMapOf<String, Any>(
            "ledColor" to ledColor
        )
    }
}