import {AudioModule} from "expo-audio";
import LiveAudioStream from "react-native-live-audio-stream";

import {base64ToUint8Array} from "@/utils/base64";

export const AUDIO_SAMPLE_RATE = 16000;

const AUDIO_SOURCE_VOICE_RECOGNITION = 6;

export const requestMicrophonePermission = async (): Promise<boolean> => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    return status.granted;
};

export const startAudioStream = (onChunk: (chunk: Uint8Array) => void): void => {
    LiveAudioStream.init({
        sampleRate: AUDIO_SAMPLE_RATE,
        channels: 1,
        bitsPerSample: 16,
        audioSource: AUDIO_SOURCE_VOICE_RECOGNITION,
        bufferSize: 2048,
        wavFile: "reading-speed-stream.wav",
    });

    LiveAudioStream.on("data", (base64Chunk: string) => {
        onChunk(base64ToUint8Array(base64Chunk));
    });

    LiveAudioStream.start();
};

export const stopAudioStream = (): void => {
    LiveAudioStream.stop();
};
