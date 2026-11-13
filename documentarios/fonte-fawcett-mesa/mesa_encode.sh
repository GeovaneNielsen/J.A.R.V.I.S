set -e
cd "$(dirname "$0")"
OUT=/home/user/J.A.R.V.I.S/documentarios
ffmpeg -loglevel error -y -framerate 15 -i quadros_mesa/%05d.jpg -i trilha.wav -af "loudnorm=I=-16:TP=-2:LRA=11,alimiter=limit=0.84:level=false" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest -movflags +faststart $OUT/fawcett-cidade-z-mesa.mp4
# Short: abertura + Kalapalo + final, vertical
i=0; : > short_list.txt
for seg in "0 33.2" "386.6 32.0" "531.3 9.2"; do set -- $seg
  ffmpeg -loglevel error -y -ss $1 -t $2 -i $OUT/fawcett-cidade-z-mesa.mp4 -c:v libx264 -crf 18 -c:a aac -b:a 192k sseg_$i.mp4; echo "file 'sseg_$i.mp4'" >> short_list.txt; i=$((i+1)); done
ffmpeg -loglevel error -y -f concat -safe 0 -i short_list.txt -c copy short_h_mesa.mp4
ffmpeg -loglevel error -y -i short_h_mesa.mp4 -i mesa_bg.png -filter_complex "[1]scale=-2:1920,crop=1080:1920,boxblur=8[bg];[0]scale=1080*1.42:-2,crop=1080:ih[v];[bg][v]overlay=0:(H-h)/2,format=yuv420p" -c:v libx264 -crf 20 -c:a copy -movflags +faststart $OUT/fawcett-mesa-short.mp4
ls -la $OUT
