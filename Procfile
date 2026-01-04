web: sh -c 'export FLASK_APP=src/backend/app_saas.py && flask init-db && gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 src.backend.app_saas:app'
