import face_recognition
import cv2
import numpy as np
import os

known_face_encoding, known_face_names = [], []
folder_dir = 'students/'
for image in os.listdir(folder_dir):
    if image.endswith('.png') or image.endswith('.jpg') or image.endswith('.jpeg'):
        load_image = face_recognition.load_image_file(f'{folder_dir}{image}')
        encoding = face_recognition.face_encodings(load_image)[0]
        known_face_encoding.append(encoding)
        known_face_names.append(os.path.splitext(image)[0])
students = known_face_names.copy()

print('Choose video:')
videos, idx = {}, 1
folder_dir = 'uploads/'
for video in os.listdir(folder_dir):
    if video.endswith('.mp4'):
        videos[idx] = video
        print(f'{idx}. {video}')
        idx += 1

vid_idx = int(input())
video_capture = cv2.VideoCapture(f'uploads/{videos[vid_idx]}', apiPreference=cv2.CAP_MSMF)
face_locations = []
face_encodings = []
face_names = []
attendees = []
s = True
while True:
    _, frame = video_capture.read()
    if np.size(frame) == 0:
        break
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = small_frame[:, :, ::-1]

    if s:
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encoding, face_encoding)
            name = ""
            face_distance = face_recognition.face_distance(known_face_encoding, face_encoding)
            best_match_index = np.argmin(face_distance)
            if matches[best_match_index]:
                name = known_face_names[best_match_index]

            face_names.append(name)
            if name in known_face_names:
                if name in students:
                    students.remove(name)
                    attendees.append(name)

    for (top, right, bottom, left), name in zip(face_locations, face_names):
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

    imS = cv2.resize(frame, (960, 540))
    cv2.imshow('Video', imS)
    flag=-1
    if(len(face_names)!=0):
        count=0
        for person in face_names:
            if(person=='Unknown'):
                count+=1
        if(count==len(face_names)):
            flag=1
        else:
            flag=0
    if cv2.waitKey(1) & 0xFF==ord('q'):
        break

video_capture.release()
cv2.destroyAllWindows()

import py_db
py_db.insert(videos[vid_idx], attendees)
py_db.update(videos[vid_idx])