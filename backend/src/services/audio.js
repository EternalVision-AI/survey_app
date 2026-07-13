// Google's speech engine (used via EdenAI) expects 16-bit PCM WAV audio.
// Many recorders export 24/32-bit PCM or 32-bit float WAV instead, which Google
// silently misreads (no error, just an empty transcript). This normalizes any
// PCM/float WAV buffer down to 16-bit PCM before it's sent for transcription.

const findChunk = (buffer, id, searchStart) => {
  let offset = searchStart;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkId === id) {
      return { dataStart: offset + 8, size: chunkSize };
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return null;
};

const readSampleAsInt16 = (buffer, offset, bitsPerSample, audioFormat) => {
  if (audioFormat === 3 && bitsPerSample === 32) {
    const sample = buffer.readFloatLE(offset);
    const clamped = Math.max(-1, Math.min(1, sample));
    return Math.round(clamped * 32767);
  }
  if (bitsPerSample === 8) {
    return (buffer.readUInt8(offset) - 128) * 256;
  }
  if (bitsPerSample === 16) {
    return buffer.readInt16LE(offset);
  }
  if (bitsPerSample === 24) {
    const b0 = buffer[offset];
    const b1 = buffer[offset + 1];
    const b2 = buffer[offset + 2];
    let value = (b2 << 16) | (b1 << 8) | b0;
    if (value & 0x800000) {
      value -= 0x1000000;
    }
    return Math.round(value / 256);
  }
  if (bitsPerSample === 32) {
    const value = buffer.readInt32LE(offset);
    return Math.round(value / 65536);
  }
  throw new Error(`Nicht unterstützte WAV-Bittiefe: ${bitsPerSample}`);
};

// Returns the original buffer unchanged if it's already 16-bit PCM WAV
// (or not a WAV file at all), otherwise returns a re-encoded 16-bit PCM buffer.
export function normalizeWavTo16BitPcm(buffer, originalName = "") {
  const looksLikeWav =
    buffer.length > 44 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WAVE";

  if (!looksLikeWav) {
    return buffer;
  }

  const fmtChunk = findChunk(buffer, "fmt ", 12);
  const dataChunk = findChunk(buffer, "data", 12);
  if (!fmtChunk || !dataChunk) {
    return buffer;
  }

  const audioFormat = buffer.readUInt16LE(fmtChunk.dataStart);
  const channels = buffer.readUInt16LE(fmtChunk.dataStart + 2);
  const sampleRate = buffer.readUInt32LE(fmtChunk.dataStart + 4);
  const bitsPerSample = buffer.readUInt16LE(fmtChunk.dataStart + 14);

  const isPcmInt16 = audioFormat === 1 && bitsPerSample === 16;
  if (isPcmInt16) {
    return buffer;
  }

  const bytesPerSample = bitsPerSample / 8;
  const sampleCount = Math.floor(dataChunk.size / bytesPerSample);
  const outData = Buffer.alloc(sampleCount * 2);

  for (let i = 0; i < sampleCount; i += 1) {
    const srcOffset = dataChunk.dataStart + i * bytesPerSample;
    const value = readSampleAsInt16(buffer, srcOffset, bitsPerSample, audioFormat);
    outData.writeInt16LE(Math.max(-32768, Math.min(32767, value)), i * 2);
  }

  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + outData.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM integer
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(outData.length, 40);

  console.log(
    `→ WAV normalisiert (${originalName || "upload"}): ${bitsPerSample}-bit${
      audioFormat === 3 ? " float" : ""
    } → 16-bit PCM`
  );

  return Buffer.concat([header, outData]);
}
