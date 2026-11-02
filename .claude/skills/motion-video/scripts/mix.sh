#!/usr/bin/env bash
# Mix final: voz (atrasada VO) + música com ducking + SFX. uso: bash mix.sh narr.wav music.wav sfx.wav saida.wav VO DURACAO
N=$1; M=$2; S=$3; OUT=$4; VO=${5:-0.4}; D=${6:-52}
MS=$(python3 -c "print(int($VO*1000))")
ffmpeg -y -loglevel error -i "$M" -af "aecho=0.8:0.85:60|120:0.25|0.15,highpass=f=28,acompressor=threshold=-18dB:ratio=2.5,loudnorm=I=-18:TP=-1.5" -ar 48000 -ac 2 _music_m.wav
ffmpeg -y -loglevel error -i "$N" -i _music_m.wav -i "$S" -filter_complex \
"[0:a]adelay=$MS|$MS,apad,asplit=2[vo][key];[1:a]volume=0.62[m];[m][key]sidechaincompress=threshold=0.06:ratio=7:release=320[md];[2:a]aformat=channel_layouts=stereo,volume=0.85[s];[vo][md][s]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.97,loudnorm=I=-13:TP=-1" \
-t "$D" -ar 48000 "$OUT" && rm -f _music_m.wav && echo "ok: $OUT"
