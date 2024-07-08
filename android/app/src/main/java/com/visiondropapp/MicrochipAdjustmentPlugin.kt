package com.visiondropapp

import android.util.Log
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy

import android.graphics.Bitmap
import java.nio.ByteBuffer

import org.opencv.android.Utils
import org.opencv.core.*
import org.opencv.core.Mat
import org.opencv.core.Point
import org.opencv.core.CvType
import org.opencv.core.Size

import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.imgproc.Imgproc

import android.media.Image

class MicrochipAdjustmentFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
    init {
        Log.d("MicrochipAdjustmentPlugin", "MicrochipAdjustmentFrameProcessorPlugin initialized with options: " + options?.toString())
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

        val yuvImage = Mat(Size(image.width.toDouble(), image.height.toDouble()), CvType.CV_8UC1)
        yuvImage.put(0, 0, nv21)

        val rgbImage = Mat()
        Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21, 3)

        return rgbImage
    }

    override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
        if (params == null) {
            return null
        }

        val image = frame.image
        Log.d(
            "MicrochipAdjustmentPlugin",
            image.width.toString() + " x " + image.height + " Image with format #" + image.format + ". Logging " + params.size + " parameters:"
        )

        for (key in params.keys) {
            val value = params[key]
            Log.d("MicrochipAdjustmentPlugin", "  -> " + if (value == null) "(null)" else value.toString() + " (" + value.javaClass.name + ")")
        }

        // Convert the image to a Mat
        val mat = convertImageToMat(image)

        // Get the dimensions of the Mat
        val width = mat.width()
        val height = mat.height()

        Log.d("MicrochipAdjustmentPlugin", "Image dimensions: width = $width, height = $height")

        return hashMapOf<String, Any>(
            "width" to width,
            "height" to height,
            "example_str" to "KotlinTest",
            "example_bool" to false,
            "example_double" to 6.7,
            "example_array" to arrayListOf<Any>(
                "Good bye",
                false,
                21.37
            )
        )
    }
}