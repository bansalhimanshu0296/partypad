cd ../../

#postgres
echo Y | sudo apt-get install postgresql
echo Y | sudo apt-get install libpq-dev

#install python packages
pip install -r requirements.txt