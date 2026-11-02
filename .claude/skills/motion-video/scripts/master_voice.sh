#!/usr/bin/env bash
# Masteriza a voz. uso: bash master_voice.sh entrada.wav saida.wav [atempo]
# atempo 1.05~1.10 se a fala passar de ~55s.
AT=${3:-1.0}
ffmpeg -y -loglevel error -i "$1" -af "atempo=$AT,highpass=f=70,equalizer=f=140:t=q:w=1:g=3,equalizer=f=320:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1:g=-2.5,equalizer=f=8000:t=q:w=1:g=-2,acompressor=threshold=-20dB:ratio=3.5:makeup=3,aecho=0.85:0.9:28:0.08,loudnorm=I=-14:TP=-1.3" -ar 48000 -ac 2 "$2" && echo "ok: $2"
