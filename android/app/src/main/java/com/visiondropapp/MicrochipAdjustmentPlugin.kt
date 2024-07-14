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
import kotlin.math.pow
import kotlin.math.sqrt
import kotlin.math.abs

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

import android.util.Base64
import java.io.ByteArrayOutputStream

class MicrochipAdjustmentFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
    init {
        Log.d("MicrochipAdjustmentPlugin", "MicrochipAdjustmentFrameProcessorPlugin initialized with options: " + options?.toString())
    }

    private fun isSquare(contour: MatOfPoint): Boolean {

        // println("RTNMyPicker square 1")

        // val approx = MatOfPoint2f(*contour.toArray())
        // val approxCurve = MatOfPoint2f()
        // Imgproc.approxPolyDP(approx, approxCurve, 0.04 * Imgproc.arcLength(approx, true), true)

        // if (approxCurve.toArray().size != 4) {
        //     return false
        // }

        if (contour.rows() != 4) return false

        // println("RTNMyPicker square 2")

        val rect = Imgproc.minAreaRect(MatOfPoint2f(*contour.toArray()))
        val boxPoints = Array(4) { Point(0.0, 0.0) }
        rect.points(boxPoints)

        // println("RTNMyPicker square 3")

        // Calculate the lengths of the sides
        val sides = boxPoints.mapIndexed { index, point -> 
            sqrt((point.x - boxPoints[(index + 1) % 4].x).pow(2.0) + (point.y - boxPoints[(index + 1) % 4].y).pow(2.0))
        }
        val maxSide = sides.maxOrNull()!!
        val minSide = sides.minOrNull()!!

        // if ((maxSide - minSide) / maxSide >= 50) return false
        if (maxSide/minSide >= 1.2 && maxSide-minSide <= 50.0) return false

        // println("RTNMyPicker square 4")

        // Calculate the angles
        fun angleCos(p0: Point, p1: Point, p2: Point): Double {
            val d1 = Point(p0.x - p1.x, p0.y - p1.y)
            val d2 = Point(p2.x - p1.x, p2.y - p1.y)
            val normD1 = sqrt(d1.x * d1.x + d1.y * d1.y)
            val normD2 = sqrt(d2.x * d2.x + d2.y * d2.y)
            
            return if (normD1 == 0.0 || normD2 == 0.0) {
                0.0
            } else {
                abs((d1.x * d2.x + d1.y * d2.y) / (normD1 * normD2))
            }
        }

        // println("RTNMyPicker square 5")

        val cosines = (0 until 4).map { i ->
            angleCos(boxPoints[i], boxPoints[(i + 1) % 4], boxPoints[(i + 2) % 4])
        }

        // println("RTNMyPicker square 666666666666666666666666666666666666666666")

        return cosines.maxOrNull()!! < 0.1
    }
    
    private fun isCircle(contour: MatOfPoint, approxPoints: MatOfPoint, image: Mat, tolerance: Double = 0.05): Double {

        // val epsilon = 0.04 * Imgproc.arcLength(MatOfPoint2f(*contour.toArray()), true)
        // val approx = MatOfPoint2f()
        // Imgproc.approxPolyDP(MatOfPoint2f(*contour.toArray()), approx, epsilon, true)
        // val approxPoints = MatOfPoint(*approx.toArray())

        if (approxPoints.rows() != 8) {
            return 0.0
        }
    
        if (!Imgproc.isContourConvex(approxPoints)) {
            return 0.0
        }

        // Create a mask of the same size as the image with a single channel
        val mask = Mat.zeros(image.size(), CvType.CV_8UC1)
        
        // Draw the contour on the mask
        Imgproc.drawContours(mask, listOf(contour), -1, Scalar(255.0), Imgproc.FILLED)

        // println("RTNMyPicker circle 4")

        val result = Mat()
        Core.bitwise_and(image, image, result, mask)

        Core.inRange(result, Scalar(200.0, 200.0, 200.0), Scalar(255.0, 255.0, 255.0), result)

        // println("RTNMyPicker circle 5")

        val contourArea = Imgproc.contourArea(contour)

        val whitePixelArea = Core.countNonZero(result).toDouble()

        val totalMaskedPixels = Core.countNonZero(mask).toDouble()
        
        val percentageWhite = if (totalMaskedPixels > 0) (whitePixelArea / totalMaskedPixels) * 100 else 0.0

        if(percentageWhite>70.0 && contourArea>8000.0){
            println("RTNMyPicker successfull $percentageWhite @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        }

        //debug
        // percentageWhite = contourArea

        return percentageWhite
    }

    fun convertMatOfPointToReadableArray(matOfPoint: MatOfPoint): ReadableArray {
        val array = Arguments.createArray()
        matOfPoint.toArray().forEach {
            val pointArray = Arguments.createArray()
            pointArray.pushDouble(it.x)
            pointArray.pushDouble(it.y)
            array.pushArray(pointArray)
        }
        return array
    }

    fun convertListToHashMapList(list: List<Map<String, Any?>>): ArrayList<HashMap<String, Any>> {
        val arrayList = arrayListOf<HashMap<String, Any>>()
        list.forEach {
            arrayList.add(convertMapToHashMap(it))
        }
        return arrayList
    }

    private fun convertMapToHashMap(map: Map<String, Any?>?): HashMap<String, Any> {
        val hashMap = HashMap<String, Any>()
        map?.forEach { (key, value) ->
            when (value) {
                is Boolean -> hashMap[key] = value
                is Int -> hashMap[key] = value
                is Double -> hashMap[key] = value
                is String -> hashMap[key] = value
                is Map<*, *> -> hashMap[key] = convertMapToHashMap(value as Map<String, Any?>)
                is List<*> -> hashMap[key] = value.map {
                    if (it is Map<*, *>) convertMapToHashMap(it as Map<String, Any?>)
                    else it ?: ""
                }
                is ReadableArray -> hashMap[key] = value.toArrayList()
                // is MatOfPoint -> hashMap[key] = convertMatOfPointToReadableArray(value).toArrayList()
                else -> if (value == null) hashMap[key] = ""
            }
        }
        return hashMap
    }

    private fun convertRgbImageToMat(image: Image): Mat {
        // Get the buffer of the RGB image
        val planes = image.planes
        val buffer: ByteBuffer = planes[0].buffer
        val rowStride = planes[0].rowStride
    
        // Create a ByteArray to hold the RGB data
        val pixelStride = planes[0].pixelStride
        val width = image.width
        val height = image.height
        val byteArray = ByteArray(width * height * 3)
    
        // Copy the buffer data into the byteArray
        var bufferPosition = 0
        for (row in 0 until height) {
            val rowOffset = row * rowStride
            for (col in 0 until width) {
                val pixelOffset = col * pixelStride
                byteArray[bufferPosition++] = buffer.get(rowOffset + pixelOffset) // R
                byteArray[bufferPosition++] = buffer.get(rowOffset + pixelOffset + 1) // G
                byteArray[bufferPosition++] = buffer.get(rowOffset + pixelOffset + 2) // B
            }
        }
    
        // Create an OpenCV Mat from the byteArray
        val mat = Mat(height, width, CvType.CV_8UC3)
        mat.put(0, 0, byteArray)
    
        return mat
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

        // val yuvImage = Mat(Size(image.width.toDouble(), image.height.toDouble()), CvType.CV_8UC1)
        // yuvImage.put(0, 0, nv21)

        // val rgbImage = Mat()
        // Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21, 3)

        val yuvImage = Mat(image.height + image.height / 2, image.width, CvType.CV_8UC1)
        yuvImage.put(0, 0, nv21)

        val rgbImage = Mat()
        Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21)

        yuvImage.release()

        return rgbImage
    }

    private fun matToBase64String(mat: Mat): String {
        val bitmap = Bitmap.createBitmap(mat.cols(), mat.rows(), Bitmap.Config.ARGB_8888)
        Utils.matToBitmap(mat, bitmap)
        val byteArrayOutputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream)
        val byteArray = byteArrayOutputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.DEFAULT)
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

        val debug = params["debug"]
        // val debug = (params["debug"] as? String)?.toString() ?: "debug"

        // Convert the image to a Mat
        val originalMat = convertImageToMat(image)

        // Get the dimensions of the Mat
        val width = originalMat.width()
        val height = originalMat.height()

        Log.d("MicrochipAdjustmentPlugin", "Image dimensions: width = $width, height = $height")

        // Convert to grayscale
        val grayMat = Mat()
        Imgproc.cvtColor(originalMat, grayMat, Imgproc.COLOR_RGB2GRAY)

        // Apply Gaussian Blur and Otsu's thresholding
        Imgproc.GaussianBlur(grayMat, grayMat, Size(5.0, 5.0), 0.0)
        Core.bitwise_not(grayMat, grayMat)

        val thresh = Mat()
        Imgproc.threshold(grayMat, thresh, 150.0, 255.0, Imgproc.THRESH_BINARY_INV + Imgproc.THRESH_OTSU)

        // Find contours
        // val contours = ArrayList<MatOfPoint>()
        val contours = mutableListOf<MatOfPoint>()
        val hierarchy = Mat()
        Imgproc.findContours(thresh, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)


        //debug
        var mask = Mat()
        var result = Mat()

        // Process contours
        var squaresFound = 0.0
        var circleFound = false
        var maxCircleProb = 0.0
        var maxCircle: Map<String, Any?>? = null
        val squares = mutableListOf<Map<String, Any?>>()
        val contoursImg = originalMat.clone()

        contours.forEachIndexed { index, contour ->
            // Approximate the contour to a polygon
            val epsilon = 0.04 * Imgproc.arcLength(MatOfPoint2f(*contour.toArray()), true)
            val approx = MatOfPoint2f()
            Imgproc.approxPolyDP(MatOfPoint2f(*contour.toArray()), approx, epsilon, true)
            val approxPoints = MatOfPoint(*approx.toArray())

            // println("RTNMyPicker came square start")
            // Check for square
            if (isSquare(approxPoints)) {
                val area = Imgproc.contourArea(approxPoints)
                if (area > 4000) {
                    squaresFound = squaresFound + 1
                    squares.add(mapOf("layer" to index, "area" to area, "approx" to convertMatOfPointToReadableArray(approxPoints), "contour" to convertMatOfPointToReadableArray(contour)))
                    // println("RTNMyPicker came here square")
                    // println("RTNMyPicker approx: $approxPoints")
                    // println("RTNMyPicker contour: $contour")
                    // println("RTNMyPicker=============================")
                }
            }
        
            // println("RTNMyPicker came square done== $squaresFound")
            // println("RTNMyPicker came circle start")
            // Check for circle
            val circleProb = isCircle(contour, approxPoints, originalMat, 0.05)
            // println("RTNMyPicker end circleProb = $circleProb")
            if (circleProb!=0.0) {
                // println("RTNMyPicker came here circle @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                val area = Imgproc.contourArea(contour)
                // println("RTNMyPicker ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ $circleProb $area")
                if (circleProb > maxCircleProb && area > 8000) {
                    circleFound = true
                    maxCircleProb = circleProb
                    // maxCircle = mapOf("layer" to index, "area" to area, "approx" to approxPoints, "contour" to contour)
                    maxCircle = mapOf("layer" to index, "area" to area, "approx" to convertMatOfPointToReadableArray(approxPoints), "contour" to convertMatOfPointToReadableArray(contour))
                    // Imgproc.drawContours(contoursImg, contours, maxCircle!!["layer"] as Int, Scalar(255.0, 0.0, 0.0), 24)
                    // println("RTNMyPicker came here circle")
                    // println("RTNMyPicker approx: $approxPoints")
                    // println("RTNMyPicker=============================")

                    //debug start
                    // Create a mask of the same size as the image with a single channel
                    mask = Mat.zeros(originalMat.size(), CvType.CV_8UC1)  // originalMat =image
                    
                    // Draw the contour on the mask
                    Imgproc.drawContours(mask, listOf(contour), -1, Scalar(255.0), Imgproc.FILLED)

                    result = Mat()
                    Core.bitwise_and(originalMat, originalMat, result, mask)

                    Core.inRange(result, Scalar(100.0, 100.0, 100.0), Scalar(255.0, 255.0, 255.0), result)
                    //debug end

                }
            }
        }

        // println("RTNMyPicker squares: $squares")

        // println("RTNMyPicker=============================1")

        // Draw contours on the original RGB image
        // val contoursImg = originalMat.clone()
        Imgproc.cvtColor(originalMat, contoursImg, Imgproc.COLOR_RGB2BGR)


        // println("RTNMyPicker=============================1.1")
        
        // Imgproc.drawContours(contoursImg, contours, -1, Scalar(0.0, 0.0, 255.0), 12)
        squares.forEach { square ->
            // println("RTNMyPicker=============================1.2")
            // Imgproc.drawContours(contoursImg, listOf(square["contour"] as MatOfPoint), 0, Scalar(255.0, 0.0, 0.0), 12)
            // Imgproc.drawContours(contoursImg, listOf(convertReadableArrayToMatOfPoint(square["contour"] as ReadableArray)), 0, Scalar(255.0, 0.0, 0.0), 12)
            Imgproc.drawContours(contoursImg, contours, square["layer"] as Int, Scalar(0.0, 255.0, 0.0), 24)
        }
        if (circleFound) {
            // println("RTNMyPicker=============================1.3")
            // Imgproc.drawContours(contoursImg, listOf(maxCircle!!["contour"] as MatOfPoint), 0, Scalar(0.0, 0.0, 255.0), 12)
            // Imgproc.drawContours(contoursImg, listOf(convertReadableArrayToMatOfPoint(maxCircle!!["contour"] as ReadableArray)), 0, Scalar(255.0, 0.0, 0.0), 12)
            Imgproc.drawContours(contoursImg, contours, maxCircle!!["layer"] as Int, Scalar(255.0, 0.0, 0.0), 24)
        } 
        // else {
        //     Imgproc.drawContours(contoursImg, contours, -1, Scalar(255.0, 0.0, 0.0), 24)
        // }

        println("RTNMyPicker=============================2 before matToBase64String")

        // Pre-allocate masks
        val standardGreenMask = Mat()
        val standardRedMask = Mat()
        val standardBlueMask = Mat()

        // Define color ranges
        val lowerGreen = Scalar(35.0, 100.0, 100.0)
        val upperGreen = Scalar(85.0, 255.0, 255.0)
        val lowerRed = Scalar(0.0, 100.0, 100.0)
        val upperRed = Scalar(10.0, 255.0, 255.0)
        val lowerBlue = Scalar(100.0, 100.0, 100.0)
        val upperBlue = Scalar(140.0, 255.0, 255.0)

        
        Core.inRange(originalMat, lowerGreen, upperGreen, standardGreenMask)
        val standardGreenPixels = Core.countNonZero(standardGreenMask)

        Core.inRange(originalMat, lowerRed, upperRed, standardRedMask)
        val standardRedPixels = Core.countNonZero(standardRedMask)
        
        Core.inRange(originalMat, lowerBlue, upperBlue, standardBlueMask)
        val standardBluePixels = Core.countNonZero(standardBlueMask)

        val originalImgBase64 = matToBase64String(originalMat)

        if(circleFound){
            val contoursImgBase64 = matToBase64String(contoursImg)
            val maskBase64 = matToBase64String(mask)
            val resultBase64 = matToBase64String(result)

            return hashMapOf<String, Any>(
            "width" to width,
            "height" to height,
            "squaresFound" to squaresFound,
            "circleFound" to circleFound,
            "originalImgBase64" to originalImgBase64,
            "contoursImgBase64" to contoursImgBase64,
            "maskBase64" to maskBase64,
            "resultBase64" to resultBase64,
            "maxCircle" to convertMapToHashMap(maxCircle),
            "squares" to convertListToHashMapList(squares),
            "standardGreenPixels" to standardGreenPixels,
            "standardRedPixels" to standardRedPixels,
            "standardBluePixels" to standardBluePixels
            )
        }

        return hashMapOf<String, Any>(
            "width" to width,
            "height" to height,
            "squaresFound" to squaresFound,
            "circleFound" to circleFound,
            "originalImgBase64" to originalImgBase64
            // "maxCircle" to (maxCircle ?: emptyMap<String, Any?>())
            // "squares" to mutableListOf<Map<String, Any?>>(squares)
        )
        
    }
}