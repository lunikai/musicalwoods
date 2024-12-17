import sys
from pathlib import Path
################ must have ffmpeg installed for demucs to handle mp3 input
#################### use sudo apt update && sudo apt upgrade; then sudo apt install ffmpeg
import demucs.separate

relative_folder_path = sys.argv[1]
filename = sys.argv[2]
# get absolute path to directory where given audio file resides
# will look smth like (absolutepathto...)/uploads/(timeofupload)
abs_folder_path = str(Path.cwd()) + '/' + relative_folder_path
abs_file_path = abs_folder_path + '/' + filename    # ... /server/uploads/[uploadtime]/filename

# perform music source separation w/ six stems (vocals, drums, bass, guitar, piano, other) on given file
# source file will be read from abs_file_path
# stems will be saved to abs_folder_path/htdemucs_6s/(filename minus extension)
# save as mp3 instead of wav to reduce ram usage on client side
# demucs.separate.main(["-n", "htdemucs_6s", "-o", abs_folder_path, abs_file_path])
demucs.separate.main(["-n", "htdemucs", "-d", "cpu", "-o", abs_folder_path, abs_file_path])


# flush all prior output before final print stmt just in case, to ensure that it gets read & stored separately
sys.stdout.flush()

# separated source stems are saved to abs_folder_path/htdemucs_6s/(filename minus extension)
upload_folder = '/' + abs_folder_path.split('/')[-1]
# resulting_path = upload_folder + '/htdemucs_6s/' + filename[:-4] + '/'    # only works for three-letter file extensions
resulting_path = upload_folder + '/htdemucs/' + filename[:-4] + '/'    # only works for three-letter file extensions
print(resulting_path)
# sys.stdout.flush()    # do i need this?