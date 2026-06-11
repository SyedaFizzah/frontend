import cv2
cap = cv2.VideoCapture("http://192.168.100.10:8080/video")
print("Opened:", cap.isOpened())
ret, frame = cap.read()
print("Frame read:", ret)
cap.release()