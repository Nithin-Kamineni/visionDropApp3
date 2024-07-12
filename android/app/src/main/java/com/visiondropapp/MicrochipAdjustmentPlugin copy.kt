// package com.visiondropapp

// import android.util.Log
// import com.mrousavy.camera.frameprocessors.Frame
// import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
// import com.mrousavy.camera.frameprocessors.VisionCameraProxy

// import android.graphics.Bitmap
// import java.nio.ByteBuffer

// import org.opencv.android.Utils
// import org.opencv.core.*
// import org.opencv.core.Mat
// import org.opencv.core.Point
// import org.opencv.core.CvType
// import org.opencv.core.Size

// import org.opencv.core.MatOfPoint
// import org.opencv.core.MatOfPoint2f
// import org.opencv.imgproc.Imgproc

// import android.media.Image
// import kotlin.math.pow
// import kotlin.math.sqrt
// import kotlin.math.abs

// import com.facebook.react.bridge.ReadableArray
// import com.facebook.react.bridge.ReadableMap
// import com.facebook.react.bridge.Arguments
// import com.facebook.react.bridge.WritableArray
// import com.facebook.react.bridge.WritableMap

// class MicrochipAdjustmentFrameProcessorPlugin(proxy: VisionCameraProxy, options: Map<String, Any>?): FrameProcessorPlugin() {
//     init {
//         Log.d("MicrochipAdjustmentPlugin", "MicrochipAdjustmentFrameProcessorPlugin initialized with options: " + options?.toString())
//     }

//     private fun isSquare(contour: MatOfPoint): Boolean {

//         // println("RTNMyPicker square 1")

//         if (contour.rows() != 4) return false

//         // println("RTNMyPicker square 2")

//         val rect = Imgproc.minAreaRect(MatOfPoint2f(*contour.toArray()))
//         val boxPoints = Array(4) { Point(0.0, 0.0) }
//         rect.points(boxPoints)

//         // println("RTNMyPicker square 3")

//         // Calculate the lengths of the sides
//         val sides = boxPoints.mapIndexed { index, point -> 
//             sqrt((point.x - boxPoints[(index + 1) % 4].x).pow(2.0) + (point.y - boxPoints[(index + 1) % 4].y).pow(2.0))
//         }
//         val maxSide = sides.maxOrNull()!!
//         val minSide = sides.minOrNull()!!

//         // if ((maxSide - minSide) / maxSide >= 50) return false
//         if (maxSide/minSide >= 1.2) return false

//         // println("RTNMyPicker square 4")

//         // Calculate the angles
//         fun angleCos(p0: Point, p1: Point, p2: Point): Double {
//             val d1 = Point(p0.x - p1.x, p0.y - p1.y)
//             val d2 = Point(p2.x - p1.x, p2.y - p1.y)
//             val normD1 = sqrt(d1.x * d1.x + d1.y * d1.y)
//             val normD2 = sqrt(d2.x * d2.x + d2.y * d2.y)
            
//             return if (normD1 == 0.0 || normD2 == 0.0) {
//                 0.0
//             } else {
//                 abs((d1.x * d2.x + d1.y * d2.y) / (normD1 * normD2))
//             }
//         }

//         // println("RTNMyPicker square 5")

//         val cosines = (0 until 4).map { i ->
//             angleCos(boxPoints[i], boxPoints[(i + 1) % 4], boxPoints[(i + 2) % 4])
//         }

//         // println("RTNMyPicker square 666666666666666666666666666666666666666666")

//         return cosines.maxOrNull()!! < 0.1
//     }
    
//     private fun isCircle(contour: MatOfPoint, image: Mat, tolerance: Double = 0.05): Double {
//         // Approximation can be added if needed
//         // return Imgproc.isContourConvex(contour) && contour.toArray().size == 8

//         // println("RTNMyPicker circle 1")

//         val approx = MatOfPoint2f(*contour.toArray())
//         val approxCurve = MatOfPoint2f()
//         Imgproc.approxPolyDP(approx, approxCurve, 0.04 * Imgproc.arcLength(approx, true), true)

//         // println("RTNMyPicker circle 2")
//         if (approxCurve.toArray().size != 8) {
//             return 0.0
//         }

//         // println("RTNMyPicker circle 2.5")
    
//         if (!Imgproc.isContourConvex(MatOfPoint(*approxCurve.toArray()))) {
//             return 0.0
//         }

//         // println("RTNMyPicker circle 3")
    
//         val mask = Mat.zeros(image.size(), CvType.CV_8UC1)
//         Imgproc.drawContours(mask, listOf(contour), -1, Scalar(255.0), Imgproc.FILLED)

//         // println("RTNMyPicker circle 4")

//         val result = Mat()
//         Core.bitwise_and(image, image, result, mask)

//         // Debug: Check if the mask is applied correctly
//         val totalMaskedPixels = Core.countNonZero(mask).toDouble()

