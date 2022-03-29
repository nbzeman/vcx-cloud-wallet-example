FROM ubuntu:18.04

#### Needed Packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends\
        add-apt-key \
        apt-transport-https \
        dirmngr \
        ca-certificates  \
        curl \
         unzip \
        software-properties-common \
        vim \
        supervisor \
        netcat \
        nginx \
        libpq-dev \
        gcc \
        make \
        g++ \
        jq \
        python3-pip \
        pwgen \
        mysql-client
        
# RUN certs
RUN echo '-----BEGIN CERTIFICATE-----\n\
MIIFTjCCAzagAwIBAgIQW/yvIAOqHopNz9tCixyO5zANBgkqhkiG9w0BAQwFADA4\n\
MQswCQYDVQQGEwJDWjEOMAwGA1UEChMFQXZhc3QxGTAXBgNVBAMTEGF2YXN0LXJv\n\
b3QtY2EtczEwHhcNMjExMjA5MTIxMzE4WhcNMzExMjA5MTIyMzE1WjA4MQswCQYD\n\
VQQGEwJDWjEOMAwGA1UEChMFQXZhc3QxGTAXBgNVBAMTEGF2YXN0LXJvb3QtY2Et\n\
czEwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDYzI7dvAPUk0NeKYVV\n\
BbM6FhHViUqECOr7pqg6CvfL3xj5lVBH7TbLVfQjYeVC13vlHtat/6jt0nXWtKws\n\
7CFYoXos4SjHIiGo1WKgSSR8cVKroIJzi5riN8eCwWbJ1qRlwwjvenrAJijpNCVB\n\
zwoCzbBH+MAD7eNsMjHTPZk+v8qYryTkN67Tw7CSYUxnVk+/hv8T8wF5H2oUk2TF\n\
x4P+9Iv2wKPU/C6uA/FnhOd5ejzjV+Nw0U7RWjFvKFFUsidJolV7UoN3LeRanNcX\n\
bryH36X6fPkuC5TjFuGQnPv0/5E1XhbzlCNTLV/6yCvXsOsRJ9X9uh20rcEwJst9\n\
mYY0dDcRQIVgVNGKxRCGuaMrdimndEMyCfGW9dKx400GGHy4FewIcD+yByRytW2j\n\
EK6ot5NZjws7rRSe51u/DkuCrvKTRjAEd+YtNW4fSAHnyxD+4E9iZ1OTM5YdfEft\n\
5g3q5lVLSEPmJeZ28b//GesUXfOC4640mQD5CTUs8QAPkTmYl7x89saB2/JanIuU\n\
56UYqeQvELi2uEb0ZlDa1bIyD6Y98Oj1LC4vWx7rGVxEHRtWvgg6DwLbwfXc5+qG\n\
AMLvMoZ0Mp8bac93QkeGVQdpPivZSAmcUM+7mlJtGCBFp7nrVSQPYgjuxJ/iTEwg\n\
Wk/id0CwJDzfT3gZb8J4CqhIxQIDAQABo1QwUjAOBgNVHQ8BAf8EBAMCAYYwDwYD\n\
VR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUAruwlVlYRum11b0VZaXY1aC9iugwEAYJ\n\
KwYBBAGCNxUBBAMCAQAwDQYJKoZIhvcNAQEMBQADggIBALy6IHlwPOGiin/hdmut\n\
kM1biARLhTz8Ygz4Hhjc25LCkeZZv6ysM4xP0esXDPl55I/gLHo1cpVMFAqZpP7S\n\
OwNrAhjGYz8/ki0+oRXMpl0s4Wv05VhlKbKfuWzsgZZAHw25OXK3ZYmAN6KZ6y/e\n\
yPdxM67sH2wuIjOTonXSiNrv86mfWp9EwKydLQpzbFiDegLnW2QdApobmZfdSXGw\n\
7+DEDG9qJ3JBj/s954kqjV26ZK1seSpqmfjAYTNG2Fju2nKPa7D8+ypMFj0SarOs\n\
JgjylXO5OqDRmwmZRGwlHIifPsw8gBrwfhWNWr58nn72XCblMH2CinL8l7GEmBHt\n\
AMFsZJbYJvZ/o0Kxb7aecDt5vVFbzgoaAX0TqYRUohh0pDP0jgplIzXf0yz5EiTC\n\
vZ1A34zZSEy/COsJKDEYd32Xowb3715XPWDskragm0fODAbfKwa9Pg6CM+cPjEZs\n\
GqchXpPWOfTZN8keHu1iG8p/Qu4uEPCgquvo+t+sFS6zRl6tVzg+eZtvZsijR4AC\n\
ADVEY4AlCXWx5Z4CMoB7HV4WaGLa5u5mfrhLZYls4j02sFNHZWMoLrddt6Kn5Pl7\n\
k00k5RPqJv4K//Odqiy1MqB7m4Ef/FGqCpdu/E83J7OZTSaCvmoW8eeM8elx/V9R\n\
K/eAUZG1CoZGiQWw5uY//dbJ\n\
-----END CERTIFICATE-----\n' > /usr/local/share/ca-certificates/Avast_Root_CA.crt
RUN update-ca-certificates

#### Needed Repos
RUN echo "deb https://repo.sovrin.org/sdk/deb bionic stable" > /etc/apt/sources.list.d/sovrin.list && \
    cnt=0 ;\
    while ! apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 97080EBDA5D46DAF 2>&1; do \
        echo "Waiting 1 second before retrying gpg key download.($cnt/10)" ;\
        sleep 1 ;\
        cnt=$((cnt + 1)); \
        if [ $cnt -ge 10 ] ; then \
            echo "Could not add gpg key. Aborting" ;\
            exit 1 ;\
        fi ;\
    done

# RUN sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 97080EBDA5D46DAF

#### Install Libindy/Sovtoken and Dependencies
COPY install/* /root/install/
COPY config/* /root/config/
COPY data/* /root/data/
COPY server/* /root/server/
COPY web/* /var/www/html/


EXPOSE 3000


# Add Keys and Update apt-get Libraries:
WORKDIR /root/install
RUN apt-get update && \
    apt-get install -y \
      libsodium23 \
      libzmq5 \
      libssl1.0.0 
      
RUN dpkg -i libindy_1.15*.deb
RUN dpkg -i libsovtoken_1.0.5_amd64.deb
RUN dpkg -i libmysqlstorage_0.1.1131_amd64.deb
RUN dpkg -i libvcx_0.10*
RUN apt-get install -f

# NodeJS 10.x install
RUN . /etc/os-release && \
    curl -f -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    echo "deb https://deb.nodesource.com/node_10.x ${UBUNTU_CODENAME} main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs --no-install-recommends
# 

# Install Ngrok
RUN curl -O -s https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip && \
    unzip ngrok-stable-linux-amd64.zip && \
    cp ngrok /usr/local/bin/.

#### Cleanup
# clean up apt lists
RUN rm -rf /var/lib/apt/lists/*

COPY config/supervisord.conf /etc/supervisord.conf
#### Entrypoint
ENTRYPOINT [ "/root/install/install-vcx-portal.sh" ]
