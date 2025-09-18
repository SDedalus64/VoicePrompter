package com.audiocoach

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import android.os.Handler
import android.os.Looper
import android.media.ToneGenerator
import android.media.AudioManager
import android.speech.tts.TextToSpeech
import org.json.JSONObject

class AudioCoachModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val handler = Handler(Looper.getMainLooper())
  private var isRunning = false
  private var tts: TextToSpeech? = null
  private var tone: ToneGenerator? = null

  init {
    tts = TextToSpeech(reactContext) { /* status ignored for MVP */ }
    tone = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
  }

  override fun getName() = "AudioCoach"

  override fun onCatalystInstanceDestroy() {
    tts?.shutdown(); tts = null
    tone?.release(); tone = null
    super.onCatalystInstanceDestroy()
  }

  @ReactMethod
  fun startSession(planJson: String, promise: Promise) {
    isRunning = true
    send("status", "engine_started")

    // Parse minimal fields for pre-roll and first cue text
    var preRoll = 200
    var cueText = "Introduce the challenge: selling a service = selling trust."
    try {
      val obj = JSONObject(planJson)
      val policy = obj.optJSONObject("policy")
      preRoll = policy?.optInt("preRollToneMs", preRoll) ?: preRoll
      val segs = obj.optJSONArray("segments")
      if (segs != null && segs.length() > 0) {
        val s0 = segs.optJSONObject(0)
        val prompt = s0?.optString("promptText", null)
        cueText = when {
          prompt != null && prompt.isNotEmpty() -> prompt
          else -> "Next: ${s0?.optString("title", "segment")}"
        }
      } else {
        val fb = policy?.optString("fallbackCueText", null)
        if (fb != null && fb.isNotEmpty()) cueText = fb
      }
    } catch (_: Throwable) {}

    // Tone then TTS
    send("status", "cue_tone")
    tone?.startTone(ToneGenerator.TONE_PROP_BEEP, preRoll)
    handler.postDelayed({
      if (!isRunning) return@postDelayed
      send("cue", cueText)
      tts?.speak(cueText, TextToSpeech.QUEUE_FLUSH, null, "cue1")
    }, preRoll + 50L)

    promise.resolve(null)
  }

  @ReactMethod
  fun stopSession(promise: Promise) {
    isRunning = false
    tts?.stop()
    send("status", "engine_stopped")
    promise.resolve(null)
  }

  private fun send(type: String, msg: String) {
    val params = Arguments.createMap().apply {
      putString("type", type)
      putString("message", msg)
    }
    reactApplicationContext
      .getJSModule(RCTDeviceEventEmitter::class.java)
      .emit("AudioCoachEvent", params)
  }
}
