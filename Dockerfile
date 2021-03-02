FROM gcr.io/kaniko-project/executor:slim

FROM node:buster

RUN mkdir /build-crane && \
  cd /build-crane && \
  wget https://github.com/google/go-containerregistry/releases/download/v0.4.0/go-containerregistry_Linux_x86_64.tar.gz && \
  tar -xf *.tar.gz && \
  mv ./crane /usr/local/bin && \
  rm -r /build-crane

ENV PATH $PATH:/kaniko
ENV SSL_CERT_DIR=/kaniko/ssl/certs
ENV CI_USE_KANIKO_AND_CRANE=true

COPY --from=0 /kaniko /kaniko
COPY --from=0 /etc/nsswitch.conf /etc/nsswitch.conf
