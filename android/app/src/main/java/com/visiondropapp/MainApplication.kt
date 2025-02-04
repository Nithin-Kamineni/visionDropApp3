package com.visiondropapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.oblador.vectoricons.VectorIconsPackage

import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class MainApplication : Application(), ReactApplication {

  companion object {
    init {
      //example
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("example_plugin") { proxy, args -> ExampleFrameProcessorPlugin(proxy, args) }
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("example_kotlin_swift_plugin") { proxy, args -> ExampleKotlinFrameProcessorPlugin(proxy, args) }

      //Microchip
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("microchip_adjustment") { proxy, args -> MicrochipAdjustmentFrameProcessorPlugin(proxy, args) }
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("microchip_led_detection") { proxy, args -> MicrochipLedDetectionFrameProcessorPlugin(proxy, args) }
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("microchip_process_extraction") { proxy, args -> MicrochipProcessExtractionFrameProcessorPlugin(proxy, args) }

    }
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(VectorIconsPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
