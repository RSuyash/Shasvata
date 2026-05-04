FROM python:3.12-slim AS runtime
WORKDIR /repo
COPY services/intelligence-api/requirements.txt ./services/intelligence-api/requirements.txt
RUN pip install --no-cache-dir -r services/intelligence-api/requirements.txt
COPY db/fixtures ./db/fixtures
COPY services/intelligence-api ./services/intelligence-api
ENV PYTHONPATH=/repo/services/intelligence-api/src
EXPOSE 4100
CMD ["uvicorn", "shasvata_intelligence_api.main:app", "--host", "0.0.0.0", "--port", "4100"]