//         Core.inRange(result, Scalar(100.0, 100.0, 100.0), Scalar(255.0, 255.0, 255.0), result)

//         // println("RTNMyPicker circle 5")

//         val contourArea = Imgproc.contourArea(contour)

//         val whitePixelArea = Core.countNonZero(result).toDouble()

//         val percentageWhite = if (totalMaskedPixels > 0) (whitePixelArea / totalMaskedPixels) * 100 else 0.0

//         if(contourArea>100.0){
//             println("RTNMyPicker circle percentageWhite=$percentageWhite whitePixelArea=$whitePixelArea totalMaskedPixels: $totalMaskedPixels contourArea=$contourArea")
//         }
//         if(percentageWhite>10.0 && contourArea>100.0){
//             val temp=percentageWhite>10.0
//             println("RTNMyPicker successfull $temp $percentageWhite @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
//         }

//         return percentageWhite
//     }

//     fun convertMatOfPointToReadableArray(matOfPoint: MatOfPoint): ReadableArray {
//         val array = Arguments.createArray()
//         matOfPoint.toArray().forEach {
//             val pointArray = Arguments.createArray()
//             pointArray.pushDouble(it.x)
//             pointArray.pushDouble(it.y)
//             array.pushArray(pointArray)
//         }
//         return array
//     }

//     fun convertListToReadableArray(list: List<Map<String, Any?>>): ReadableArray {
//         val array = Arguments.createArray()
//         list.forEach {
//             array.pushMap(convertMapToReadableMap(it))
//         }
//         return array
//     }

//     private fun convertMapToReadableMap(map: Map<String, Any?>?): ReadableMap {
//         val readableMap = Arguments.createMap()
//         map?.forEach { (key, value) ->
//             when (value) {
//                 is Boolean -> readableMap.putBoolean(key, value)
//                 is Int -> readableMap.putInt(key, value)
//                 is Double -> readableMap.putDouble(key, value)
//                 is String -> readableMap.putString(key, value)
//                 is Map<*, *> -> readableMap.putMap(key, convertMapToReadableMap(value as Map<String, Any?>))
//                 is List<*> -> readableMap.putArray(key, convertListToReadableArray(value as List<Map<String, Any?>>))
//                 is ReadableArray -> readableMap.putArray(key, value)
//                 is MatOfPoint -> readableMap.putArray(key, convertMatOfPointToReadableArray(value))
//                 else -> if (value == null) readableMap.putNull(key)
//             }
//         }
//         return readableMap
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

//         val yuvImage = Mat(Size(image.width.toDouble(), image.height.toDouble()), CvType.CV_8UC1)
//         yuvImage.put(0, 0, nv21)

//         val rgbImage = Mat()
//         Imgproc.cvtColor(yuvImage, rgbImage, Imgproc.COLOR_YUV2RGB_NV21, 3)

//         return rgbImage
//     }

//     override fun callback(frame: Frame, params: Map<String, Any>?): Any? {
//         if (params == null) {
//             return null
//         }

//         val image = frame.image
//         Log.d(
//             "MicrochipAdjustmentPlugin",
//             image.width.toString() + " x " + image.height + " Image with format #" + image.format + ". Logging " + params.size + " parameters:"
//         )

//         for (key in params.keys) {
//             val value = params[key]
//             Log.d("MicrochipAdjustmentPlugin", "  -> " + if (value == null) "(null)" else value.toString() + " (" + value.javaClass.name + ")")
//         }

//         // Convert the image to a Mat
//         val originalMat = convertImageToMat(image)

//         // Get the dimensions of the Mat
//         val width = originalMat.width()
//         val height = originalMat.height()

//         Log.d("MicrochipAdjustmentPlugin", "Image dimensions: width = $width, height = $height")

//         // Convert to grayscale
//         val grayMat = Mat()
//         Imgproc.cvtColor(originalMat, grayMat, Imgproc.COLOR_RGB2GRAY)

//         // Apply Gaussian Blur and Otsu's thresholding
//         Imgproc.GaussianBlur(grayMat, grayMat, Size(5.0, 5.0), 0.0)
//         Core.bitwise_not(grayMat, grayMat)

//         val thresh = Mat()
//         Imgproc.threshold(grayMat, thresh, 150.0, 255.0, Imgproc.THRESH_BINARY_INV + Imgproc.THRESH_OTSU)

//         // Find contours
//         // val contours = ArrayList<MatOfPoint>()
//         val contours = mutableListOf<MatOfPoint>()
//         val hierarchy = Mat()
//         Imgproc.findContours(thresh, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)

//         // Process contours
//         var squaresFound = 0.0
//         var circleFound = false
//         var maxCircleProb = 0.0
//         var maxCircle: Map<String, Any?>? = null
//         val squares = mutableListOf<Map<String, Any?>>()
//         val contoursImg = originalMat.clone()

