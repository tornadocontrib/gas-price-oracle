FROM ubuntu:jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y curl nano git wget nmap net-tools build-essential software-properties-common \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /root

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
  apt-get install -y nodejs

ENV REPO=https://github.com/maticnetwork/maticgasstation
ENV VERSION=ca8c49c24de98dedac7196b1b07068feeebe856a

RUN git clone $REPO && \
  cd maticgasstation && \
  git checkout $VERSION && \
  npm i

WORKDIR /root/maticgasstation

EXPOSE 7000

ENTRYPOINT ["node", "src/index.js"]