import Foundation
import AVFoundation
import React

@objc(AudioCoach)
class AudioCoach: RCTEventEmitter {
  private let session = AVAudioSession.sharedInstance()
  private var engine = AVAudioEngine()
  private var player = AVAudioPlayerNode()
  private let synth = AVSpeechSynthesizer()
  private var plan: SessionPlan?

  struct SessionPlan: Codable { let id: String; let title: String; let segments: [Segment]; let policy: Policy }
  struct Segment: Codable {
    let id, title: String
    let keyPoints: [String]
    let promptType: String
    let targetSecs: Int
    let toleranceSecs: Int?
    let minGapMs: Int
    let cueStyle: String
    let priority: Int
    let promptText: String?
  }
  struct Policy: Codable {
    let interruptMode: String
    let maxRambleSecs: Int
    let fallbackCueText: String?
    let preRollToneMs: Int
    let asrEnabled: Bool
    let ttsVoiceId: String?
  }

  override static func requiresMainQueueSetup() -> Bool { true }
  override func supportedEvents() -> [String]! { ["AudioCoachEvent"] }

  @objc func startSession(_ planJson: NSString,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) {
    do {
      try session.setCategory(.playAndRecord, options: [.defaultToSpeaker, .allowBluetooth, .mixWithOthers])
      try session.setActive(true)

      if engine.isRunning { engine.stop() }
      engine = AVAudioEngine()
      player = AVAudioPlayerNode()
      engine.attach(player)
      let outFormat = engine.mainMixerNode.outputFormat(forBus: 0)
      engine.connect(player, to: engine.mainMixerNode, format: outFormat)

      // VAD input tap (placeholder)
      let input = engine.inputNode
      let bus = 0
      let format = input.outputFormat(forBus: bus)
      input.installTap(onBus: bus, bufferSize: 1024, format: format) { _, _ in
        // TODO: VAD / silence detection
      }

      if let data = (planJson as String).data(using: .utf8) {
        self.plan = try JSONDecoder().decode(SessionPlan.self, from: data)
      }

      try engine.start()
      sendStatus("engine_started")

      // Naive: schedule first cue after 2s (replace with VAD-gated scheduling)
      DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
        guard let self = self else { return }
        let (text, preRoll) = self.nextCueTextAndTone()
        self.playToneThenTTS(text: text, preRollMs: preRoll)
      }

      resolve(nil)
    } catch {
      reject("start_failed", error.localizedDescription, error)
    }
  }

  @objc func stopSession(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    engine.stop()
    do { try session.setActive(false) } catch {}
    sendStatus("engine_stopped")
    resolve(nil)
  }

  private func sendStatus(_ msg: String) {
    sendEvent(withName: "AudioCoachEvent", body: ["type":"status","message":msg])
  }

  private func playToneThenTTS(text: String, preRollMs: Int) {
    // Tone
    sendStatus("cue_tone")
    playBeep(durationMs: preRollMs)
    // Speak after tone
    let delay = DispatchTime.now() + .milliseconds(preRollMs + 50)
    DispatchQueue.main.asyncAfter(deadline: delay) { [weak self] in
      guard let self = self else { return }
      let utt = AVSpeechUtterance(string: text)
      if let voiceId = self.plan?.policy.ttsVoiceId, let voice = AVSpeechSynthesisVoice(identifier: voiceId) {
        utt.voice = voice
      }
      self.synth.speak(utt)
      self.sendEvent(withName: "AudioCoachEvent", body: ["type":"cue","message":text])
    }
  }

  private func playBeep(durationMs: Int, frequency: Double = 880.0) {
    let mixerFormat = engine.mainMixerNode.outputFormat(forBus: 0)
    let sampleRate = mixerFormat.sampleRate
    let durationSec = max(0.05, Double(durationMs) / 1000.0)
    let frames = AVAudioFrameCount(sampleRate * durationSec)
    guard let buffer = AVAudioPCMBuffer(pcmFormat: mixerFormat, frameCapacity: frames) else { return }
    buffer.frameLength = frames
    let channels = Int(mixerFormat.channelCount)
    guard let data = buffer.floatChannelData else { return }
    let thetaInc = 2.0 * Double.pi * frequency / sampleRate
    let amplitude: Float = 0.15
    for frame in 0 ..< Int(frames) {
      let sample = sin(Double(frame) * thetaInc)
      let value = amplitude * Float(sample)
      for ch in 0 ..< channels {
        data[ch][frame] = value
      }
    }
    player.stop()
    player.scheduleBuffer(buffer, at: nil, options: .interrupts, completionHandler: nil)
    if !player.isPlaying { player.play() }
  }

  private func nextCueTextAndTone() -> (String, Int) {
    let preRoll = plan?.policy.preRollToneMs ?? 200
    guard let p = plan else { return ("Introduce the challenge: selling a service = selling trust.", preRoll) }
    if let first = p.segments.first {
      if let t = first.promptText { return (t, preRoll) }
      // Fallback to segment title if no prompt text provided
      return ("Next: \(first.title)", preRoll)
    }
    if let fb = p.policy.fallbackCueText { return (fb, preRoll) }
    return ("Start the session", preRoll)
  }
}