//         contours.forEachIndexed { index, contour ->
//             // Approximate the contour to a polygon
//             val epsilon = 0.04 * Imgproc.arcLength(MatOfPoint2f(*contour.toArray()), true)
//             val approx = MatOfPoint2f()
//             Imgproc.approxPolyDP(MatOfPoint2f(*contour.toArray()), approx, epsilon, true)
//             val approxPoints = MatOfPoint(*approx.toArray())

//             // println("RTNMyPicker came square start")
//             // Check for square
//             if (isSquare(approxPoints)) {
//                 val area = Imgproc.contourArea(approxPoints)
//                 if (area > 4000) {
//                     squaresFound = squaresFound + 1
//                     squares.add(mapOf("layer" to index, "area" to area, "approx" to convertMatOfPointToReadableArray(approxPoints), "contour" to convertMatOfPointToReadableArray(contour)))
//                     // println("RTNMyPicker came here square")
//                     // println("RTNMyPicker approx: $approxPoints")
//                     // println("RTNMyPicker contour: $contour")
//                     // println("RTNMyPicker=============================")
//                 }
//             }
        
//             // println("RTNMyPicker came square done== $squaresFound")
//             // println("RTNMyPicker came circle start")
//             // Check for circle
//             val circleProb = isCircle(approxPoints, originalMat)
//             // println("RTNMyPicker end circleProb = $circleProb")
//             if (circleProb!=0.0) {
//                 // println("RTNMyPicker came here circle @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
//                 val area = Imgproc.contourArea(approxPoints)
//                 // println("RTNMyPicker ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ $circleProb $area")
//                 if (circleProb > maxCircleProb && area > 8000) {
//                     circleFound = true
//                     maxCircleProb = circleProb
//                     // maxCircle = mapOf("layer" to index, "area" to area, "approx" to approxPoints, "contour" to contour)
//                     maxCircle = mapOf("layer" to index, "area" to area, "approx" to convertMatOfPointToReadableArray(approxPoints), "contour" to convertMatOfPointToReadableArray(contour))
//                     Imgproc.drawContours(contoursImg, contours, maxCircle!!["layer"] as Int, Scalar(255.0, 0.0, 0.0), 24)
//                     // println("RTNMyPicker came here circle")
//                     // println("RTNMyPicker approx: $approxPoints")
//                     // println("RTNMyPicker=============================")
//                 }
//             }
//         }

//         // println("RTNMyPicker squares: $squares")

//         // println("RTNMyPicker=============================1")

//         // Draw contours on the original RGB image
//         // val contoursImg = originalMat.clone()
//         Imgproc.cvtColor(originalMat, contoursImg, Imgproc.COLOR_RGB2BGR)


//         // println("RTNMyPicker=============================1.1")
        
//         // Imgproc.drawContours(contoursImg, contours, -1, Scalar(0.0, 0.0, 255.0), 12)
//         squares.forEach { square ->
//             // println("RTNMyPicker=============================1.2")
//             // Imgproc.drawContours(contoursImg, listOf(square["contour"] as MatOfPoint), 0, Scalar(255.0, 0.0, 0.0), 12)
//             // Imgproc.drawContours(contoursImg, listOf(convertReadableArrayToMatOfPoint(square["contour"] as ReadableArray)), 0, Scalar(255.0, 0.0, 0.0), 12)
//             Imgproc.drawContours(contoursImg, contours, square["layer"] as Int, Scalar(0.0, 255.0, 0.0), 24)
//         }
//         if (circleFound) {
//             // println("RTNMyPicker=============================1.3")
//             // Imgproc.drawContours(contoursImg, listOf(maxCircle!!["contour"] as MatOfPoint), 0, Scalar(0.0, 0.0, 255.0), 12)
//             // Imgproc.drawContours(contoursImg, listOf(convertReadableArrayToMatOfPoint(maxCircle!!["contour"] as ReadableArray)), 0, Scalar(255.0, 0.0, 0.0), 12)
//             Imgproc.drawContours(contoursImg, contours, maxCircle!!["layer"] as Int, Scalar(255.0, 0.0, 0.0), 24)
//         } 
//         // else {
//         //     Imgproc.drawContours(contoursImg, contours, -1, Scalar(255.0, 0.0, 0.0), 24)
//         // }

//         // println("RTNMyPicker=============================2")

//         return hashMapOf<String, Any>(
//             "width" to width,
//             "height" to height,
//             "example_str" to "KotlinTest",
//             "example_bool" to false,
//             "example_double" to 6.7,
//             "example_array" to arrayListOf<Any>(
//                 "Good bye",
//                 false,
//                 21.37
//             ),
//             "squaresFound" to squaresFound,
//             "circleFound" to circleFound,
//             // "maxCircle" to (maxCircle ?: emptyMap<String, Any?>())
//             // "squares" to mutableListOf<Map<String, Any?>>(squares)
//         )
        
//     }
// }