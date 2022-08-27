@echo
cd doctor-interface
start cmd /k "npm start"
timeout 2
cd ../pharmacy-interface
start cmd /k "npm start"
timeout 5
cd ../patient-interface
start cmd /k "npm start"